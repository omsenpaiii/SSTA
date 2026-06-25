import { SignUp } from "@clerk/nextjs";
import { AuthShell, clerkAppearance } from "@/components/AuthShell";
import { SetupNotice } from "@/components/SetupNotice";

export default function SignUpPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <SetupNotice
        title="Add Clerk keys to enable student registration"
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
      mode="sign-up"
      title="Create your account"
      subtitle="Use Google or email to start your SSTA portal access."
    >
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" appearance={clerkAppearance} />
    </AuthShell>
  );
}
