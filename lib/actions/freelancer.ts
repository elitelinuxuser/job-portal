"use server";

import { db } from "@/lib/db";
import {
  freelancerProfiles,
  users,
  jobPosts,
  jobResponses,
  bookingRequests,
  payments,
} from "@/lib/db/schema";
import { requireRole, updateUserMetadata } from "@/lib/auth";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  notifyCompanyFreelancerInterested,
  notifyCompanyPaymentConfirmed,
} from "@/lib/wasender";

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

  // Send WhatsApp notification to company if freelancer is interested
  if (data.status === "interested") {
    try {
      // Get job details with company info
      const job = await db.query.jobPosts.findFirst({
        where: eq(jobPosts.id, data.jobId),
        with: {
          company: {
            with: {
              companyProfile: true,
            },
          },
        },
      });

      if (job?.company?.companyProfile?.whatsappNumber) {
        await notifyCompanyFreelancerInterested(
          job.company.companyProfile.whatsappNumber,
          profile.name,
          job.title,
          data.proposedPrice
        );
      }
    } catch (error) {
      console.error("Failed to send WhatsApp notification:", error);
      // Don't fail the action if notification fails
    }
  }

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
  rejectionReason?: string;
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
      rejectionReason: data.accept ? null : data.rejectionReason || null,
      updatedAt: new Date(),
    })
    .where(eq(bookingRequests.id, data.bookingId))
    .returning();

  revalidatePath("/freelancer/bookings");
  revalidatePath(`/freelancer/bookings/${data.bookingId}`);

  return { success: true, booking: updated };
}

export async function requestPayment(data: {
  bookingId: string;
  amount: number;
  notes?: string;
}) {
  await requireRole("freelancer");

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify booking belongs to freelancer and is accepted
  const booking = await db.query.bookingRequests.findFirst({
    where: and(
      eq(bookingRequests.id, data.bookingId),
      eq(bookingRequests.freelancerId, userId),
      eq(bookingRequests.status, "accepted")
    ),
  });

  if (!booking) {
    throw new Error("Booking not found or not in accepted state");
  }

  // Create payment request
  const [payment] = await db
    .insert(payments)
    .values({
      bookingId: data.bookingId,
      amount: data.amount.toString(),
      status: "pending",
      requestedBy: userId,
      requestNotes: data.notes || null,
    })
    .returning();

  revalidatePath("/freelancer/bookings");
  revalidatePath(`/freelancer/bookings/${data.bookingId}`);
  revalidatePath("/freelancer/payments");

  return { success: true, payment };
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

export async function getFreelancerPayments() {
  await requireRole("freelancer");

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Get all payments for bookings where freelancer is the recipient
  const allPayments = await db.query.payments.findMany({
    with: {
      booking: {
        with: {
          job: true,
          company: {
            with: {
              companyProfile: true,
            },
          },
        },
      },
    },
    orderBy: (payments, { desc }) => [desc(payments.createdAt)],
  });

  // Filter payments where the booking belongs to this freelancer
  const freelancerPayments = allPayments.filter(
    (payment) => payment.booking.freelancerId === userId
  );

  return freelancerPayments;
}

export async function confirmPaymentReceived(paymentId: string) {
  await requireRole("freelancer");

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify payment belongs to freelancer
  const payment = await db.query.payments.findFirst({
    where: eq(payments.id, paymentId),
    with: {
      booking: true,
    },
  });

  if (!payment || payment.booking.freelancerId !== userId) {
    throw new Error("Payment not found");
  }

  if (
    payment.status !== "pending" &&
    payment.status !== "awaiting_confirmation"
  ) {
    throw new Error(
      "Payment must be in pending or awaiting_confirmation state"
    );
  }

  const [updated] = await db
    .update(payments)
    .set({
      status: "paid",
      paidAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(payments.id, paymentId))
    .returning();

  // Send WhatsApp notification to company that payment was confirmed
  try {
    const bookingWithDetails = await db.query.bookingRequests.findFirst({
      where: eq(bookingRequests.id, payment.bookingId),
      with: {
        job: true,
        company: {
          with: {
            companyProfile: true,
          },
        },
      },
    });

    if (bookingWithDetails?.company?.companyProfile?.whatsappNumber) {
      await notifyCompanyPaymentConfirmed(
        bookingWithDetails.company.companyProfile.whatsappNumber,
        updated.amount,
        bookingWithDetails.job.title
      );
    }
  } catch (error) {
    console.error("Failed to send WhatsApp notification:", error);
  }

  revalidatePath("/freelancer/payments");

  return { success: true, payment: updated };
}

export async function disputePayment(data: {
  paymentId: string;
  reason: string;
}) {
  await requireRole("freelancer");

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify payment belongs to freelancer and is in paid state
  const payment = await db.query.payments.findFirst({
    where: eq(payments.id, data.paymentId),
    with: {
      booking: true,
    },
  });

  if (!payment || payment.booking.freelancerId !== userId) {
    throw new Error("Payment not found");
  }

  if (payment.status !== "paid") {
    throw new Error("Payment must be in paid state to dispute");
  }

  const [updated] = await db
    .update(payments)
    .set({
      status: "disputed",
      disputeReason: data.reason,
      updatedAt: new Date(),
    })
    .where(eq(payments.id, data.paymentId))
    .returning();

  revalidatePath("/freelancer/payments");

  return { success: true, payment: updated };
}

export async function deletePayment(paymentId: string) {
  await requireRole("freelancer");

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify payment belongs to freelancer and is in pending state
  const payment = await db.query.payments.findFirst({
    where: eq(payments.id, paymentId),
    with: {
      booking: true,
    },
  });

  if (!payment || payment.booking.freelancerId !== userId) {
    throw new Error("Payment not found");
  }

  if (payment.status !== "pending") {
    throw new Error("Only pending payment requests can be deleted");
  }

  // Delete the payment
  await db.delete(payments).where(eq(payments.id, paymentId));

  revalidatePath("/freelancer/payments");
  revalidatePath(`/freelancer/bookings/${payment.bookingId}`);

  return { success: true };
}
