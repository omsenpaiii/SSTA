import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

function contentDisposition(title: string, mode: "inline" | "download") {
  const safe = title.replace(/[^\w\s.-]/g, "").trim() || "document";
  return `${mode === "download" ? "attachment" : "inline"}; filename="${safe}"`;
}

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const supabase = getSupabaseAdmin();
    const url = new URL(request.url);
    const id = url.searchParams.get("id") ?? "";
    const mode = url.searchParams.get("mode") === "download" ? "download" : "inline";
    if (!supabase || !id) return NextResponse.json({ error: "File not found." }, { status: 404 });

    const { data: document, error: documentError } = await supabase
      .from("interest_lead_documents")
      .select("storage_path,original_name,mime_type")
      .eq("id", id)
      .maybeSingle();
    if (documentError || !document) return NextResponse.json({ error: "File not found." }, { status: 404 });

    const { data, error } = await supabase.storage.from("interest-lead-documents").download(document.storage_path);
    if (error || !data) return NextResponse.json({ error: error?.message ?? "Unable to load file." }, { status: 404 });

    return new NextResponse(await data.arrayBuffer(), {
      headers: {
        "Content-Type": document.mime_type,
        "Content-Disposition": contentDisposition(document.original_name, mode),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized." }, { status: 401 });
  }
}
