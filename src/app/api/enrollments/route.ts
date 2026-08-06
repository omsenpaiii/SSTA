import { NextResponse } from "next/server";
import {
  createEnrollmentLead,
  enrollmentSchema,
  updateEnrollmentEmailStatus,
} from "@/lib/enrollment";
import { sendEnrollmentEmail } from "@/lib/email";
import { isRecaptchaConfigured, verifyRecaptchaToken } from "@/lib/recaptcha";
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
        error: "Invalid enrollment details.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  if (parsed.data.email.toLowerCase() !== user.email.toLowerCase()) {
    return NextResponse.json(
      { error: "Use the email address connected to your signed-in student account." },
      { status: 400 },
    );
  }

  if (!isRecaptchaConfigured()) {
    return NextResponse.json(
      { error: "reCAPTCHA is not configured yet." },
      { status: 503 },
    );
  }

  const verification = await verifyRecaptchaToken(parsed.data.captchaToken).catch(
    (error) => {
      const message =
        error instanceof Error ? error.message : "Unable to verify reCAPTCHA.";

      return NextResponse.json(
        { error: message },
        { status: message.includes("configured") ? 503 : 502 },
      );
    },
  );

  if (verification instanceof NextResponse) {
    return verification;
  }

  if (!verification.success) {
    return NextResponse.json(
      { error: "reCAPTCHA verification failed. Please try again." },
      { status: 403 },
    );
  }

  try {
    const { captchaToken, ...leadInput } = parsed.data;
    void captchaToken;
    const lead = await createEnrollmentLead(leadInput);

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
