import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { CPP20218_COURSE_SLUG, getStudentCppAssignments } from "@/lib/cpp20218";
import { createPaymentIntent } from "@/lib/payments";
import { createPinchPayer, createPinchPaymentLink, isPinchConfigured } from "@/lib/pinch";
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
  if (!isSupabaseAuthConfigured()) {
    return NextResponse.json(
      { error: "Supabase Auth is not configured yet." },
      { status: 503 },
    );
  }

  if (!isPinchConfigured()) {
    return NextResponse.json(
      { error: "Pinch Payments is not configured yet." },
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

  const payer = await createPinchPayer({
    userKey: user.id,
    email: user.email,
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
  });
  const metadata = {
    userKey: user.id,
    courseSlug: CPP20218_COURSE_SLUG,
    assignmentKey: body.data.assignmentKey ?? "all_locked",
    purpose: "assignment_unlock",
  };
  const paymentLink = await createPinchPaymentLink({
    amountCents,
    payerId: payer.id,
    description: "CPP20218 assignment access unlock",
    successPath: `/success?course=${CPP20218_COURSE_SLUG}`,
    metadata,
  });

  await createPaymentIntent({
    provider: "pinch",
    purpose: "assignment_unlock",
    userKey: user.id,
    email: user.email,
    courseSlug: CPP20218_COURSE_SLUG,
    assignmentKey: body.data.assignmentKey ?? "all_locked",
    amountCents,
    currency: "AUD",
    providerPayerId: payer.id,
    providerPaymentLinkId: paymentLink.id,
    checkoutUrl: paymentLink.url,
    metadata,
  });

  return NextResponse.json({ url: paymentLink.url });
}
