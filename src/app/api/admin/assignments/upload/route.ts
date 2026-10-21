import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getAdminSnapshot } from "@/lib/admin-data";
import { CPP20218_COURSE_SLUG } from "@/lib/cpp20218";
import { processAssignmentUpload } from "@/lib/assignment-upload-server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
    }

    const body = request.headers.get("content-type")?.includes("application/json") ? await request.clone().json() : Object.fromEntries((await request.clone().formData()).entries());
    const userKey = String(body.userKey ?? "").trim();
    const assignmentKey = String(body.assignmentKey ?? "").trim();
    if (!userKey || !assignmentKey) return NextResponse.json({ error: "Missing student or cluster details." }, { status: 400 });

    const { data: enrollment } = await supabase
      .from("course_enrollments")
      .select("id")
      .eq("user_key", userKey)
      .eq("course_slug", CPP20218_COURSE_SLUG)
      .eq("status", "active")
      .maybeSingle();

    if (!enrollment) {
      return NextResponse.json({ error: "Student is not actively enrolled in CPP20218." }, { status: 403 });
    }

    const { data: access } = await supabase
      .from("student_assignment_access")
      .select("id")
      .eq("user_key", userKey)
      .eq("course_slug", CPP20218_COURSE_SLUG)
      .eq("assignment_key", assignmentKey)
      .eq("unlocked", true)
      .maybeSingle();

    if (!access) {
      return NextResponse.json(
        { error: "Unlock this cluster before uploading on behalf of the learner." },
        { status: 403 },
      );
    }

    const result = await processAssignmentUpload(request, supabase, userKey, assignmentKey, admin.email);
    return NextResponse.json("success" in result ? { ...result, snapshot: await getAdminSnapshot(admin.email) } : result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unauthorized admin request." },
      { status: error instanceof Error && error.message.includes("Unauthorized") ? 401 : 400 },
    );
  }
}
