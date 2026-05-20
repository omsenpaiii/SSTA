import { NextResponse } from "next/server";
import { getUserAccess } from "@/lib/access";
import { getAuthUserId, isClerkConfigured } from "@/lib/clerk";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  if (!isClerkConfigured()) {
    return NextResponse.json({ error: "Clerk is not configured yet." }, { status: 503 });
  }

  const userId = await getAuthUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ access: [], configured: false });
  }

  const access = await getUserAccess(userId);
  return NextResponse.json({ access, configured: true });
}
