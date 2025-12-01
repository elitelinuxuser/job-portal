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
import type { JobType } from "@/lib/constants/job-types";

export interface Job {
  title: string;
  description: string;
  dates: Array<{ date: string; startTime?: string; endTime?: string }>;
  location: string;
  locationFormatted?: string | null;
  locationCity?: string | null;
  locationState?: string | null;
  locationCountry?: string | null;
  locationLatitude?: string | null;
  locationLongitude?: string | null;
  locationPlaceId?: string | null;
  budget?: string;
  jobTypes: JobType[];
  contractContentPosting: boolean;
  contractAdvancePayment: boolean;
  contractPaymentAfterShot: boolean;
  contractContentOwnership: boolean;
  contractSdCard: boolean;
  contractAdditionalDetails?: string;
}

export async function createJobPost(data: Job) {
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

  // For each job, fetch booking requests and attach them to responses
  const jobsWithBookingRequests = await Promise.all(
    jobs.map(async (job) => {
      const responsesWithBookings = await Promise.all(
        job.responses.map(async (response) => {
          // Find booking request for this job and freelancer
          const bookingRequest = await db.query.bookingRequests.findFirst({
            where: and(
              eq(bookingRequests.jobId, job.id),
              eq(bookingRequests.freelancerId, response.freelancerId)
            ),
          });

          return {
            ...response,
            bookingRequest: bookingRequest || null,
          };
        })
      );

      return {
        ...job,
        responses: responsesWithBookings,
      };
    })
  );

  return jobsWithBookingRequests;
}

export async function getJobPostById(jobId: string) {
  await requireRole("company");

  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const job = await db.query.jobPosts.findFirst({
    where: and(eq(jobPosts.id, jobId), eq(jobPosts.companyId, userId)),
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

  return job || null;
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
  customBudget?: number;
  proposedPrice?: number;
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

  // Check if booking request already exists
  const existingBooking = await db.query.bookingRequests.findFirst({
    where: and(
      eq(bookingRequests.jobId, data.jobId),
      eq(bookingRequests.freelancerId, data.freelancerId)
    ),
  });

  if (existingBooking) {
    return {
      success: false,
      error: "Booking request already exists for this freelancer",
    };
  }

  // Determine budget: customBudget > proposedPrice > job.budget
  const finalBudget = data.customBudget ?? data.proposedPrice ?? job.budget;

  // Create contract details object
  const contractDetails = {
    title: job.title,
    description: job.description,
    dates: job.dates,
    location: job.location,
    budget: finalBudget,
    jobTypes: job.jobTypes,
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

export async function updateBookingRequest(data: {
  bookingId: string;
  customBudget: number;
}) {
  await requireRole("company");

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Get existing booking request
  const existingBooking = await db.query.bookingRequests.findFirst({
    where: and(
      eq(bookingRequests.id, data.bookingId),
      eq(bookingRequests.companyId, userId)
    ),
  });

  if (!existingBooking) {
    return {
      success: false,
      error: "Booking request not found",
    };
  }

  // Only allow updating pending bookings
  if (existingBooking.status !== "pending") {
    return {
      success: false,
      error: "Can only update pending booking requests",
    };
  }

  // Update contract details with new budget
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatedContractDetails = {
    ...(existingBooking.contractDetails as any),
    budget: data.customBudget,
  };

  // Update the booking request
  const [updatedBooking] = await db
    .update(bookingRequests)
    .set({
      contractDetails: updatedContractDetails,
      updatedAt: new Date(),
    })
    .where(eq(bookingRequests.id, data.bookingId))
    .returning();

  revalidatePath("/company/responses");
  revalidatePath("/company");

  return { success: true, booking: updatedBooking };
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
    status: "awaiting_confirmation",
    paidBy: userId,
    paymentNotes: data.notes,
    awaitingConfirmationAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
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

export async function markResponseAsViewed(responseId: string) {
  await requireRole("company");

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify the response belongs to a job owned by this company
  const response = await db.query.jobResponses.findFirst({
    where: eq(jobResponses.id, responseId),
    with: {
      job: true,
    },
  });

  if (!response || response.job.companyId !== userId) {
    throw new Error("Response not found or unauthorized");
  }

  // Only mark as viewed if not already viewed
  if (!response.viewedAt) {
    await db
      .update(jobResponses)
      .set({
        viewedAt: new Date(),
      })
      .where(eq(jobResponses.id, responseId));

    revalidatePath("/company/responses");
  }

  return { success: true };
}

// Payment Management Actions for Company

export async function getCompanyPayments() {
  await requireRole("company");

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Get all payments for bookings created by this company
  const allPayments = await db.query.payments.findMany({
    with: {
      booking: {
        with: {
          job: true,
          freelancer: {
            with: {
              freelancerProfile: true,
            },
          },
        },
      },
    },
    orderBy: (payments, { desc }) => [desc(payments.createdAt)],
  });

  // Filter payments where the booking belongs to this company
  const companyPayments = allPayments.filter(
    (payment) => payment.booking.companyId === userId
  );

  return companyPayments;
}

export async function payPaymentRequest(data: {
  paymentId: string;
  paymentMode: "cash" | "upi" | "net_banking";
  notes?: string;
}) {
  await requireRole("company");

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify payment belongs to company and is in pending state
  const payment = await db.query.payments.findFirst({
    where: eq(payments.id, data.paymentId),
    with: {
      booking: true,
    },
  });

  if (!payment || payment.booking.companyId !== userId) {
    throw new Error("Payment not found");
  }

  if (payment.status !== "pending") {
    throw new Error("Payment must be in pending state");
  }

  const [updated] = await db
    .update(payments)
    .set({
      status: "paid",
      paymentMode: data.paymentMode,
      paidBy: userId,
      paidAt: new Date(),
      paymentNotes: data.notes || null,
      updatedAt: new Date(),
    })
    .where(eq(payments.id, data.paymentId))
    .returning();

  revalidatePath("/company/payments");
  revalidatePath(`/company/bookings/${payment.booking.id}`);

  return { success: true, payment: updated };
}

export async function declinePaymentRequest(data: {
  paymentId: string;
  reason: string;
}) {
  await requireRole("company");

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify payment belongs to company and is in pending state
  const payment = await db.query.payments.findFirst({
    where: eq(payments.id, data.paymentId),
    with: {
      booking: true,
    },
  });

  if (!payment || payment.booking.companyId !== userId) {
    throw new Error("Payment not found");
  }

  if (payment.status !== "pending") {
    throw new Error("Payment must be in pending state to decline");
  }

  const [updated] = await db
    .update(payments)
    .set({
      status: "declined",
      declineReason: data.reason,
      updatedAt: new Date(),
    })
    .where(eq(payments.id, data.paymentId))
    .returning();

  revalidatePath("/company/payments");

  return { success: true, payment: updated };
}

export async function createDirectPayment(data: {
  bookingId: string;
  amount: number;
  paymentMode: "cash" | "upi" | "net_banking";
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

  // Create direct payment (no request, directly to paid status)
  const [payment] = await db
    .insert(payments)
    .values({
      bookingId: data.bookingId,
      amount: data.amount.toString(),
      status: "paid",
      paymentMode: data.paymentMode,
      requestedBy: null, // null indicates direct payment
      paidBy: userId,
      paidAt: new Date(),
      paymentNotes: data.notes || null,
    })
    .returning();

  revalidatePath("/company/payments");
  revalidatePath(`/company/bookings/${data.bookingId}`);

  return { success: true, payment };
}
