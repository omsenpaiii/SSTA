import { NextResponse } from "next/server";
import { createEnrollmentLead, enrollmentSchema } from "@/lib/enrollment";
import { sendEnrollmentEmail } from "@/lib/email";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = enrollmentSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid enrollment details.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const lead = await createEnrollmentLead(parsed.data);
    await sendEnrollmentEmail(lead);

    return NextResponse.json({
      enrollmentId: lead.id,
      courseSlug: lead.course_slug,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to submit enrollment.";
    const status =
      message.includes("configured") || message.includes("Supabase") ? 503 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
