import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@clerk/nextjs/server";
import { getAppUrl } from "@/lib/app-url";
import { getCourse } from "@/lib/courses";
import { isClerkConfigured } from "@/lib/clerk";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

const checkoutSchema = z.object({
  courseSlug: z.string().min(1),
});

export async function POST(request: Request) {
  if (!isClerkConfigured()) {
    return NextResponse.json(
      { error: "Clerk is not configured yet." },
      { status: 503 },
    );
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured yet." },
      { status: 503 },
    );
  }

  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = checkoutSchema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
  }

  const course = getCourse(body.data.courseSlug);

  if (!course) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  const stripe = getStripe();

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured yet." },
      { status: 503 },
    );
  }

  const appUrl = getAppUrl();
  const email = user.primaryEmailAddress?.emailAddress;
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
      clerkUserId: user.id,
      courseSlug: course.slug,
    },
    success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/cancel?course=${course.slug}`,
  });

  return NextResponse.json({ url: session.url });
}
