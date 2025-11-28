"use server";

import { db } from "@/lib/db";
import {
  freelancerProfiles,
  users,
  jobPosts,
  jobResponses,
  bookingRequests,
} from "@/lib/db/schema";
import { requireRole, updateUserMetadata } from "@/lib/auth";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createFreelancerProfile(data: {
  name: string;
  location: string;
  photoUrl?: string;
  equipmentList: string[];
  portfolioLinks: string[];
  whatsappNumber: string;
  idProofUrl?: string;
}) {
  await requireRole("freelancer");

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Check if user exists in database
    const userExists = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    // If user doesn't exist (webhook might not have fired in dev), create it
    if (!userExists) {
      const { clerkClient } = await import("@clerk/nextjs/server");
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);

      await db.insert(users).values({
        id: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        role: "freelancer",
        onboardingStatus: "incomplete",
      });
    }

    // Create freelancer profile
    const [profile] = await db
      .insert(freelancerProfiles)
      .values({
        userId,
        ...data,
      })
      .returning();

    // Update user onboarding status
    await db
      .update(users)
      .set({
        onboardingStatus: "complete",
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Update Clerk metadata
    await updateUserMetadata(userId, { onboardingStatus: "complete" });

    revalidatePath("/freelancer");

    return { success: true, profile };
  } catch (error) {
    console.error("Error creating freelancer profile:", error);
    throw new Error("Failed to create profile");
  }
}

export async function getFreelancerProfile() {
  await requireRole("freelancer");

  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const profile = await db.query.freelancerProfiles.findFirst({
    where: eq(freelancerProfiles.userId, userId),
  });

  return profile;
}

export async function getAllActiveJobs() {
  await requireRole("freelancer");

  const jobs = await db.query.jobPosts.findMany({
    where: eq(jobPosts.isActive, true),
    orderBy: (jobPosts, { desc }) => [desc(jobPosts.createdAt)],
    with: {
      company: {
        with: {
          companyProfile: true,
        },
      },
    },
  });

  return jobs;
}

export async function respondToJob(data: {
  jobId: string;
  status: "interested" | "not_interested";
  message?: string;
  proposedPrice?: string;
}) {
  await requireRole("freelancer");

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check verification status
  const profile = await db.query.freelancerProfiles.findFirst({
    where: eq(freelancerProfiles.userId, userId),
  });

  if (!profile || profile.verificationStatus !== "verified") {
    throw new Error(
      "Your profile must be verified before you can apply for jobs. Please wait for admin approval."
    );
  }

  // Check if already responded
  const existing = await db.query.jobResponses.findFirst({
    where: and(
      eq(jobResponses.jobId, data.jobId),
      eq(jobResponses.freelancerId, userId)
    ),
  });

  if (existing) {
    throw new Error("You have already responded to this job");
  }

  const [response] = await db
    .insert(jobResponses)
    .values({
      jobId: data.jobId,
      freelancerId: userId,
      status: data.status,
      message: data.message,
      proposedPrice: data.proposedPrice,
    })
    .returning();

  revalidatePath("/freelancer");

  return { success: true, response };
}

export async function getFreelancerBookings() {
  await requireRole("freelancer");

  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  const bookings = await db.query.bookingRequests.findMany({
    where: eq(bookingRequests.freelancerId, userId),
    orderBy: (bookingRequests, { desc }) => [desc(bookingRequests.createdAt)],
    with: {
      job: true,
      company: {
        with: {
          companyProfile: true,
        },
      },
      payments: true,
    },
  });

  return bookings;
}

export async function respondToBooking(data: {
  bookingId: string;
  accept: boolean;
}) {
  await requireRole("freelancer");

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify booking belongs to freelancer
  const booking = await db.query.bookingRequests.findFirst({
    where: and(
      eq(bookingRequests.id, data.bookingId),
      eq(bookingRequests.freelancerId, userId)
    ),
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  const [updated] = await db
    .update(bookingRequests)
    .set({
      status: data.accept ? "accepted" : "rejected",
      updatedAt: new Date(),
    })
    .where(eq(bookingRequests.id, data.bookingId))
    .returning();

  revalidatePath("/freelancer/bookings");

  return { success: true, booking: updated };
}

export async function getJobById(jobId: string) {
  await requireRole("freelancer");

  const job = await db.query.jobPosts.findFirst({
    where: eq(jobPosts.id, jobId),
    with: {
      company: {
        with: {
          companyProfile: true,
        },
      },
    },
  });

  return job;
}

export async function hasRespondedToJob(jobId: string) {
  await requireRole("freelancer");

  const { userId } = await auth();

  if (!userId) {
    return false;
  }

  const response = await db.query.jobResponses.findFirst({
    where: and(
      eq(jobResponses.jobId, jobId),
      eq(jobResponses.freelancerId, userId)
    ),
  });

  return !!response;
}

export async function getMyJobResponse(jobId: string) {
  await requireRole("freelancer");

  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const response = await db.query.jobResponses.findFirst({
    where: and(
      eq(jobResponses.jobId, jobId),
      eq(jobResponses.freelancerId, userId)
    ),
  });

  return response;
}

export async function getMyApplications() {
  await requireRole("freelancer");

  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  const applications = await db.query.jobResponses.findMany({
    where: eq(jobResponses.freelancerId, userId),
    orderBy: (jobResponses, { desc }) => [desc(jobResponses.createdAt)],
    with: {
      job: {
        with: {
          company: {
            with: {
              companyProfile: true,
            },
          },
          bookingRequests: {
            where: eq(bookingRequests.freelancerId, userId),
          },
        },
      },
    },
  });

  return applications;
}

export async function getApplicationById(applicationId: string) {
  await requireRole("freelancer");

  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const application = await db.query.jobResponses.findFirst({
    where: and(
      eq(jobResponses.id, applicationId),
      eq(jobResponses.freelancerId, userId)
    ),
    with: {
      job: {
        with: {
          company: {
            with: {
              companyProfile: true,
            },
          },
          bookingRequests: {
            where: eq(bookingRequests.freelancerId, userId),
          },
        },
      },
    },
  });

  return application;
}

export async function withdrawApplication(responseId: string) {
  await requireRole("freelancer");

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify the application belongs to the freelancer
  const application = await db.query.jobResponses.findFirst({
    where: and(
      eq(jobResponses.id, responseId),
      eq(jobResponses.freelancerId, userId)
    ),
    with: {
      job: {
        with: {
          bookingRequests: true,
        },
      },
    },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  // Check if there's already a booking request for this application
  const hasBooking = application.job.bookingRequests?.some(
    (booking) => booking.freelancerId === userId
  );

  if (hasBooking) {
    throw new Error(
      "Cannot withdraw application - you have an active booking request for this job"
    );
  }

  // Delete the application
  await db.delete(jobResponses).where(eq(jobResponses.id, responseId));

  revalidatePath("/freelancer/applications");
  revalidatePath("/freelancer");

  return { success: true };
}
