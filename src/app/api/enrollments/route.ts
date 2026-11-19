import { NextResponse } from "next/server";

function retired() {
  return NextResponse.json({ error: "This feature is no longer available. Please contact SSTA for training support.", contactUrl: "/enquire" }, { status: 410 });
}

export const GET = retired;
export const POST = retired;
