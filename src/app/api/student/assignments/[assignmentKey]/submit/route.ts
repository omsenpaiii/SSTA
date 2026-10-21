import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { CPP20218_COURSE_SLUG } from "@/lib/cpp20218";
import { processAssignmentUpload } from "@/lib/assignment-upload-server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

type SubmitRouteProps = {
  params: Promise<{ assignmentKey: string }>;
};

export async function POST(request: Request, { params }: SubmitRouteProps) {
  try {
    const user = await getCurrentUser();
    const supabase = getSupabaseAdmin();

    if (!user || !supabase) {
      return NextResponse.json({ error: "Student access is not available." }, { status: 401 });
    }

    const { assignmentKey } = await params;
    const { data: access } = await supabase
      .from("student_assignment_access")
      .select("id")
      .eq("user_key", user.id)
      .eq("course_slug", CPP20218_COURSE_SLUG)
      .eq("assignment_key", assignmentKey)
      .eq("unlocked", true)
      .maybeSingle();

    if (!access) {
      return NextResponse.json({ error: "This assignment is locked." }, { status: 403 });
    }

    const { data: enrollment, error: enrollmentError } = await supabase.from("course_enrollments").select("id").eq("user_key", user.id).eq("course_slug", CPP20218_COURSE_SLUG).eq("status", "active").maybeSingle();
    if (enrollmentError) throw new Error(enrollmentError.message);
    if (!enrollment) return NextResponse.json({ error: "Your enrolment is not active. Contact SSTA for access." }, { status: 403 });
    return NextResponse.json(await processAssignmentUpload(request, supabase, user.id, assignmentKey));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to upload assessment." }, { status: 400 });
  }
}
