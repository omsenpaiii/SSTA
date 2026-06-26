import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  } catch {
    // Sign-out should stay best-effort and always land the user on the site.
  }

  const url = new URL(request.url);
  return NextResponse.redirect(new URL("/", url.origin));
}
