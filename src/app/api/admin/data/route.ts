import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireAdmin } from "@/lib/admin";
import {
  archiveAdminStudent,
  completeAdminEnrollment,
  archiveAdminCourse,
  getAdminSnapshot,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  restoreAdminCourse,
  restoreAdminStudent,
  updateAdminCertificateStatus,
  reviewAdminAssignment,
  updateAdminAssignmentAccess,
  upsertAdminCourse,
  upsertAdminLesson,
  upsertAdminLead,
  upsertAdminStudent,
} from "@/lib/admin-data";

export const runtime = "nodejs";

function adminErrorMessage(error: unknown) {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? "Please check the form fields and try again.";
  }
  return error instanceof Error ? error.message : "Admin action failed.";
}

export async function GET() {
  try {
    const admin = await requireAdmin();
    return NextResponse.json(await getAdminSnapshot(admin.email));
  } catch (error) {
    return NextResponse.json(
      { error: adminErrorMessage(error) },
      { status: 401 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const action = String(body?.action ?? "");
    const payload = body?.payload;

    if (action === "upsert-course") {
      await upsertAdminCourse(payload);
    } else if (action === "upsert-lesson") {
      await upsertAdminLesson(payload);
    } else if (action === "upsert-student") {
      await upsertAdminStudent(payload);
    } else if (action === "upsert-lead") {
      await upsertAdminLead(payload);
    } else if (action === "complete-enrollment") {
      await completeAdminEnrollment(payload, admin.email);
    } else if (action === "update-certificate-status") {
      await updateAdminCertificateStatus(payload);
    } else if (action === "archive-student") {
      await archiveAdminStudent(payload, admin.email);
    } else if (action === "restore-student") {
      await restoreAdminStudent(payload);
    } else if (action === "archive-course") {
      await archiveAdminCourse(String(payload?.slug ?? ""), admin.email);
    } else if (action === "restore-course") {
      await restoreAdminCourse(String(payload?.slug ?? ""));
    } else if (action === "mark-notification-read") {
      await markAdminNotificationRead(payload, admin.email);
    } else if (action === "mark-all-notifications-read") {
      await markAllAdminNotificationsRead(
        Array.isArray(payload?.eventKeys) ? payload.eventKeys.map(String) : [],
        admin.email,
      );
    } else if (action === "review-assignment") {
      await reviewAdminAssignment(payload, admin.email);
    } else if (action === "update-assignment-access") {
      await updateAdminAssignmentAccess(payload, admin.email);
    } else {
      return NextResponse.json({ error: "Unknown admin action." }, { status: 400 });
    }

    return NextResponse.json({ success: true, snapshot: await getAdminSnapshot(admin.email) });
  } catch (error) {
    return NextResponse.json(
      { error: adminErrorMessage(error) },
      { status: error instanceof Error && error.message.includes("Unauthorized") ? 401 : 400 },
    );
  }
}
