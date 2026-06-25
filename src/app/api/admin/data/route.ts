import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import {
  deleteAdminCourse,
  getAdminSnapshot,
  seedCoursesToSupabase,
  upsertAdminCourse,
  upsertAdminLesson,
  upsertAdminStudent,
} from "@/lib/admin-data";
import { getFallbackCourses } from "@/lib/course-repository";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json(await getAdminSnapshot());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unauthorized." },
      { status: 401 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const action = String(body?.action ?? "");
    const payload = body?.payload;

    if (action === "upsert-course") {
      await upsertAdminCourse(payload);
    } else if (action === "upsert-lesson") {
      await upsertAdminLesson(payload);
    } else if (action === "upsert-student") {
      await upsertAdminStudent(payload);
    } else if (action === "delete-course") {
      await deleteAdminCourse(String(payload?.slug ?? ""));
    } else if (action === "seed-defaults") {
      await seedCoursesToSupabase(getFallbackCourses());
    } else {
      return NextResponse.json({ error: "Unknown admin action." }, { status: 400 });
    }

    return NextResponse.json({ success: true, snapshot: await getAdminSnapshot() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Admin action failed." },
      { status: error instanceof Error && error.message.includes("Unauthorized") ? 401 : 400 },
    );
  }
}
