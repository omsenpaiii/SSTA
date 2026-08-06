import { NextResponse } from "next/server";
import { isAdminEmail, syncStudentProfileFromUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getSafeRedirectPath } from "@/lib/auth-shared";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const flow = url.searchParams.get("flow");
  const nextPath = getSafeRedirectPath(url.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/sign-in?error=missing_code", url.origin));
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      const errorUrl = new URL("/sign-in", url.origin);
      errorUrl.searchParams.set("error", error.message);
      return NextResponse.redirect(errorUrl);
    }

    await syncStudentProfileFromUser(data.user);

    if (flow === "signup-confirmation") {
      await supabase.auth.signOut();

      const signInUrl = new URL("/sign-in", url.origin);
      signInUrl.searchParams.set(
        "success",
        "Email confirmed. Sign in with your new account to continue.",
      );

      signInUrl.searchParams.set("redirect_url", nextPath);

      return NextResponse.redirect(signInUrl);
    }

    const destination = isAdminEmail(data.user.email ?? "") ? "/admin" : nextPath;
    return NextResponse.redirect(new URL(destination, url.origin));
  } catch (error) {
    const errorUrl = new URL("/sign-in", url.origin);
    errorUrl.searchParams.set(
      "error",
      error instanceof Error ? error.message : "Unable to complete sign in.",
    );
    return NextResponse.redirect(errorUrl);
  }
}
