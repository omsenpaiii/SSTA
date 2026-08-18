import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { CPP20218_COURSE_SLUG, getStudentCppAssignments } from "@/lib/cpp20218";
import { createPaymentIntent } from "@/lib/payments";
import { createStripeCheckoutSession, getStripeUserMessage, isStripeConfigured } from "@/lib/stripe";
import { isSupabaseAuthConfigured } from "@/lib/supabase";

const checkoutSchema = z.object({
  assignmentKey: z.string().min(1),
});

export const runtime = "nodejs";

function getUnlockAmountCents() {
  return 15_000;
}

export async function POST(request: Request) {
  try {
    if (!isSupabaseAuthConfigured()) {
      return NextResponse.json(
        { error: "Supabase Auth is not configured yet." },
        { status: 503 },
      );
    }

    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: "Stripe payments are not configured yet." },
        { status: 503 },
      );
    }

    const amountCents = getUnlockAmountCents();

    if (!amountCents) {
      return NextResponse.json(
        { error: "Assignment payments are not configured yet." },
        { status: 503 },
      );
    }

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          error: "Please sign in before continuing to payment.",
          signInUrl: "/sign-in?redirect_url=/dashboard/course/certificate-ii-security-operations",
        },
        { status: 401 },
      );
    }

    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      payload = {};
    }

    const body = checkoutSchema.safeParse(payload);

    if (!body.success) {
      return NextResponse.json({ error: "Invalid payment request." }, { status: 400 });
    }

    const assignments = await getStudentCppAssignments(user.id);
    const lockedAssignments = assignments.filter((assignment) => !assignment.unlocked);

    if (lockedAssignments.length === 0) {
      return NextResponse.json(
        { error: "All CPP20218 assignments are already unlocked." },
        { status: 409 },
      );
    }

    const selected = lockedAssignments.find((assignment) => assignment.assignmentKey === body.data.assignmentKey);
    if (!selected) {
      return NextResponse.json({ error: "This cluster is already available or could not be found." }, { status: 409 });
    }
    const paymentStage = selected.position === 4 || selected.position === 5
      ? "clusters_4_5"
      : selected.assignmentKey;

    const metadata = {
      userKey: user.id,
      courseSlug: CPP20218_COURSE_SLUG,
      assignmentKey: paymentStage,
      purpose: "assignment_unlock",
    };
    const session = await createStripeCheckoutSession({
      amountCents,
      name: selected.position === 4 || selected.position === 5 ? "CPP20218 Clusters 4 and 5" : `CPP20218 Cluster ${selected.position}`,
      description: "Unlock the next Certificate II Security Operations learning stage.",
      customerEmail: user.email,
      successPath: `/success?course=${CPP20218_COURSE_SLUG}`,
      cancelPath: `/dashboard/course/${CPP20218_COURSE_SLUG}?tab=activities`,
      metadata,
    });

    await createPaymentIntent({
      provider: "stripe",
      purpose: "assignment_unlock",
      userKey: user.id,
      email: user.email,
      courseSlug: CPP20218_COURSE_SLUG,
      assignmentKey: paymentStage,
      amountCents,
      currency: "AUD",
      providerPayerId: typeof session.customer === "string" ? session.customer : null,
      providerPaymentLinkId: session.id,
      checkoutUrl: session.url,
      metadata,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = getStripeUserMessage(error);
    console.error("Assignment checkout failed", error);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
