import { NextResponse } from "next/server";
import {
  createEnrollmentLead,
  enrollmentSchema,
  updateEnrollmentEmailStatus,
} from "@/lib/enrollment";
import { sendEnrollmentEmail } from "@/lib/email";

export const runtime = "nodejs";

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

    try {
      await sendEnrollmentEmail(lead);
      await updateEnrollmentEmailStatus({
        enrollmentId: lead.id,
        emailStatus: "sent",
      });
    } catch (emailError) {
      await updateEnrollmentEmailStatus({
        enrollmentId: lead.id,
        emailStatus: "failed",
        emailError:
          emailError instanceof Error
            ? emailError.message
            : "Unable to send enrollment notification.",
      });
      throw emailError;
    }

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
