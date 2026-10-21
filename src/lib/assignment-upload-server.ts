import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CPP20218_COURSE_SLUG } from "@/lib/cpp20218";
import { MAX_ASSESSMENT_BYTES, signUploadTicket, verifyUploadTicket } from "@/lib/assignment-upload-ticket";

export async function processAssignmentUpload(request: Request, db: SupabaseClient, userKey: string, assignmentKey: string, adminEmail?: string) {
  const bucket = db.storage.from("student-submissions");
  const actor = adminEmail ?? "student";
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const jsonRequest = request.headers.get("content-type")?.includes("application/json");
  let path: string, fileName: string, size: number, mimeType: string, studentComment: string;
  if (jsonRequest) {
    const body = await request.json();
    if (body.stage === "prepare") {
      size = Number(body.size);
      if (!Number.isSafeInteger(size) || size <= 0 || size > MAX_ASSESSMENT_BYTES) throw new Error("Choose a non-empty assessment file, 50MB or smaller.");
      fileName = String(body.fileName ?? "assessment").replace(/[^\w.\-()\s]/g, "_").replace(/\s+/g, "_").slice(0, 140) || "assessment";
      mimeType = String(body.mimeType || "application/octet-stream").slice(0, 200);
      path = `${userKey}/${assignmentKey}/${randomUUID()}-${fileName}`;
      const { data, error } = await bucket.createSignedUploadUrl(path);
      if (error || !data) throw new Error(error?.message ?? "Unable to prepare upload.");
      const receipt = signUploadTicket({ userKey, assignmentKey, path, fileName, size, mimeType, actor, expires: Date.now() + 60 * 60 * 1000 }, secret);
      return { uploadUrl: data.signedUrl, receipt };
    }
    if (body.stage !== "complete") throw new Error("Unknown upload stage.");
    const ticket = verifyUploadTicket(String(body.receipt ?? ""), secret, userKey, assignmentKey, actor);
    ({ path, fileName, size, mimeType } = ticket);
    studentComment = String(body.studentComment ?? "").trim().slice(0, 4000);
    const { data: info, error } = await bucket.info(path);
    if (error || !info) throw new Error("Your file has not finished uploading. Please try again.");
    if (Number(info.size ?? info.metadata?.size) !== size) throw new Error("Uploaded file size does not match. Please retry.");
  } else {
    // Retain support for already-open pages using the earlier multipart form.
    const body = await request.formData();
    const file = body.get("file");
    if (!(file instanceof File) || !file.size || file.size > MAX_ASSESSMENT_BYTES) throw new Error("Choose a non-empty assessment file, 50MB or smaller.");
    size = file.size;
    fileName = file.name.replace(/[^\w.\-()\s]/g, "_").replace(/\s+/g, "_").slice(0, 140) || "assessment";
    mimeType = file.type || "application/octet-stream";
    path = `${userKey}/${assignmentKey}/${randomUUID()}-${fileName}`;
    studentComment = String(body.get("studentComment") ?? "").trim().slice(0, 4000);
    const { error } = await bucket.upload(path, file, { contentType: mimeType, upsert: false });
    if (error) throw new Error(error.message);
  }
  const previous = await db.from("assignment_submissions").select("file_path,resubmission_count").eq("user_key", userKey).eq("course_slug", CPP20218_COURSE_SLUG).eq("assignment_key", assignmentKey).maybeSingle();
  if (previous.error) throw new Error(previous.error.message);
  // Retrying a completion must not reset review status or increment the submission cycle.
  if (previous.data?.file_path === path) return { success: true };
  const { error } = await db.from("assignment_submissions").upsert({
    user_key: userKey, course_slug: CPP20218_COURSE_SLUG, assignment_key: assignmentKey,
    file_bucket: "student-submissions", file_path: path, file_name: fileName, mime_type: mimeType, file_size: size,
    status: "submitted", student_comment: studentComment || null,
    resubmission_count: previous.data ? Number(previous.data.resubmission_count ?? 0) + 1 : 0,
    submitted_by: adminEmail ? "admin" : "student", uploaded_by_admin_email: adminEmail ?? null,
    admin_comment: null, reviewed_by: null, reviewed_at: null,
    submitted_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  }, { onConflict: "user_key,course_slug,assignment_key" });
  // Keep the uploaded file on a transient database error so completion can be retried.
  if (error) throw new Error(error.message);
  if (previous.data?.file_path) await bucket.remove([previous.data.file_path]);
  return { success: true };
}
