import { NextResponse } from "next/server";
import { z } from "zod";
import { getAppUrl } from "@/lib/app-url";
import { getCurrentUser } from "@/lib/auth";
import { isCourseAvailableForEnrollment } from "@/lib/courses";
import { getCourse } from "@/lib/course-repository";
import {
  getEnrollmentLead,
  updateEnrollmentCheckoutSession,
} from "@/lib/enrollment";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { isSupabaseAuthConfigured } from "@/lib/supabase";

const checkoutSchema = z.object({
  courseSlug: z.string().min(1),
  enrollmentId: z.string().uuid().optional(),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured yet." },
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

  const stripe = getStripe();

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured yet." },
      { status: 503 },
    );
  }

  const appUrl = getAppUrl();
  const email = enrollment?.email ?? user.email;
  const metadata = {
    userKey: user?.id ?? "",
    courseSlug: course.slug,
    enrollmentId: enrollment?.id ?? "",
  };
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: [
      {
        price_data: {
          currency: "aud",
          product_data: {
            name: course.title,
            description: course.description,
          },
          unit_amount: course.priceAud * 100,
        },
        quantity: 1,
      },
    ],
    metadata,
    payment_intent_data: {
      metadata,
    },
    success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/cancel?course=${course.slug}`,
  });

  if (enrollment?.id && session.id) {
    await updateEnrollmentCheckoutSession({
      enrollmentId: enrollment.id,
      stripeSessionId: session.id,
    });
  }

  return NextResponse.json({ url: session.url });
}
