"use server";

import { db } from "@/lib/db";
import {
  jobPosts,
  jobResponses,
  bookingRequests,
  payments,
} from "@/lib/db/schema";
import { requireRole } from "@/lib/auth";
import { auth } from "@clerk/nextjs/server";
import { eq, and, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createJobPost(data: {
  title: string;
  description: string;
  dates: string[];
  location: string;
  locationFormatted?: string | null;
  locationCity?: string | null;
  locationState?: string | null;
  locationCountry?: string | null;
  locationLatitude?: string | null;
  locationLongitude?: string | null;
  locationPlaceId?: string | null;
  budget?: string;
  jobType: string;
  time?: string;
  contractContentPosting: boolean;
  contractAdvancePayment: boolean;
  contractPaymentAfterShot: boolean;
  contractContentOwnership: boolean;
  contractSdCard: boolean;
  contractAdditionalDetails?: string;
}) {
  await requireRole("company");

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const [job] = await db
    .insert(jobPosts)
    .values({
      companyId: userId,
      ...data,
    })
    .returning();

  revalidatePath("/company");
  revalidatePath("/freelancer");

  return { success: true, job };
}

export async function getCompanyJobs() {
  await requireRole("company");

  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  const jobs = await db.query.jobPosts.findMany({
    where: eq(jobPosts.companyId, userId),
    orderBy: (jobPosts, { desc }) => [desc(jobPosts.createdAt)],
    with: {
      responses: {
        with: {
          freelancer: {
            with: {
              freelancerProfile: true,
            },
          },
        },
      },
    },
  });

  return jobs;
}

export async function getJobResponses(jobId: string) {
  await requireRole("company");

  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  // Verify job belongs to company
  const job = await db.query.jobPosts.findFirst({
    where: and(eq(jobPosts.id, jobId), eq(jobPosts.companyId, userId)),
  });

  if (!job) {
    throw new Error("Job not found");
  }

  const responses = await db.query.jobResponses.findMany({
    where: eq(jobResponses.jobId, jobId),
    with: {
      freelancer: {
        with: {
          freelancerProfile: true,
        },
      },
    },
    orderBy: (jobResponses, { desc }) => [desc(jobResponses.createdAt)],
  });

  return responses;
}

export async function createBookingRequest(data: {
  jobId: string;
  freelancerId: string;
}) {
  await requireRole("company");

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Get job details for contract
  const job = await db.query.jobPosts.findFirst({
    where: and(eq(jobPosts.id, data.jobId), eq(jobPosts.companyId, userId)),
  });

  if (!job) {
    throw new Error("Job not found");
  }

  // Create contract details object
  const contractDetails = {
    title: job.title,
    description: job.description,
    dates: job.dates,
    location: job.location,
    budget: job.budget,
    jobType: job.jobType,
    time: job.time,
    contractContentPosting: job.contractContentPosting,
    contractAdvancePayment: job.contractAdvancePayment,
    contractPaymentAfterShot: job.contractPaymentAfterShot,
    contractContentOwnership: job.contractContentOwnership,
    contractSdCard: job.contractSdCard,
    contractAdditionalDetails: job.contractAdditionalDetails,
  };

  const [booking] = await db
    .insert(bookingRequests)
    .values({
      jobId: data.jobId,
      companyId: userId,
      freelancerId: data.freelancerId,
      contractDetails,
    })
    .returning();

  // Auto-deactivate job and mark as booked
  await db
    .update(jobPosts)
    .set({
      status: "booked",
      bookedFreelancerId: data.freelancerId,
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(jobPosts.id, data.jobId));

  revalidatePath("/company/bookings");
  revalidatePath("/company/responses");
  revalidatePath("/company");
  revalidatePath("/freelancer");

  return { success: true, booking };
}

export async function getCompanyBookings() {
  await requireRole("company");

  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  const bookings = await db.query.bookingRequests.findMany({
    where: eq(bookingRequests.companyId, userId),
    orderBy: (bookingRequests, { desc }) => [desc(bookingRequests.createdAt)],
    with: {
      job: true,
      freelancer: {
        with: {
          freelancerProfile: true,
        },
      },
      payments: true,
    },
  });

  return bookings;
}

export async function markBookingAsPaid(data: {
  bookingId: string;
  amount: string;
  notes?: string;
}) {
  await requireRole("company");

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify booking belongs to company
  const booking = await db.query.bookingRequests.findFirst({
    where: and(
      eq(bookingRequests.id, data.bookingId),
      eq(bookingRequests.companyId, userId)
    ),
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Create payment record
  await db.insert(payments).values({
    bookingId: data.bookingId,
    amount: data.amount,
    paidAt: new Date(),
    markedBy: userId,
    notes: data.notes,
  });

  // Update booking status
  await db
    .update(bookingRequests)
    .set({
      status: "completed",
      updatedAt: new Date(),
    })
    .where(eq(bookingRequests.id, data.bookingId));

  revalidatePath("/company/bookings");

  return { success: true };
}

export async function toggleJobStatus(jobId: string) {
  await requireRole("company");

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const job = await db.query.jobPosts.findFirst({
    where: and(eq(jobPosts.id, jobId), eq(jobPosts.companyId, userId)),
  });

  if (!job) {
    throw new Error("Job not found");
  }

  await db
    .update(jobPosts)
    .set({
      isActive: !job.isActive,
      status: !job.isActive ? "active" : job.status,
      updatedAt: new Date(),
    })
    .where(eq(jobPosts.id, jobId));

  revalidatePath("/company");

  return { success: true };
}

// Cancel booking (Company or Freelancer can cancel)
export async function cancelBooking(bookingId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Find the booking
  const booking = await db.query.bookingRequests.findFirst({
    where: eq(bookingRequests.id, bookingId),
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Check if user is authorized (company or freelancer)
  if (booking.companyId !== userId && booking.freelancerId !== userId) {
    throw new Error("Unauthorized to cancel this booking");
  }

  // Update booking status to rejected/cancelled
  await db
    .update(bookingRequests)
    .set({
      status: "rejected",
      updatedAt: new Date(),
    })
    .where(eq(bookingRequests.id, bookingId));

  // Reactivate the job if cancelled
  await db
    .update(jobPosts)
    .set({
      status: "active",
      bookedFreelancerId: null,
      isActive: true,
      updatedAt: new Date(),
    })
    .where(eq(jobPosts.id, booking.jobId));

  revalidatePath("/company/bookings");
  revalidatePath("/freelancer/bookings");
  revalidatePath("/company");
  revalidatePath("/freelancer");

  return { success: true };
}

// Mark job as completed
export async function completeJob(jobId: string) {
  await requireRole("company");

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const job = await db.query.jobPosts.findFirst({
    where: and(eq(jobPosts.id, jobId), eq(jobPosts.companyId, userId)),
  });

  if (!job) {
    throw new Error("Job not found");
  }

  await db
    .update(jobPosts)
    .set({
      status: "completed",
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(jobPosts.id, jobId));

  // Update booking to completed
  await db
    .update(bookingRequests)
    .set({
      status: "completed",
      updatedAt: new Date(),
    })
    .where(eq(bookingRequests.jobId, jobId));

  revalidatePath("/company");
  revalidatePath("/freelancer");

  return { success: true };
}
