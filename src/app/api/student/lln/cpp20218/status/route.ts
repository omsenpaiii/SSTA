import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getLatestCpp20218LlnAttempt } from "@/lib/lln";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }

  const attempt = await getLatestCpp20218LlnAttempt(user.id);

  return NextResponse.json({
    attempt,
    passed: attempt?.passed ?? false,
  });
}
