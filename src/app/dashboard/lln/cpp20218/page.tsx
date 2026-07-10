import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getLatestCpp20218LlnAttempt,
  getPublicCpp20218LlnQuestions,
  normalizeLlnReturnTo,
} from "@/lib/lln";
import { Cpp20218LlnTest } from "@/components/student/Cpp20218LlnTest";

type Cpp20218LlnPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Cpp20218LlnPage({ searchParams }: Cpp20218LlnPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in?redirect_url=/dashboard/lln/cpp20218");
  }

  const params = await searchParams;
  const returnToParam = Array.isArray(params?.returnTo) ? params?.returnTo[0] : params?.returnTo;
  const returnTo = normalizeLlnReturnTo(returnToParam);
  const latestAttempt = await getLatestCpp20218LlnAttempt(user.id);

  return (
    <Cpp20218LlnTest
      questions={getPublicCpp20218LlnQuestions()}
      latestAttempt={latestAttempt}
      returnTo={returnTo}
    />
  );
}
