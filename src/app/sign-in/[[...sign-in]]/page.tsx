import { AuthShell } from "@/components/AuthShell";
import { SignInForm } from "@/components/auth/AuthForms";
import { SetupNotice } from "@/components/SetupNotice";
import { isSupabaseAuthConfigured } from "@/lib/supabase";

type SignInPageProps = {
  searchParams: Promise<{
    redirect_url?: string;
    error?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;

  if (!isSupabaseAuthConfigured()) {
    return (
      <SetupNotice
        title="Add Supabase auth keys to enable sign in"
        items={[
          "NEXT_PUBLIC_SUPABASE_URL",
          "NEXT_PUBLIC_SUPABASE_ANON_KEY",
          "SSTA_ADMIN_EMAILS",
        ]}
      />
    );
  }

  return (
    <AuthShell
      mode="sign-in"
      title="Welcome back"
      subtitle="Sign in to access the SSTA admin dashboard."
    >
      <SignInForm
        redirectUrl={params.redirect_url}
        errorMessage={params.error ? decodeURIComponent(params.error) : undefined}
      />
    </AuthShell>
  );
}
