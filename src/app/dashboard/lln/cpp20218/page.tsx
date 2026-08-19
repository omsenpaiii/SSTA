import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { START_TODAY_AMOUNT_AUD } from "@/lib/courses";
import {
  getLatestCpp20218LlnAttempt,
  getPublicCpp20218LlnQuestions,
  normalizeLlnReturnTo,
  normalizeCpp20218LlnMode,
} from "@/lib/lln";
import { Cpp20218LlnTest } from "@/components/student/Cpp20218LlnTest";

type Cpp20218LlnPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Cpp20218LlnPage({ searchParams }: Cpp20218LlnPageProps) {
  const params = await searchParams;
  const returnToParam = Array.isArray(params?.returnTo) ? params?.returnTo[0] : params?.returnTo;
  const modeParam = Array.isArray(params?.mode) ? params?.mode[0] : params?.mode;
  const assignmentKeyParam = Array.isArray(params?.assignmentKey)
    ? params?.assignmentKey[0]
    : params?.assignmentKey;
  const returnTo = normalizeLlnReturnTo(returnToParam);
  const mode = normalizeCpp20218LlnMode(modeParam);
  const user = await getCurrentUser();

  if (!user) {
    const query = new URLSearchParams({ returnTo });

    if (mode !== "continue") {
      query.set("mode", mode);
    }

    if (assignmentKeyParam) {
      query.set("assignmentKey", assignmentKeyParam);
    }

    redirect(`/sign-in?redirect_url=${encodeURIComponent(`/dashboard/lln/cpp20218?${query.toString()}`)}`);
  }

  const latestAttempt = await getLatestCpp20218LlnAttempt(user.id);
  const buyAmountCents = START_TODAY_AMOUNT_AUD * 100;
  const unlockAmountCents = 15000;

  return (
    <Cpp20218LlnTest
      questions={getPublicCpp20218LlnQuestions()}
      latestAttempt={latestAttempt}
      returnTo={returnTo}
      mode={mode}
      assignmentKey={assignmentKeyParam ?? null}
      buyAmountCents={buyAmountCents}
      unlockAmountCents={unlockAmountCents}
    />
  );
}
