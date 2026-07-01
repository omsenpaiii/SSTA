import { grantCourseAccess } from "@/lib/access";
import { CPP20218_COURSE_SLUG, setStudentAssignmentAccess } from "@/lib/cpp20218";
import { updateEnrollmentPaymentStatus } from "@/lib/enrollment";
import { getPaymentIntentByPinchReference, markPaymentIntent, type PaymentIntentRecord } from "@/lib/payments";
import { getPinchPayment, isPinchFailedStatus, isPinchPaidStatus, type PinchPayment } from "@/lib/pinch";
import { getSupabaseAdmin } from "@/lib/supabase";

function getPaymentMetadata(payment: PinchPayment) {
  if (!payment.metadata) return null;

  try {
    return JSON.parse(payment.metadata) as Record<string, string>;
  } catch {
    return null;
  }
}

async function findPaymentIntent(payment: PinchPayment, paymentLinkId?: string | null) {
  const byPayment = await getPaymentIntentByPinchReference({
    paymentId: payment.id,
    paymentLinkId: null,
  });

  if (byPayment) return byPayment;

  const byLink = await getPaymentIntentByPinchReference({
    paymentLinkId,
    paymentId: null,
  });

  if (byLink) return byLink;

  const metadata = getPaymentMetadata(payment);
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  if (metadata?.paymentIntentId) {
    const { data, error } = await supabase
      .from("payment_intents")
      .select("*")
      .eq("id", metadata.paymentIntentId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data as PaymentIntentRecord | null;
  }

  if (!metadata?.userKey || !metadata.courseSlug || !metadata.purpose) {
    return null;
  }

  let query = supabase
    .from("payment_intents")
    .select("*")
    .eq("provider", "pinch")
    .eq("status", "pending")
    .eq("user_key", metadata.userKey)
    .eq("course_slug", metadata.courseSlug)
    .eq("purpose", metadata.purpose);

  if (metadata.enrollmentId) {
    query = query.eq("enrollment_id", metadata.enrollmentId);
  }

  if (metadata.assignmentKey) {
    query = query.eq("assignment_key", metadata.assignmentKey);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as PaymentIntentRecord | null;
}

async function fulfillPaidIntent(intent: PaymentIntentRecord, payment: PinchPayment) {
  if (intent.enrollment_id) {
    await updateEnrollmentPaymentStatus({
      enrollmentId: intent.enrollment_id,
      paymentStatus: "paid",
      stripeSessionId: intent.provider_payment_link_id,
      provider: "pinch",
      providerPaymentId: payment.id,
    });
  }

  if (intent.purpose === "course_enrollment") {
    await grantCourseAccess({
      userKey: intent.user_key,
      courseSlug: intent.course_slug,
      stripeCustomerId: intent.provider_payer_id,
      stripeSessionId: intent.provider_payment_id ?? intent.provider_payment_link_id,
      paymentProvider: "pinch",
      providerPaymentId: payment.id,
      amountPaid: payment.amount ?? intent.amount_cents,
      currency: payment.currency ?? intent.currency,
      email: payment.payer?.emailAddress ?? payment.payer?.email ?? intent.email,
    });
  }

  if (intent.purpose === "assignment_unlock" && intent.course_slug === CPP20218_COURSE_SLUG) {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      throw new Error("Supabase is not configured.");
    }

    const { data: lockedAssignments, error } = await supabase
      .from("student_assignment_access")
      .select("assignment_key")
      .eq("user_key", intent.user_key)
      .eq("course_slug", CPP20218_COURSE_SLUG)
      .eq("unlocked", false);

    if (error) {
      throw new Error(error.message);
    }

    await Promise.all(
      (lockedAssignments ?? []).map((assignment) =>
        setStudentAssignmentAccess({
          userKey: intent.user_key,
          assignmentKey: assignment.assignment_key,
          unlocked: true,
          adminEmail: "pinch-payment",
        }),
      ),
    );
  }
}

export async function fulfillPinchPayment(input: {
  paymentId: string;
  paymentLinkId?: string | null;
  rawEvent?: Record<string, unknown> | null;
}) {
  const payment = await getPinchPayment(input.paymentId);
  const intent = await findPaymentIntent(payment, input.paymentLinkId);

  if (!intent) {
    return { fulfilled: false, reason: "payment_intent_not_found", payment };
  }

  if (isPinchFailedStatus(payment.status)) {
    await markPaymentIntent({
      id: intent.id,
      status: "failed",
      providerPaymentId: payment.id,
      providerStatus: payment.status,
      rawEvent: input.rawEvent ?? null,
    });

    if (intent.enrollment_id) {
      await updateEnrollmentPaymentStatus({
        enrollmentId: intent.enrollment_id,
        paymentStatus: "failed",
        stripeSessionId: intent.provider_payment_link_id,
        provider: "pinch",
        providerPaymentId: payment.id,
      });
    }

    return { fulfilled: false, reason: "payment_failed", payment };
  }

  if (!isPinchPaidStatus(payment.status)) {
    await markPaymentIntent({
      id: intent.id,
      status: "pending",
      providerPaymentId: payment.id,
      providerStatus: payment.status,
      rawEvent: input.rawEvent ?? null,
    });

    return { fulfilled: false, reason: "payment_not_approved", payment };
  }

  await markPaymentIntent({
    id: intent.id,
    status: "paid",
    providerPaymentId: payment.id,
    providerStatus: payment.status,
    rawEvent: input.rawEvent ?? null,
  });
  await fulfillPaidIntent(intent, payment);

  return { fulfilled: true, payment };
}
