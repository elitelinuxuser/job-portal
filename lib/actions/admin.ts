"use server";

import { db } from "@/lib/db";
import { companyProfiles, freelancerProfiles } from "@/lib/db/schema";
import { requireRole } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function approveProfile(
  profileId: string,
  profileType: "company" | "freelancer"
) {
  await requireRole("admin");

  if (profileType === "company") {
    await db
      .update(companyProfiles)
      .set({
        verificationStatus: "verified",
        updatedAt: new Date(),
      })
      .where(eq(companyProfiles.id, profileId));
  } else {
    await db
      .update(freelancerProfiles)
      .set({
        verificationStatus: "verified",
        updatedAt: new Date(),
      })
      .where(eq(freelancerProfiles.id, profileId));
  }

  revalidatePath("/admin/approvals");

  return { success: true };
}

export async function rejectProfile(
  profileId: string,
  profileType: "company" | "freelancer"
) {
  await requireRole("admin");

  if (profileType === "company") {
    await db
      .update(companyProfiles)
      .set({
        verificationStatus: "rejected",
        updatedAt: new Date(),
      })
      .where(eq(companyProfiles.id, profileId));
  } else {
    await db
      .update(freelancerProfiles)
      .set({
        verificationStatus: "rejected",
        updatedAt: new Date(),
      })
      .where(eq(freelancerProfiles.id, profileId));
  }

  revalidatePath("/admin/approvals");

  return { success: true };
}
