"use server";

import { db } from "@/lib/db";
import {
  companyProfiles,
  users,
  payments,
  bookingRequests,
} from "@/lib/db/schema";
import { requireRole, updateUserMetadata } from "@/lib/auth";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createCompanyProfile(data: {
  companyName: string;
  contactPersonName: string;
  whatsappNumber: string;
  location: string;
  startedIn?: number;
  logoUrl?: string;
  proofOfOwnershipUrl?: string;
}) {
  await requireRole("company");

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Check if user exists in database
    let userExists = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    // If user doesn't exist (webhook might not have fired in dev), create it
    if (!userExists) {
      const { clerkClient } = await import("@clerk/nextjs/server");
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);

      await db.insert(users).values({
        id: userId,
        email: clerkUser.emailAddresses[0].emailAddress,
        role:
          (clerkUser.publicMetadata?.role as
            | "admin"
            | "company"
            | "freelancer") || "company",
        onboardingStatus: "incomplete",
      });
    }

    // Create company profile
    const [profile] = await db
      .insert(companyProfiles)
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

    revalidatePath("/company");

    return { success: true, profile };
  } catch (error) {
    console.error("Error creating company profile:", error);
    throw error;
  }
}

export async function getCompanyProfile() {
  await requireRole("company");

  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const profile = await db.query.companyProfiles.findFirst({
    where: eq(companyProfiles.userId, userId),
  });

  return profile;
}

export async function updateCompanyProfile(data: {
  companyName: string;
  contactPersonName: string;
  whatsappNumber: string;
  location: string;
  startedIn?: number;
  logoUrl?: string;
  proofOfOwnershipUrl?: string;
}) {
  await requireRole("company");

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const [profile] = await db
    .update(companyProfiles)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(companyProfiles.userId, userId))
    .returning();

  revalidatePath("/company");

  return { success: true, profile };
}

export async function markPaymentAsPaid(data: {
  paymentId: string;
  paymentMode: string;
  paymentNotes?: string;
}) {
  await requireRole("company");

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify the payment belongs to this company's booking
  const payment = await db.query.payments.findFirst({
    where: eq(payments.id, data.paymentId),
    with: {
      booking: {
        with: {
          company: true,
        },
      },
    },
  });

  if (!payment || payment.booking.company.id !== userId) {
    throw new Error("Payment not found or unauthorized");
  }

  if (payment.status !== "pending") {
    throw new Error("Payment is not in pending state");
  }

  // Validate payment mode
  const validPaymentModes = ["cash", "upi", "net_banking"];
  const paymentMode = validPaymentModes.includes(data.paymentMode)
    ? (data.paymentMode as "cash" | "upi" | "net_banking")
    : "cash";

  // Update payment to awaiting_confirmation status
  await db
    .update(payments)
    .set({
      status: "awaiting_confirmation",
      paymentMode,
      paymentNotes: data.paymentNotes,
      awaitingConfirmationAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(payments.id, data.paymentId));

  revalidatePath("/company/bookings");
  revalidatePath(`/company/bookings/${payment.bookingId}`);

  return { success: true };
}

export async function declinePayment(data: {
  paymentId: string;
  reason: string;
}) {
  await requireRole("company");

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify the payment belongs to this company's booking
  const payment = await db.query.payments.findFirst({
    where: eq(payments.id, data.paymentId),
    with: {
      booking: {
        with: {
          company: true,
        },
      },
    },
  });

  if (!payment || payment.booking.company.id !== userId) {
    throw new Error("Payment not found or unauthorized");
  }

  if (payment.status !== "pending") {
    throw new Error("Can only decline pending payments");
  }

  // Update payment to declined status
  await db
    .update(payments)
    .set({
      status: "declined",
      declineReason: data.reason,
      updatedAt: new Date(),
    })
    .where(eq(payments.id, data.paymentId));

  revalidatePath("/company/bookings");
  revalidatePath(`/company/bookings/${payment.bookingId}`);

  return { success: true };
}

export async function createCompanyPayment(data: {
  bookingId: string;
  amount: string;
  paymentNotes?: string;
}) {
  await requireRole("company");

  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Verify the booking belongs to this company
  const booking = await db.query.bookingRequests.findFirst({
    where: eq(bookingRequests.id, data.bookingId),
    with: {
      company: true,
    },
  });

  if (!booking || booking.companyId !== userId) {
    throw new Error("Booking not found or unauthorized");
  }

  // Create new payment with awaiting_confirmation status
  await db.insert(payments).values({
    bookingId: data.bookingId,
    amount: data.amount,
    status: "awaiting_confirmation",
    paymentNotes: data.paymentNotes,
    awaitingConfirmationAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath("/company/bookings");
  revalidatePath(`/company/bookings/${data.bookingId}`);

  return { success: true };
}
