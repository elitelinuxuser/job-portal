import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing/landing-page";

export default async function HomePage() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return <LandingPage />;
  }

  // Get role from session claims first (faster)
  const publicMetadata = sessionClaims?.publicMetadata as
    | { role?: string; onboardingStatus?: string }
    | undefined;
  let role = publicMetadata?.role;
  let onboardingStatus = publicMetadata?.onboardingStatus;

  // Only fetch from Clerk API if session claims are missing
  if (!role) {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    role = user.publicMetadata?.role as string | undefined;
    onboardingStatus = user.publicMetadata?.onboardingStatus as
      | string
      | undefined;
  }

  // Redirect based on role
  if (role === "admin") {
    redirect("/admin");
  } else if (role === "company") {
    if (onboardingStatus === "incomplete") {
      redirect("/company/onboarding");
    }
    redirect("/company");
  } else if (role === "freelancer") {
    if (onboardingStatus === "incomplete") {
      redirect("/freelancer/onboarding");
    }
    redirect("/freelancer");
  }

  // If no role assigned, show error message
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="mt-2 text-gray-600">
          Your account doesn&apos;t have a role assigned. Please contact an
          administrator.
        </p>
      </div>
    </div>
  );
}
