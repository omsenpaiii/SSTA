import { NextResponse } from "next/server";
import { fulfillPinchPayment } from "@/lib/payment-fulfillment";
import { verifyPinchWebhookSignature } from "@/lib/pinch";

export const runtime = "nodejs";

type PinchWebhookEvent = {
  Id?: string;
  id?: string;
  Type?: string;
  type?: string;
  Data?: Record<string, unknown>;
  data?: Record<string, unknown>;
};

function getEventType(event: PinchWebhookEvent) {
  return event.Type ?? event.type ?? "";
}

function getEventData(event: PinchWebhookEvent) {
  return event.Data ?? event.data ?? {};
}

function getPaymentFromEvent(event: PinchWebhookEvent) {
  const data = getEventData(event);
  const payment =
    data.Payment ??
    data.payment ??
    (Array.isArray(data.Payments) ? data.Payments[0] : undefined) ??
    (Array.isArray(data.payments) ? data.payments[0] : undefined);

  if (!payment || typeof payment !== "object") {
    return null;
  }

  const row = payment as Record<string, unknown>;
  const id = row.Id ?? row.id;

  return typeof id === "string" ? { id } : null;
}

export async function POST(request: Request) {
  const body = await request.text();
  const valid = verifyPinchWebhookSignature({
    body,
    signature: request.headers.get("pinch-signature"),
    secret: process.env.PINCH_WEBHOOK_SECRET,
  });

  if (!valid) {
    return NextResponse.json({ error: "Invalid Pinch signature." }, { status: 400 });
  }

  let event: PinchWebhookEvent;

  try {
    event = JSON.parse(body) as PinchWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid webhook JSON." }, { status: 400 });
  }

  const eventType = getEventType(event);
  const payment = getPaymentFromEvent(event);

  if (payment && ["realtime-payment", "payment-created", "scheduled-process", "bank-results"].includes(eventType)) {
    await fulfillPinchPayment({
      paymentId: payment.id,
      rawEvent: event as Record<string, unknown>,
    });
  }

  return NextResponse.json({ received: true });
}
