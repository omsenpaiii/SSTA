import { NextResponse } from "next/server";
import { createInterestLead, interestSchema } from "@/lib/interests";
import { sendInterestEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = interestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid interest details.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const lead = await createInterestLead(parsed.data);

    try {
      await sendInterestEmail(lead);
    } catch (emailError) {
      console.error("Unable to send interest email:", emailError);
      // We do not fail the entire API response if the email fails, but we log the error.
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to submit interest.";
    const status =
      message.includes("configured") || message.includes("Supabase") ? 503 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
