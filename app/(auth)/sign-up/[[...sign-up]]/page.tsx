import { SignUp } from '@clerk/nextjs'

export default async function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <SignUp 
        fallbackRedirectUrl="/role-selection"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl"
          }
        }}
        routing="path"
        path="/sign-up"
      />
    </div>
  )
}

