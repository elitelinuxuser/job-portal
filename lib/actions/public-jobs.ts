"use server";

import { db } from "@/lib/db";
import { jobPosts, jobResponses, users } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";

export type PublicJobData = Awaited<ReturnType<typeof getPublicJobById>>;

export async function getPublicJobById(jobId: string) {
  const { userId } = await auth();

  const job = await db.query.jobPosts.findFirst({
    where: eq(jobPosts.id, jobId),
    with: {
      company: {
        with: {
          companyProfile: true,
        },
      },
      responses: true,
    },
  });

  if (!job) {
    return null;
  }

  // If user is logged in, check their relationship to the job
  let userRole: "company" | "freelancer" | "admin" | null = null;
  let hasResponded = false;
  let response = null;
  let isOwner = false;
  let isVerified = false;

  if (userId) {
    // Get user details
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        freelancerProfile: true,
      },
    });

    if (user) {
      userRole = user.role;

      // Check if user is the owner (company)
      if (job.companyId === userId) {
        isOwner = true;
      }

      // Check freelancer specifics
      if (user.role === "freelancer") {
        isVerified = user.freelancerProfile?.verificationStatus === "verified";

        const existingResponse = await db.query.jobResponses.findFirst({
          where: and(
            eq(jobResponses.jobId, jobId),
            eq(jobResponses.freelancerId, userId),
          ),
        });

        if (existingResponse) {
          hasResponded = true;
          response = existingResponse;
        }
      }
    }
  }

  return {
    job,
    userContext: {
      isAuthenticated: !!userId,
      userId,
      userRole,
      isOwner,
      hasResponded,
      response,
      isVerified,
    },
  };
}
