import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const { userId, sessionClaims } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const role = sessionClaims?.metadata?.role as string | undefined
  const onboardingStatus = sessionClaims?.metadata?.onboardingStatus as string | undefined

  // Redirect based on role
  if (role === 'admin') {
    redirect('/admin')
  } else if (role === 'company') {
    if (onboardingStatus === 'incomplete') {
      redirect('/company/onboarding')
    }
    redirect('/company')
  } else if (role === 'freelancer') {
    if (onboardingStatus === 'incomplete') {
      redirect('/freelancer/onboarding')
    }
    redirect('/freelancer')
  }

  // If no role assigned, show error message
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="mt-2 text-gray-600">
          Your account doesn't have a role assigned. Please contact an administrator.
        </p>
      </div>
    </div>
  )
}
