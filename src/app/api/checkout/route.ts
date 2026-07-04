import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { isCourseAvailableForEnrollment } from "@/lib/courses";
import { getCourse } from "@/lib/course-repository";
import {
  getEnrollmentLead,
  updateEnrollmentCheckoutSession,
} from "@/lib/enrollment";
import { createPaymentIntent } from "@/lib/payments";
import {
  createPinchPayer,
  createPinchPaymentLink,
  isPinchConfigured,
} from "@/lib/pinch";
import { isSupabaseAuthConfigured } from "@/lib/supabase";

const checkoutSchema = z.object({
  courseSlug: z.string().min(1),
  enrollmentId: z.string().uuid().optional(),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!isPinchConfigured()) {
      return NextResponse.json(
        { error: "Pinch Payments is not configured yet." },
        { status: 503 },
      );
    }

    if (!isSupabaseAuthConfigured()) {
      return NextResponse.json(
        { error: "Supabase Auth is not configured yet." },
        { status: 503 },
      );
    }

    const user = await getCurrentUser();
    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    const body = checkoutSchema.safeParse(payload);

    if (!body.success) {
      return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
    }

    const course = await getCourse(body.data.courseSlug);

    if (!course) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    if (!isCourseAvailableForEnrollment(course)) {
      return NextResponse.json(
        { error: "This course is not open for online enrollment yet." },
        { status: 400 },
      );
    }

    if (!user) {
      return NextResponse.json(
        {
          error: "Please sign in before continuing to secure checkout.",
          signInUrl: `/sign-in?redirect_url=${encodeURIComponent(
            `/enroll?course=${course.slug}`,
          )}`,
        },
        { status: 401 },
      );
    }

    const enrollment = body.data.enrollmentId
      ? await getEnrollmentLead(body.data.enrollmentId)
      : null;

    if (body.data.enrollmentId && !enrollment) {
      return NextResponse.json({ error: "Enrollment not found." }, { status: 404 });
    }

    if (enrollment && enrollment.course_slug !== course.slug) {
      return NextResponse.json(
        { error: "Enrollment does not match selected course." },
        { status: 400 },
      );
    }

    if (enrollment?.payment_status === "paid") {
      return NextResponse.json(
        { error: "This enrollment has already been paid." },
        { status: 409 },
      );
    }

    const email = enrollment?.email ?? user.email;
    const amountCents = Math.round(course.priceAud * 100);
    const metadata = {
      userKey: user?.id ?? "",
      courseSlug: course.slug,
      enrollmentId: enrollment?.id ?? "",
      purpose: "course_enrollment",
    };

    const payer = await createPinchPayer({
      userKey: user.id,
      email,
      name: user.name,
      firstName: enrollment?.first_name ?? user.firstName,
      lastName: enrollment?.last_name ?? user.lastName,
      phone: enrollment?.phone ?? user.phone,
    });

    const paymentLink = await createPinchPaymentLink({
      amountCents,
      payerId: payer.id,
      description: course.title,
      successPath: "/success",
      metadata,
    });

    await createPaymentIntent({
      provider: "pinch",
      purpose: "course_enrollment",
      status: "pending",
      userKey: user.id,
      email,
      courseSlug: course.slug,
      enrollmentId: enrollment?.id ?? null,
      amountCents,
      currency: "AUD",
      providerPayerId: payer.id,
      providerPaymentLinkId: paymentLink.id,
      checkoutUrl: paymentLink.url,
      metadata,
    });

    if (enrollment?.id && paymentLink.id) {
      await updateEnrollmentCheckoutSession({
        enrollmentId: enrollment.id,
        stripeSessionId: paymentLink.id,
        provider: "pinch",
      });
    }

    return NextResponse.json({ url: paymentLink.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to start checkout.";
    console.error("Course checkout failed", error);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
