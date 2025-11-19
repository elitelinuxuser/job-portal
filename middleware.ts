import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)'])
const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isCompanyRoute = createRouteMatcher(['/company(.*)'])
const isFreelancerRoute = createRouteMatcher(['/freelancer(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth()

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // Protect all other routes - require authentication
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(signInUrl)
  }

  // Get user role and onboarding status from session claims (no API call needed!)
  const publicMetadata = (sessionClaims as any)?.publicMetadata as { role?: string; onboardingStatus?: string } | undefined
  let role = publicMetadata?.role
  let onboardingStatus = publicMetadata?.onboardingStatus

  // Only fetch from Clerk API if session claims are missing (rare case, e.g., just after signup)
  if (!role) {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    role = user.publicMetadata?.role as string | undefined
    onboardingStatus = user.publicMetadata?.onboardingStatus as string | undefined
  }

  // Role-based route protection
  if (isAdminRoute(req) && role !== 'admin') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (isCompanyRoute(req) && role !== 'company') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  if (isFreelancerRoute(req) && role !== 'freelancer') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Redirect to onboarding if not complete
  if (onboardingStatus === 'incomplete' && !req.nextUrl.pathname.includes('/onboarding')) {
    if (role === 'company') {
      return NextResponse.redirect(new URL('/company/onboarding', req.url))
    } else if (role === 'freelancer') {
      return NextResponse.redirect(new URL('/freelancer/onboarding', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

