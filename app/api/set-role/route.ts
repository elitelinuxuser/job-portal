import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    // Get the current user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "You must be signed in to set a role" },
        { status: 401 }
      );
    }

    // Get role from request body
    const body = await req.json();
    const { role } = body;

    if (!role || (role !== "company" && role !== "freelancer")) {
      return NextResponse.json(
        { error: 'Invalid role. Must be either "company" or "freelancer"' },
        { status: 400 }
      );
    }

    // Check if user already has a role
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const existingRole = user.publicMetadata?.role as string | undefined;

    if (existingRole) {
      return NextResponse.json(
        { error: "You already have a role assigned" },
        { status: 403 }
      );
    }

    // Set the user's role in Clerk metadata
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role,
        onboardingStatus: "incomplete",
      },
    });

    // Check if user exists in local database
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!existingUser) {
      // Get user email from Clerk
      const clerkUser = await client.users.getUser(userId);
      const email = clerkUser.emailAddresses[0]?.emailAddress;

      if (!email) {
        return NextResponse.json(
          { error: "User email not found" },
          { status: 400 }
        );
      }

      // Create user in local database
      await db.insert(users).values({
        id: userId,
        email,
        role,
        onboardingStatus: "incomplete",
      });
    } else {
      // Update existing user with role
      await db
        .update(users)
        .set({
          role,
          onboardingStatus: "incomplete",
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }

    return NextResponse.json({
      success: true,
      role,
      message: `Role set to ${role} successfully`,
    });
  } catch (error) {
    console.error("Error setting role:", error);
    return NextResponse.json({ error: "Failed to set role" }, { status: 500 });
  }
}
