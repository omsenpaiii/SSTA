import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Cpp20218LlnTest } from "@/components/student/Cpp20218LlnTest";
import { getCurrentUser } from "@/lib/auth";
import { getSecurityGuest } from "@/lib/security-enrollment";
import {
  getLatestCpp20218LlnAttempt,
  getPublicCpp20218LlnQuestions,
} from "@/lib/lln";

export default async function SecurityLlnPage() {
  const user = await getCurrentUser();
  const userKey = user?.id ?? (await getSecurityGuest());
  const attempt = userKey ? await getLatestCpp20218LlnAttempt(userKey) : null;
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-12">
        <Cpp20218LlnTest
          questions={getPublicCpp20218LlnQuestions()}
          latestAttempt={attempt}
          returnTo="/dashboard/course/certificate-ii-security-operations?tab=activities"
        />
      </main>
      <SiteFooter />
    </>
  );
}
