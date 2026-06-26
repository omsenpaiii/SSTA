import { AuthShell } from "@/components/AuthShell";
import { SignUpForm } from "@/components/auth/AuthForms";
import { SetupNotice } from "@/components/SetupNotice";
import { isSupabaseAuthConfigured } from "@/lib/supabase";

type SignUpPageProps = {
  searchParams: Promise<{
    redirect_url?: string;
    error?: string;
  }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;

  if (!isSupabaseAuthConfigured()) {
    return (
      <SetupNotice
        title="Add Supabase auth keys to enable student registration"
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
      mode="sign-up"
      title="Create your account"
      subtitle="Use Google or email to start your SSTA portal access."
    >
      <SignUpForm
        redirectUrl={params.redirect_url}
        errorMessage={params.error ? decodeURIComponent(params.error) : undefined}
      />
    </AuthShell>
  );
}
