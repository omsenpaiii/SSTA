import { MessageSquareQuote, Sparkles } from "lucide-react";
import { FeedbackForm } from "@/components/student/FeedbackForm";

export default function FeedbackPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
      <section className="rounded-[32px] border border-[#dce8f3] bg-white p-7 shadow-[0_18px_50px_rgba(12,50,88,0.08)]">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0f6eb8]">Feedback</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-[#081221]">
          Help us sharpen the student experience.
        </h2>
        <p className="mt-3 max-w-3xl text-base font-semibold leading-7 text-[#5d7389]">
          Share what feels smooth, where you got blocked, or what would make the portal more useful in day-to-day training. Your message goes straight to the SSTA team.
        </p>

        <div className="mt-6 rounded-[28px] border border-[#e1edf6] bg-[#fbfdff] p-6">
          <FeedbackForm />
        </div>
      </section>

      <section className="space-y-6">
        <article className="rounded-[32px] border border-[#dce8f3] bg-white p-7 shadow-[0_18px_50px_rgba(12,50,88,0.08)]">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#eef5fb] text-[#0f6eb8]">
            <Sparkles size={22} />
          </div>
          <h3 className="mt-5 text-2xl font-black tracking-tight text-[#081221]">What to include</h3>
          <div className="mt-5 space-y-4 text-sm font-semibold leading-6 text-[#5d7389]">
            <p>Tell us which page or course you were on.</p>
            <p>Explain what you expected to happen and what actually happened.</p>
            <p>If it is about learning content, mention the course code or activity title.</p>
          </div>
        </article>

        <article className="rounded-[32px] border border-[#dce8f3] bg-white p-7 shadow-[0_18px_50px_rgba(12,50,88,0.08)]">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[#eef5fb] text-[#0f6eb8]">
            <MessageSquareQuote size={22} />
          </div>
          <h3 className="mt-5 text-2xl font-black tracking-tight text-[#081221]">Best for this channel</h3>
          <div className="mt-5 grid gap-3">
            {[
              "Portal bugs or broken flows",
              "Course navigation confusion",
              "Resource requests",
              "General student experience suggestions",
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
      </section>
    </div>
  );
}
