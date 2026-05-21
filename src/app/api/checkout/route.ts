import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@clerk/nextjs/server";
import { getAppUrl } from "@/lib/app-url";
import { getCourse } from "@/lib/courses";
import { getEnrollmentLead } from "@/lib/enrollment";
import { isClerkConfigured } from "@/lib/clerk";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

const checkoutSchema = z.object({
  courseSlug: z.string().min(1),
  enrollmentId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured yet." },
      { status: 503 },
    );
  }

  const user = isClerkConfigured() ? await currentUser() : null;

  const body = checkoutSchema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
  }

  const course = getCourse(body.data.courseSlug);

  if (!course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
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

  const stripe = getStripe();

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured yet." },
      { status: 503 },
    );
  }

  const appUrl = getAppUrl();
  const email = enrollment?.email ?? user?.primaryEmailAddress?.emailAddress;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
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
    metadata: {
      clerkUserId: user?.id ?? "",
      courseSlug: course.slug,
      enrollmentId: enrollment?.id ?? "",
    },
    success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/cancel?course=${course.slug}`,
  });

  return NextResponse.json({ url: session.url });
}
