import { isEnrollmentDocument } from "@/lib/enrollment-document";
import { extractRawText } from "mammoth";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  getSecurityGuest,
  linkSecurityEnrollment,
  SECURITY_ENROLLMENT_BUCKET,
} from "@/lib/security-enrollment";
import { CPP20218_COURSE_SLUG } from "@/lib/cpp20218";
import { verifyRecaptchaToken } from "@/lib/recaptcha";
import { sendEnrollmentEmail } from "@/lib/email";
import {
  getEnrollmentLead,
  updateEnrollmentEmailStatus,
} from "@/lib/enrollment";

const schema = z.object({
  firstName: z.string().trim().min(2).max(100),
  lastName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(10).max(30),
  address: z.string().trim().min(10).max(1000),
  captchaToken: z.string().min(1),
});
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 4.4 * 1024 * 1024)
    return NextResponse.json(
      { error: "Maximum upload size is 4 MB." },
      { status: 413 },
    );
  try {
    const form = await request.formData();
    const parsed = schema.safeParse(Object.fromEntries(form));
    const file = form.get("document");
    if (
      !parsed.success ||
      !(file instanceof File) ||
      !file.size ||
      file.size > 4 * 1024 * 1024 ||
      !/\.docx$/i.test(file.name)
    ) {
      return NextResponse.json(
        {
          error:
            "Enter your contact details and attach the completed Word (.docx) form, up to 4 MB.",
        },
        { status: 400 },
      );
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    if (!isEnrollmentDocument(bytes))
      return NextResponse.json(
        { error: "Please upload a valid Word .docx document." },
        { status: 400 },
      );
    try {
      await extractRawText({ buffer: bytes });
    } catch {
      return NextResponse.json(
        {
          error:
            "The Word document could not be read. Please save a new .docx copy and try again.",
        },
        { status: 400 },
      );
    }
    const captcha = await verifyRecaptchaToken(parsed.data.captchaToken);
    if (!captcha.success)
      return NextResponse.json(
        { error: "Please complete the security check again." },
        { status: 403 },
      );
    const db = getSupabaseAdmin();
    if (!db) throw new Error("Enrollment service is unavailable.");
    const guest = await getSecurityGuest(true);
    const user = await getCurrentUser();
    const email = (user?.email ?? parsed.data.email).toLowerCase();
    const id = randomUUID();
    const path = `${id}/enrollment.docx`;
    const upload = await db.storage
      .from(SECURITY_ENROLLMENT_BUCKET)
      .upload(path, bytes, {
        contentType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        upsert: false,
      });
    if (upload.error) throw upload.error;
    const result = await db
      .from("enrollment_leads")
      .insert({
        id,
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        email,
        phone: parsed.data.phone,
        address: parsed.data.address,
        date_of_birth: null,
        usi: "",
        course_slug: CPP20218_COURSE_SLUG,
        origin: "self_enrolled",
        payment_status: "pending",
        document_path: path,
        document_name: file.name.slice(0, 200),
        security_guest_key: guest,
        security_user_key: null,
      });
    if (result.error) {
      await db.storage.from(SECURITY_ENROLLMENT_BUCKET).remove([path]);
      throw result.error;
    }
    if (user) await linkSecurityEnrollment(user);
    try {
      const lead = await getEnrollmentLead(id);
      if (lead) await sendEnrollmentEmail(lead);
      await updateEnrollmentEmailStatus({
        enrollmentId: id,
        emailStatus: "sent",
      });
    } catch (error) {
      await updateEnrollmentEmailStatus({
        enrollmentId: id,
        emailStatus: "failed",
        emailError:
          error instanceof Error ? error.message : "Notification failed",
      });
    }
    return NextResponse.json({ submitted: true, llnUrl: "/lln/security" });
  } catch (error) {
    console.error("Security enrollment failed", error);
    return NextResponse.json(
      {
        error:
          "Unable to save your application. Please try again or contact SSTA.",
      },
      { status: 503 },
    );
  }
}
