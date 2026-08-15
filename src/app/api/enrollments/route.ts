import { NextResponse } from "next/server";
import {
  createEnrollmentLead,
  enrollmentSchema,
  updateEnrollmentEmailStatus,
} from "@/lib/enrollment";
import { sendEnrollmentEmail } from "@/lib/email";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Please sign in or create an account before enrolling." },
      { status: 401 },
    );
  }

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
        error: "Invalid enrolment details.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const lead = await createEnrollmentLead({
      ...parsed.data,
      email: user.email || parsed.data.email,
    });

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
            : "Unable to send enrolment notification.",
      });
    }

    return NextResponse.json({
      enrollmentId: lead.id,
      courseSlug: lead.course_slug,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to submit enrolment.";
    const status =
      message.includes("configured") || message.includes("Supabase") ? 503 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
