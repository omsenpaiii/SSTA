import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { grantCourseAccess } from "@/lib/access";
import { updateEnrollmentPaymentStatus } from "@/lib/enrollment";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured yet." },
      { status: 503 },
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userKey = session.metadata?.userKey;
      const courseSlug = session.metadata?.courseSlug;
      const enrollmentId = session.metadata?.enrollmentId;

      if (enrollmentId && session.payment_status === "paid") {
        await updateEnrollmentPaymentStatus({
          enrollmentId,
          paymentStatus: "paid",
          stripeSessionId: session.id,
        });
      }

      if (userKey && courseSlug && session.payment_status === "paid") {
        await grantCourseAccess({
          userKey,
          courseSlug,
          stripeCustomerId:
            typeof session.customer === "string"
              ? session.customer
              : session.customer?.id,
          stripeSessionId: session.id,
          amountPaid: session.amount_total,
          currency: session.currency,
          email: session.customer_details?.email,
        });
      }
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object;
      const enrollmentId = session.metadata?.enrollmentId;

      if (enrollmentId) {
        await updateEnrollmentPaymentStatus({
          enrollmentId,
          paymentStatus: "cancelled",
          stripeSessionId: session.id,
          onlyIfCurrentSession: true,
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
