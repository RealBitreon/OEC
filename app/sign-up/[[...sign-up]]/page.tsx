import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-8">
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-xl"
            }
          }}
          routing="path"
          path="/sign-up"
          forceRedirectUrl="/dashboard"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  )
}
