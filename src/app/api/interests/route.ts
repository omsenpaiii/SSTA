import { NextResponse } from "next/server";
import { createInterestLead, interestSchema } from "@/lib/interests";
import { sendInterestEmail } from "@/lib/email";
import { isRecaptchaConfigured, verifyRecaptchaToken } from "@/lib/recaptcha";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const MAX_DOCUMENTS = 5;
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;
const INTEREST_DOCUMENT_BUCKET = "interest-lead-documents";
const allowedMimeTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);

type InterestPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  courseSlug: string;
  message?: string;
  captchaToken: string;
};

function safeFileName(value: string) {
  return value.replace(/[^\w.\-()\s]/g, "_").replace(/\s+/g, "_").slice(0, 140) || "document";
}

async function readRequest(request: Request): Promise<{ payload: InterestPayload; documents: File[] }> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return { payload: await request.json() as InterestPayload, documents: [] };
  }

  const formData = await request.formData();
  const documents = formData.getAll("documents");
  if (documents.some((item) => !(item instanceof File))) throw new Error("Invalid document upload.");

  return {
    payload: {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      courseSlug: String(formData.get("courseSlug") ?? ""),
      message: String(formData.get("message") ?? ""),
      captchaToken: String(formData.get("captchaToken") ?? ""),
    },
    documents: documents as File[],
  };
}

function validateDocuments(documents: File[]) {
  if (documents.length > MAX_DOCUMENTS) return `Upload no more than ${MAX_DOCUMENTS} supporting documents.`;
  for (const document of documents) {
    if (!document.name || document.size <= 0) return "Each uploaded document must contain a file.";
    if (!allowedMimeTypes.has(document.type)) return "Documents must be PDF, JPG, or PNG files.";
    if (document.size > MAX_DOCUMENT_SIZE) return "Each document must be 10 MB or smaller.";
  }
  return null;
}

export async function POST(request: Request) {
  let payload: InterestPayload;
  let documents: File[];
  try {
    ({ payload, documents } = await readRequest(request));
  } catch {
    return NextResponse.json({ error: "Invalid enquiry submission." }, { status: 400 });
  }

  const parsed = interestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid enquiry details.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const documentError = validateDocuments(documents);
  if (documentError) return NextResponse.json({ error: documentError }, { status: 400 });
  if (!isRecaptchaConfigured()) return NextResponse.json({ error: "reCAPTCHA is not configured yet." }, { status: 503 });

  const verification = await verifyRecaptchaToken(parsed.data.captchaToken).catch((error) => {
    const message = error instanceof Error ? error.message : "Unable to verify reCAPTCHA.";
    return NextResponse.json({ error: message }, { status: message.includes("configured") ? 503 : 502 });
  });
  if (verification instanceof NextResponse) return verification;
  if (!verification.success) return NextResponse.json({ error: "reCAPTCHA verification failed. Please try again." }, { status: 403 });

  const { captchaToken, ...leadInput } = parsed.data;
  void captchaToken;
  const uploadedPaths: string[] = [];
  let leadId: string | null = null;

  try {
    const lead = await createInterestLead(leadInput);
    leadId = lead.id;
    if (documents.length) {
      const supabase = getSupabaseAdmin();
      if (!supabase || lead.isMock) throw new Error("Document uploads are unavailable until Supabase is configured.");

      const documentRows = [];
      for (const [index, document] of documents.entries()) {
        const originalName = safeFileName(document.name);
        const path = `${lead.id}/${Date.now()}-${index + 1}-${originalName}`;
        const { error: uploadError } = await supabase.storage
          .from(INTEREST_DOCUMENT_BUCKET)
          .upload(path, document, { contentType: document.type, upsert: false });
        if (uploadError) throw new Error(uploadError.message);
        uploadedPaths.push(path);
        documentRows.push({ interest_lead_id: lead.id, storage_path: path, original_name: originalName, mime_type: document.type, file_size: document.size });
      }
      const { error: documentInsertError } = await supabase.from("interest_lead_documents").insert(documentRows);
      if (documentInsertError) throw new Error(documentInsertError.message);
    }

    try {
      await sendInterestEmail(lead);
    } catch (emailError) {
      console.error("Unable to send interest email:", emailError);
    }
    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (error) {
    const supabase = getSupabaseAdmin();
    if (supabase && uploadedPaths.length) await supabase.storage.from(INTEREST_DOCUMENT_BUCKET).remove(uploadedPaths);
    if (supabase && leadId) await supabase.from("interest_leads").delete().eq("id", leadId);
    const message = error instanceof Error ? error.message : "Unable to submit enquiry.";
    return NextResponse.json({ error: message }, { status: message.includes("configured") || message.includes("Supabase") ? 503 : 500 });
  }
}
