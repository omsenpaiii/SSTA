import { NextResponse } from "next/server";
import { getCurrentUser, isAdminEmail } from "@/lib/auth";
import {
  getEligibleEnrollmentApplicationCourses,
  INITIAL_ENROLMENT_PAYMENT_CENTS,
} from "@/lib/enrollment-application";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({
      user: null,
      enrolmentForm: {
        unlocked: false,
        amountCents: INITIAL_ENROLMENT_PAYMENT_CENTS,
        destinationHref: "/enrolment-application",
        eligibleCourses: [],
      },
    });
  }

  const eligibleCourses = await getEligibleEnrollmentApplicationCourses(user.id);
  const destinationHref = eligibleCourses.length === 1
    ? `/enrolment-application?course=${encodeURIComponent(eligibleCourses[0].slug)}`
    : "/enrolment-application";

  return NextResponse.json({
    user: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      initials: user.initials,
      dashboardHref: isAdminEmail(user.email) ? "/admin" : "/dashboard",
    },
    enrolmentForm: {
      unlocked: eligibleCourses.length > 0,
      amountCents: INITIAL_ENROLMENT_PAYMENT_CENTS,
      destinationHref,
      eligibleCourses,
    },
  });
}
