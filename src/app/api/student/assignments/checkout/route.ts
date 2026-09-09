import { linkSecurityEnrollment, SECURITY_CLUSTER_ONE_AMOUNT } from "@/lib/security-enrollment";
import { getSupabaseAdmin } from "@/lib/supabase";
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

    const amountCents = SECURITY_CLUSTER_ONE_AMOUNT;

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

    await linkSecurityEnrollment(user);
    const db = getSupabaseAdmin();
    const leadResult = await db!.from("enrollment_leads").select("id")
      .eq("security_user_key", user.id).eq("course_slug", CPP20218_COURSE_SLUG)
      .not("document_path", "is", null).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (leadResult.error) throw leadResult.error;
    if (!leadResult.data) return NextResponse.json({ error: "Submit your free enrollment form first at /enroll." }, { status: 403 });
    const enrollmentId = leadResult.data.id;
    const enrollmentResult = await db!.from("course_enrollments").select("status").eq("user_key", user.id).eq("course_slug", CPP20218_COURSE_SLUG).maybeSingle();
    if (enrollmentResult.error) throw enrollmentResult.error;
    if (enrollmentResult.data?.status !== "active") return NextResponse.json({ error: "Please contact SSTA about your course access." }, { status: 403 });
    if (body.data.assignmentKey && body.data.assignmentKey !== "assignment-1") return NextResponse.json({ error: "SSTA manages access to later clusters. Contact your trainer." }, { status: 403 });

    const hasPassedLln = await hasPassedCpp20218Lln(user.id);

    if (!hasPassedLln) {
      const returnTo = `/dashboard/course/${CPP20218_COURSE_SLUG}?tab=activities`;

      return NextResponse.json(
        {
          error: "Please complete the CPP20218 LLN prerequisite before starting Cluster 1.",
          llnRequired: true,
          llnUrl: buildCpp20218LlnUrl(returnTo, "unlock", "assignment-1"),
        },
        { status: 403 },
      );
    }

    const assignments = await getStudentCppAssignments(user.id);
    const lockedAssignments = assignments.filter((assignment) => assignment.assignmentKey === "assignment-1" && !assignment.unlocked);

    if (lockedAssignments.length === 0) {
      return NextResponse.json(
        { error: "Cluster 1 is already unlocked or unavailable." },
        { status: 409 },
      );
    }

    const metadata = {
      userKey: user.id,
      courseSlug: CPP20218_COURSE_SLUG,
      assignmentKey: "assignment-1",
      purpose: "assignment_unlock",
      enrollmentId,
    };
    const session = await createStripeCheckoutSession({
      amountCents,
      name: "CPP20218 Cluster 1",
      description: "Start Cluster 1 of Certificate II in Security Operations. Later clusters are managed by SSTA.",
      customerEmail: user.email,
      successPath: `/success?course=${CPP20218_COURSE_SLUG}`,
      cancelPath: `/dashboard/course/${CPP20218_COURSE_SLUG}?tab=activities`,
      metadata,
    });

    await createPaymentIntent({
      provider: "stripe",
      purpose: "assignment_unlock",
      enrollmentId,
      userKey: user.id,
      email: user.email,
      courseSlug: CPP20218_COURSE_SLUG,
      assignmentKey: "assignment-1",
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
