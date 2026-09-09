import { verifyRecaptchaToken } from "@/lib/recaptcha";
import { getSecurityGuest } from "@/lib/security-enrollment";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import {
  getPublicCpp20218LlnQuestions,
  recordCpp20218LlnAttempt,
} from "@/lib/lln";

const submitSchema = z.object({
  answers: z.record(z.string().max(100), z.string().max(100)),
  captchaToken: z.string().min(1),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 16384)
    return NextResponse.json(
      { error: "Submission too large." },
      { status: 413 },
    );
  const user = await getCurrentUser();

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 },
    );
  }

  const body = submitSchema.safeParse(payload);

  if (!body.success) {
    return NextResponse.json(
      { error: "Invalid LLN test submission." },
      { status: 400 },
    );
  }

  const expectedIds = new Set(
    getPublicCpp20218LlnQuestions().map((question) => question.id),
  );
  const answers = Object.fromEntries(
    Object.entries(body.data.answers).filter(([questionId]) =>
      expectedIds.has(questionId),
    ),
  );

  if (Object.keys(answers).length !== expectedIds.size) {
    return NextResponse.json(
      { error: "Please answer every LLN question before submitting." },
      { status: 400 },
    );
  }

  try {
    const captcha = await verifyRecaptchaToken(body.data.captchaToken);
    if (!captcha.success)
      return NextResponse.json(
        { error: "Please complete the security check again." },
        { status: 403 },
      );
    const attempt = await recordCpp20218LlnAttempt({
      userKey: user?.id ?? (await getSecurityGuest(true))!,
      email: user?.email ?? "",
      answers,
    });

    return NextResponse.json({ attempt });
  } catch (error) {
    console.error("Security LLN submission failed", error);
    return NextResponse.json(
      { error: "Unable to save your LLN result. Please try again." },
      { status: 503 },
    );
  }
}
