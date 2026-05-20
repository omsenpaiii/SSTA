import { SignUp } from "@clerk/nextjs";
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
    <main className="flex min-h-screen items-center justify-center bg-[#eef8ff] px-5 py-16">
      <SignUp routing="path" path="/sign-up" />
    </main>
  );
}
