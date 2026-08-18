import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  enrollmentApplicationSchema,
  getEnrollmentApplication,
  hasPaidInitialFee,
  submitEnrollmentApplication,
} from "@/lib/enrollment-application";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const courseSlug = new URL(request.url).searchParams.get("course") ?? "";
  if (!courseSlug) return NextResponse.json({ error: "Course is required." }, { status: 400 });
  const [paid, application] = await Promise.all([
    hasPaidInitialFee(user.id, courseSlug),
    getEnrollmentApplication(user.id, courseSlug),
  ]);
  return NextResponse.json({ paid, application });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const parsed = enrollmentApplicationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the form.", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  if (!(await hasPaidInitialFee(user.id, parsed.data.courseSlug))) {
    return NextResponse.json({ error: "The initial $150 payment must be confirmed before submitting this application." }, { status: 403 });
  }
  const application = await submitEnrollmentApplication({ userKey: user.id, application: parsed.data });
  return NextResponse.json({ application });
}
