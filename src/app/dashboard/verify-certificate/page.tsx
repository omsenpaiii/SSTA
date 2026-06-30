import Link from "next/link";
import { BadgeCheck, Mail, PhoneCall, ShieldCheck } from "lucide-react";
import { buildVerifyCertificateSteps } from "@/lib/student-portal";
import { siteInfo } from "@/lib/site-content";

export default function VerifyCertificatePage() {
  const steps = buildVerifyCertificateSteps();

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-[32px] border border-[#dce8f3] bg-white p-7 shadow-[0_18px_50px_rgba(12,50,88,0.08)]">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0f6eb8]">Verify certificate</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-[#081221]">
          Start a fast certificate verification request.
        </h2>
        <p className="mt-3 max-w-3xl text-base font-semibold leading-7 text-[#5d7389]">
          SSTA can help confirm training records, statements of attainment, and certificate details. Bring the core identifiers and the team can guide the next step.
        </p>

        <div className="mt-6 space-y-4">
          {steps.map((step, index) => (
            <div
              key={step}
              className="flex gap-4 rounded-[24px] border border-[#e1edf6] bg-[#fbfdff] p-5"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#0f6eb8] text-sm font-black text-white">
                {index + 1}
              </div>
              <p className="text-sm font-semibold leading-6 text-[#5d7389]">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <article className="rounded-[32px] border border-[#dce8f3] bg-white p-7 shadow-[0_18px_50px_rgba(12,50,88,0.08)]">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#eef5fb] text-[#0f6eb8]">
            <BadgeCheck size={22} />
          </div>
          <h3 className="mt-5 text-2xl font-black tracking-tight text-[#081221]">What to prepare</h3>
          <div className="mt-5 grid gap-3">
            {[
              "Student full name",
              "Course name or code",
              "Certificate number if available",
              "Approximate completion date",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-[#e1edf6] bg-[#fbfdff] px-4 py-3 text-sm font-black text-[#081221]"
              >
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[32px] border border-[#dce8f3] bg-white p-7 shadow-[0_18px_50px_rgba(12,50,88,0.08)]">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#eef5fb] text-[#0f6eb8]">
            <ShieldCheck size={22} />
          </div>
          <h3 className="mt-5 text-2xl font-black tracking-tight text-[#081221]">Contact SSTA for verification</h3>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`mailto:${siteInfo.email}`}
              className="inline-flex items-center gap-2 rounded-full bg-[#0f6eb8] px-5 py-3 text-sm font-black text-white"
            >
              <Mail size={16} />
              Email verification request
            </Link>
            <Link
              href={siteInfo.phoneHref}
              className="inline-flex items-center gap-2 rounded-full border border-[#d9e7f3] px-5 py-3 text-sm font-black text-[#0f6eb8]"
            >
              <PhoneCall size={16} />
              Call SSTA
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
