import { NextResponse } from "next/server";
import { extractRawText } from "mammoth";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase";
import { SECURITY_ENROLLMENT_BUCKET } from "@/lib/security-enrollment";

const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 403 },
    );
  }
  const db = getSupabaseAdmin();
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (!db || !id || !/^[a-f0-9-]{36}$/i.test(id))
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  const { data: lead, error } = await db
    .from("enrollment_leads")
    .select(
      "first_name,last_name,email,phone,address,document_path,document_name",
    )
    .eq("id", id)
    .maybeSingle();
  if (error || !lead?.document_path)
    return NextResponse.json({ error: "File not found." }, { status: 404 });
  const file = await db.storage
    .from(SECURITY_ENROLLMENT_BUCKET)
    .download(lead.document_path);
  if (file.error || !file.data)
    return NextResponse.json(
      { error: "Unable to load file." },
      { status: 404 },
    );
  const bytes = await file.data.arrayBuffer();
  const headers = {
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  };
  if (url.searchParams.get("download") === "1")
    return new NextResponse(bytes, {
      headers: {
        ...headers,
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="enrollment.docx"; filename*=UTF-8''${encodeURIComponent(lead.document_name ?? "enrollment.docx")}`,
      },
    });
  try {
    const { value } = await extractRawText({ buffer: Buffer.from(bytes) });
    return new NextResponse(
      `<!doctype html><html><head><meta charset="utf-8"><title>Security enrollment</title></head><body><main><h1>${escape(lead.first_name)} ${escape(lead.last_name)}</h1><p>${escape(lead.email)} | ${escape(lead.phone)}</p><p>${escape(lead.address)}</p><a href="?id=${id}&download=1">Download original Word form</a><h2>Enrollment document text</h2><p>Text preview. Download the original document to review its layout and signatures.</p><pre style="white-space:pre-wrap;font:16px/1.6 sans-serif">${escape(value)}</pre></main></body></html>`,
      {
        headers: {
          ...headers,
          "Content-Type": "text/html; charset=utf-8",
          "Content-Security-Policy":
            "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'self'",
        },
      },
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "Text preview is unavailable. Use Download Word to view the original.",
      },
      { status: 422 },
    );
  }
}
