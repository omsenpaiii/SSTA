import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getPublicCpp20218LlnQuestions, recordCpp20218LlnAttempt } from "@/lib/lln";

const submitSchema = z.object({
  answers: z.record(z.string(), z.string()),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Please sign in to submit the LLN test." }, { status: 401 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const body = submitSchema.safeParse(payload);

  if (!body.success) {
    return NextResponse.json({ error: "Invalid LLN test submission." }, { status: 400 });
  }

  const expectedIds = new Set(getPublicCpp20218LlnQuestions().map((question) => question.id));
  const answers = Object.fromEntries(
    Object.entries(body.data.answers).filter(([questionId]) => expectedIds.has(questionId)),
  );

  if (Object.keys(answers).length !== expectedIds.size) {
    return NextResponse.json(
      { error: "Please answer every LLN question before submitting." },
      { status: 400 },
    );
  }

  const attempt = await recordCpp20218LlnAttempt({
    userKey: user.id,
    email: user.email,
    answers,
  });

  return NextResponse.json({ attempt });
}
