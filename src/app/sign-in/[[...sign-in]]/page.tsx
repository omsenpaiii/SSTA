import { SignIn } from "@clerk/nextjs";
import { AuthShell, clerkAppearance } from "@/components/AuthShell";
import { SetupNotice } from "@/components/SetupNotice";

export default function SignInPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <SetupNotice
        title="Add Clerk keys to enable sign in"
        items={[
          "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
          "CLERK_SECRET_KEY",
          "NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in",
          "NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up",
        ]}
      />
    );
  }

  return (
    <AuthShell
      mode="sign-in"
      title="Welcome back"
      subtitle="Sign in to access your SSTA dashboard."
    >
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" appearance={clerkAppearance} />
    </AuthShell>
  );
}
