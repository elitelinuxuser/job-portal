import {
  clerkMiddleware,
  createRouteMatcher,
  clerkClient,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { companyProfiles, freelancerProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);
const isRoleSelectionRoute = createRouteMatcher(["/role-selection"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isCompanyRoute = createRouteMatcher(["/company(.*)"]);
const isFreelancerRoute = createRouteMatcher(["/freelancer(.*)"]);
const isPendingRoute = createRouteMatcher([
  "/company/pending",
  "/freelancer/pending",
]);
const isRejectedRoute = createRouteMatcher([
  "/company/rejected",
  "/freelancer/rejected",
]);
const isOnboardingRoute = createRouteMatcher([
  "/company/onboarding",
  "/freelancer/onboarding",
]);
const isFreelancerJobBrowsingRoute = createRouteMatcher([
  "/freelancer",
  "/freelancer/jobs(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // Allow API routes to pass through
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protect all other routes - require authentication
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Get user role and onboarding status from session claims (no API call needed!)
  const publicMetadata = sessionClaims?.publicMetadata as
    | { role?: string; onboardingStatus?: string }
    | undefined;
  let role = publicMetadata?.role;
  let onboardingStatus = publicMetadata?.onboardingStatus;

  // Only fetch from Clerk API if session claims are missing (rare case, e.g., just after signup)
  if (!role) {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    role = user.publicMetadata?.role as string | undefined;
    onboardingStatus = user.publicMetadata?.onboardingStatus as
      | string
      | undefined;
  }

  // Allow role selection page for users without a role
  if (isRoleSelectionRoute(req)) {
    return NextResponse.next();
  }

  // If user doesn't have a role and is not on role-selection page, redirect them
  if (!role) {
    return NextResponse.redirect(new URL("/role-selection", req.url));
  }

  // Role-based route protection
  if (isAdminRoute(req) && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isCompanyRoute(req) && role !== "company") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isFreelancerRoute(req) && role !== "freelancer") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Redirect to onboarding if not complete
  if (onboardingStatus === "incomplete" && !isOnboardingRoute(req)) {
    if (role === "company") {
      return NextResponse.redirect(new URL("/company/onboarding", req.url));
    } else if (role === "freelancer") {
      return NextResponse.redirect(new URL("/freelancer/onboarding", req.url));
    }
  }

  // Check verification status for companies and freelancers (only after onboarding is complete)
  if (
    onboardingStatus === "complete" &&
    (role === "company" || role === "freelancer")
  ) {
    let verificationStatus: string | undefined;

    try {
      if (role === "company") {
        const [profile] = await db
          .select({ verificationStatus: companyProfiles.verificationStatus })
          .from(companyProfiles)
          .where(eq(companyProfiles.userId, userId))
          .limit(1);
        verificationStatus = profile?.verificationStatus;
      } else if (role === "freelancer") {
        const [profile] = await db
          .select({ verificationStatus: freelancerProfiles.verificationStatus })
          .from(freelancerProfiles)
          .where(eq(freelancerProfiles.userId, userId))
          .limit(1);
        verificationStatus = profile?.verificationStatus;
      }

      // Redirect rejected users to rejected page (no exceptions - they cannot access any routes)
      if (verificationStatus === "rejected" && !isRejectedRoute(req)) {
        const rejectedUrl =
          role === "company" ? "/company/rejected" : "/freelancer/rejected";
        return NextResponse.redirect(new URL(rejectedUrl, req.url));
      }

      // Redirect pending users to pending page (except freelancers on job browsing routes)
      if (verificationStatus === "pending" && !isPendingRoute(req)) {
        // Allow pending freelancers to browse jobs and view job details
        if (role === "freelancer" && isFreelancerJobBrowsingRoute(req)) {
          return NextResponse.next();
        }

        const pendingUrl =
          role === "company" ? "/company/pending" : "/freelancer/pending";
        return NextResponse.redirect(new URL(pendingUrl, req.url));
      }

      // Only verified users can access the main platform (not pending/rejected pages)
      if (
        verificationStatus === "verified" &&
        (isPendingRoute(req) || isRejectedRoute(req))
      ) {
        const homeUrl = role === "company" ? "/company" : "/freelancer";
        return NextResponse.redirect(new URL(homeUrl, req.url));
      }
    } catch (error) {
      console.error("Error checking verification status:", error);
      // In case of error, allow the request to proceed to avoid blocking legitimate users
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
