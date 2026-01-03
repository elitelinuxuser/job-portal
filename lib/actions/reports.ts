"use server";

import { db } from "@/lib/db";
import {
  reports,
  jobPosts,
  companyProfiles,
  freelancerProfiles,
  users,
} from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { ReportType } from "@/lib/constants/report-reasons";

export async function createReport(data: {
  reportType: ReportType;
  targetId: string;
  reason: string;
  description?: string;
}) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if user already reported this target
  const existingReport = await db.query.reports.findFirst({
    where: and(
      eq(reports.targetId, data.targetId),
      eq(reports.reportedBy, userId),
      eq(reports.reportType, data.reportType)
    ),
  });

  if (existingReport) {
    return { success: false, error: "You have already reported this" };
  }

  const [report] = await db
    .insert(reports)
    .values({
      reportType: data.reportType,
      targetId: data.targetId,
      reportedBy: userId,
      reason: data.reason,
      description: data.description,
    })
    .returning();

  return { success: true, report };
}

// Admin functions
export async function getReports(status?: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if user is admin
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized - Admin access required");
  }

  const allReports = await db.query.reports.findMany({
    where: status
      ? eq(
          reports.status,
          status as "pending" | "reviewed" | "resolved" | "dismissed"
        )
      : undefined,
    orderBy: [desc(reports.createdAt)],
  });

  // Enrich reports with target details
  const enrichedReports = await Promise.all(
    allReports.map(async (report) => {
      let targetDetails: Record<string, unknown> = {};

      if (report.reportType === "job_post") {
        const job = await db.query.jobPosts.findFirst({
          where: eq(jobPosts.id, report.targetId),
          with: {
            company: {
              with: {
                companyProfile: true,
              },
            },
          },
        });
        targetDetails = {
          title: job?.title,
          companyName: job?.company?.companyProfile?.companyName,
          isActive: job?.isActive,
        };
      } else if (report.reportType === "freelancer") {
        const freelancer = await db.query.freelancerProfiles.findFirst({
          where: eq(freelancerProfiles.userId, report.targetId),
        });
        targetDetails = {
          name: freelancer?.name,
          location: freelancer?.location,
          isActive: freelancer?.isActive,
        };
      } else if (report.reportType === "company") {
        const company = await db.query.companyProfiles.findFirst({
          where: eq(companyProfiles.userId, report.targetId),
        });
        targetDetails = {
          companyName: company?.companyName,
          contactPersonName: company?.contactPersonName,
          isActive: company?.isActive,
        };
      }

      // Get reporter details
      const reporter = await db.query.users.findFirst({
        where: eq(users.id, report.reportedBy),
      });

      return {
        ...report,
        targetDetails,
        reporterEmail: reporter?.email,
      };
    })
  );

  return enrichedReports;
}

export async function updateReportStatus(data: {
  reportId: string;
  status: "reviewed" | "resolved" | "dismissed";
  adminNotes?: string;
}) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if user is admin
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized - Admin access required");
  }

  const [updatedReport] = await db
    .update(reports)
    .set({
      status: data.status,
      reviewedBy: userId,
      reviewedAt: new Date(),
      adminNotes: data.adminNotes,
      updatedAt: new Date(),
    })
    .where(eq(reports.id, data.reportId))
    .returning();

  revalidatePath("/admin/reports");

  return { success: true, report: updatedReport };
}

export async function deactivateJobPost(data: {
  jobId: string;
  reason: string;
  reportId?: string;
}) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if user is admin
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized - Admin access required");
  }

  await db
    .update(jobPosts)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(jobPosts.id, data.jobId));

  // If there's a related report, mark it as resolved
  if (data.reportId) {
    await db
      .update(reports)
      .set({
        status: "resolved",
        reviewedBy: userId,
        reviewedAt: new Date(),
        adminNotes: `Job post deactivated. Reason: ${data.reason}`,
        updatedAt: new Date(),
      })
      .where(eq(reports.id, data.reportId));
  }

  revalidatePath("/admin/reports");
  revalidatePath("/freelancer");

  return { success: true };
}

export async function deactivateFreelancerProfile(data: {
  freelancerUserId: string;
  reason: string;
  reportId?: string;
}) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if user is admin
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized - Admin access required");
  }

  await db
    .update(freelancerProfiles)
    .set({
      isActive: false,
      deactivatedAt: new Date(),
      deactivatedBy: userId,
      deactivationReason: data.reason,
      updatedAt: new Date(),
    })
    .where(eq(freelancerProfiles.userId, data.freelancerUserId));

  // If there's a related report, mark it as resolved
  if (data.reportId) {
    await db
      .update(reports)
      .set({
        status: "resolved",
        reviewedBy: userId,
        reviewedAt: new Date(),
        adminNotes: `Freelancer profile deactivated. Reason: ${data.reason}`,
        updatedAt: new Date(),
      })
      .where(eq(reports.id, data.reportId));
  }

  revalidatePath("/admin/reports");

  return { success: true };
}

export async function deactivateCompanyProfile(data: {
  companyUserId: string;
  reason: string;
  reportId?: string;
}) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if user is admin
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized - Admin access required");
  }

  // Deactivate the company profile
  await db
    .update(companyProfiles)
    .set({
      isActive: false,
      deactivatedAt: new Date(),
      deactivatedBy: userId,
      deactivationReason: data.reason,
      updatedAt: new Date(),
    })
    .where(eq(companyProfiles.userId, data.companyUserId));

  // Deactivate ALL job posts from this company
  await db
    .update(jobPosts)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(jobPosts.companyId, data.companyUserId));

  // If there's a related report, mark it as resolved
  if (data.reportId) {
    await db
      .update(reports)
      .set({
        status: "resolved",
        reviewedBy: userId,
        reviewedAt: new Date(),
        adminNotes: `Company profile deactivated (all job posts also deactivated). Reason: ${data.reason}`,
        updatedAt: new Date(),
      })
      .where(eq(reports.id, data.reportId));
  }

  revalidatePath("/admin/reports");
  revalidatePath("/freelancer");

  return { success: true };
}

export async function reactivateProfile(data: {
  type: "freelancer" | "company" | "job_post";
  targetId: string;
}) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if user is admin
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized - Admin access required");
  }

  if (data.type === "freelancer") {
    await db
      .update(freelancerProfiles)
      .set({
        isActive: true,
        deactivatedAt: null,
        deactivatedBy: null,
        deactivationReason: null,
        updatedAt: new Date(),
      })
      .where(eq(freelancerProfiles.userId, data.targetId));
  } else if (data.type === "company") {
    await db
      .update(companyProfiles)
      .set({
        isActive: true,
        deactivatedAt: null,
        deactivatedBy: null,
        deactivationReason: null,
        updatedAt: new Date(),
      })
      .where(eq(companyProfiles.userId, data.targetId));
  } else if (data.type === "job_post") {
    await db
      .update(jobPosts)
      .set({
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(jobPosts.id, data.targetId));
  }

  revalidatePath("/admin/reports");

  return { success: true };
}
