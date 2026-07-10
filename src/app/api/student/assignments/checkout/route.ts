import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { CPP20218_COURSE_SLUG, getStudentCppAssignments } from "@/lib/cpp20218";
import { buildCpp20218LlnUrl, hasPassedCpp20218Lln } from "@/lib/lln";
import { createPaymentIntent } from "@/lib/payments";
import { createStripeCheckoutSession, getStripeUserMessage, isStripeConfigured } from "@/lib/stripe";
import { isSupabaseAuthConfigured } from "@/lib/supabase";

const checkoutSchema = z.object({
  assignmentKey: z.string().min(1).optional(),
});

export const runtime = "nodejs";

function getUnlockAmountCents() {
  const raw = process.env.CPP20218_ASSIGNMENT_UNLOCK_AMOUNT_CENTS;
  const amount = raw ? Number(raw) : 0;

  return Number.isFinite(amount) && amount > 0 ? Math.round(amount) : null;
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

    const hasPassedLln = await hasPassedCpp20218Lln(user.id);

    if (!hasPassedLln) {
      const returnTo = `/dashboard/course/${CPP20218_COURSE_SLUG}?tab=activities`;

      return NextResponse.json(
        {
          error: "Please complete the CPP20218 LLN prerequisite before unlocking more clusters.",
          llnRequired: true,
          llnUrl: buildCpp20218LlnUrl(returnTo, "unlock", body.data.assignmentKey ?? "all_locked"),
        },
        { status: 403 },
      );
    }

    const assignments = await getStudentCppAssignments(user.id);
    const lockedAssignments = assignments.filter((assignment) => !assignment.unlocked);

    if (lockedAssignments.length === 0) {
      return NextResponse.json(
        { error: "All CPP20218 assignments are already unlocked." },
        { status: 409 },
      );
    }

    const metadata = {
      userKey: user.id,
      courseSlug: CPP20218_COURSE_SLUG,
      assignmentKey: body.data.assignmentKey ?? "all_locked",
      purpose: "assignment_unlock",
    };
    const session = await createStripeCheckoutSession({
      amountCents,
      name: "CPP20218 remaining cluster unlock",
      description: "Unlock all remaining Certificate II Security Operations clusters.",
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
      assignmentKey: body.data.assignmentKey ?? "all_locked",
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
