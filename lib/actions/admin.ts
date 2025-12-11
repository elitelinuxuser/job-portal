"use server";

import { db } from "@/lib/db";
import { companyProfiles, freelancerProfiles } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notifyProfileVerified, notifyProfileRejected } from "@/lib/wasender";

export async function approveProfile(
  profileId: string,
  profileType: "company" | "freelancer"
) {
  await requireRole("admin");

  let phone: string | undefined;
  let name: string | undefined;

  if (profileType === "company") {
    const [profile] = await db
      .update(companyProfiles)
      .set({
        verificationStatus: "verified",
        updatedAt: new Date(),
      })
      .where(eq(companyProfiles.id, profileId))
      .returning();

    phone = profile?.whatsappNumber;
    name = profile?.companyName;
  } else {
    const [profile] = await db
      .update(freelancerProfiles)
      .set({
        verificationStatus: "verified",
        updatedAt: new Date(),
      })
      .where(eq(freelancerProfiles.id, profileId))
      .returning();

    phone = profile?.whatsappNumber;
    name = profile?.name;
  }

  // Send WhatsApp notification about profile verification
  if (phone && name) {
    try {
      await notifyProfileVerified(phone, name);
    } catch (error) {
      console.error("Failed to send WhatsApp notification:", error);
    }
  }

  revalidatePath("/admin/approvals");

  return { success: true };
}

export async function rejectProfile(
  profileId: string,
  profileType: "company" | "freelancer",
  reason?: string
) {
  await requireRole("admin");

  let phone: string | undefined;
  let name: string | undefined;

  if (profileType === "company") {
    const [profile] = await db
      .update(companyProfiles)
      .set({
        verificationStatus: "rejected",
        updatedAt: new Date(),
      })
      .where(eq(companyProfiles.id, profileId))
      .returning();

    phone = profile?.whatsappNumber;
    name = profile?.companyName;
  } else {
    const [profile] = await db
      .update(freelancerProfiles)
      .set({
        verificationStatus: "rejected",
        updatedAt: new Date(),
      })
      .where(eq(freelancerProfiles.id, profileId))
      .returning();

    phone = profile?.whatsappNumber;
    name = profile?.name;
  }

  // Send WhatsApp notification about profile rejection
  if (phone && name) {
    try {
      await notifyProfileRejected(phone, name, reason);
    } catch (error) {
      console.error("Failed to send WhatsApp notification:", error);
    }
  }

  revalidatePath("/admin/approvals");

  return { success: true };
}
