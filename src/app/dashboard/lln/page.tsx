import Link from "next/link";
import { ArrowRight, FileSearch, ShieldQuestion } from "lucide-react";

export default function LlnPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
      <section className="rounded-[32px] border border-[#dce8f3] bg-white p-7 shadow-[0_18px_50px_rgba(12,50,88,0.08)]">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0f6eb8]">LLN</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-[#081221]">
          Language, literacy, and numeracy support.
        </h2>
        <p className="mt-3 max-w-3xl text-base font-semibold leading-7 text-[#5d7389]">
          Use this space as your student support checkpoint before or during training. If you need guidance with reading load, communication confidence, or assessment readiness, SSTA can step in early.
        </p>
        <div className="mt-6 rounded-[28px] border border-[#e1edf6] bg-[#fbfdff] p-6">
          <h3 className="text-xl font-black text-[#081221]">How this helps</h3>
          <div className="mt-4 space-y-3 text-sm font-semibold leading-6 text-[#5d7389]">
            <p>Clarify whether a course is the right fit before you get deep into the work.</p>
            <p>Surface any support needs early so training stays achievable and confident.</p>
            <p>Give SSTA enough context to adjust guidance, pacing, or next steps where possible.</p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <article className="rounded-[32px] border border-[#dce8f3] bg-white p-7 shadow-[0_18px_50px_rgba(12,50,88,0.08)]">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#eef5fb] text-[#0f6eb8]">
            <ShieldQuestion size={22} />
          </div>
          <h3 className="mt-5 text-2xl font-black tracking-tight text-[#081221]">When to reach out</h3>
          <div className="mt-5 grid gap-3">
            {[
              "You want help understanding assessment language",
              "You need support with written responses or comprehension load",
              "You are unsure whether the training level matches your current readiness",
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
            <FileSearch size={22} />
          </div>
          <h3 className="mt-5 text-2xl font-black tracking-tight text-[#081221]">Need help now?</h3>
          <p className="mt-3 text-sm font-semibold leading-6 text-[#5d7389]">
            Send a note through Feedback or contact SSTA directly so the team can guide the best next step for your learning pathway.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/dashboard/feedback"
              className="inline-flex items-center gap-2 rounded-full bg-[#0f6eb8] px-5 py-3 text-sm font-black text-white"
            >
              Share support needs
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/dashboard/contact"
              className="inline-flex items-center gap-2 rounded-full border border-[#d9e7f3] px-5 py-3 text-sm font-black text-[#0f6eb8]"
            >
              Contact SSTA
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
