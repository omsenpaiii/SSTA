import { getCourse } from "@/lib/courses";
import { getSupabaseAdmin } from "@/lib/supabase";

export type CourseAccess = {
  course_slug: string;
  status: "active" | "refunded" | "revoked";
  stripe_session_id: string | null;
  amount_paid: number | null;
  currency: string | null;
  created_at: string;
};

export async function getUserAccess(userId: string) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("course_enrollments")
    .select("course_slug,status,stripe_session_id,amount_paid,currency,created_at")
    .eq("clerk_user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CourseAccess[];
}

export async function userHasCourseAccess(userId: string, courseSlug: string) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return false;
  }

  const { data, error } = await supabase
    .from("course_enrollments")
    .select("id")
    .eq("clerk_user_id", userId)
    .eq("course_slug", courseSlug)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function grantCourseAccess(input: {
  clerkUserId: string;
  courseSlug: string;
  stripeCustomerId?: string | null;
  stripeSessionId?: string | null;
  amountPaid?: number | null;
  currency?: string | null;
  email?: string | null;
}) {
  const supabase = getSupabaseAdmin();
  const course = getCourse(input.courseSlug);

  if (!course) {
    throw new Error(`Unknown course: ${input.courseSlug}`);
  }

  if (!supabase) {
    return { skipped: true };
  }

  const { error: profileError } = await supabase.from("student_profiles").upsert(
    {
      clerk_user_id: input.clerkUserId,
      email: input.email,
      stripe_customer_id: input.stripeCustomerId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "clerk_user_id" },
  );

  if (profileError) {
    throw new Error(profileError.message);
  }

  const { error } = await supabase.from("course_enrollments").upsert(
    {
      clerk_user_id: input.clerkUserId,
      course_slug: input.courseSlug,
      status: "active",
      stripe_customer_id: input.stripeCustomerId,
      stripe_session_id: input.stripeSessionId,
      amount_paid: input.amountPaid,
      currency: input.currency,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "clerk_user_id,course_slug" },
  );

  if (error) {
    throw new Error(error.message);
  }

  return { skipped: false };
}

export async function recordLessonProgress(input: {
  clerkUserId: string;
  courseSlug: string;
  lessonId: string;
  progressSeconds: number;
  completed?: boolean;
}) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return { skipped: true };
  }

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      clerk_user_id: input.clerkUserId,
      course_slug: input.courseSlug,
      lesson_id: input.lessonId,
      progress_seconds: input.progressSeconds,
      completed: input.completed ?? false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "clerk_user_id,course_slug,lesson_id" },
  );

  if (error) {
    throw new Error(error.message);
  }

  return { skipped: false };
}
