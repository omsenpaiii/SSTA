import Link from "next/link";
import { ArrowRight, BookOpenText, ExternalLink, LifeBuoy } from "lucide-react";
import { buildUsefulLinks } from "@/lib/student-portal";

export default function UsefulLinksPage() {
  const links = buildUsefulLinks();

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-[#dce8f3] bg-white p-7 shadow-[0_18px_50px_rgba(12,50,88,0.08)]">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0f6eb8]">Useful links</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-[#081221]">
          Keep your important student resources close.
        </h2>
        <p className="mt-3 max-w-3xl text-base font-semibold leading-7 text-[#5d7389]">
          These are the quickest routes for learning support, course browsing, and student help across the SSTA ecosystem.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {links.map((item, index) => (
          <article
            key={item.title}
            className="rounded-[28px] border border-[#dce8f3] bg-white p-6 shadow-[0_18px_50px_rgba(12,50,88,0.08)]"
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#eef5fb] text-[#0f6eb8]">
              {index === 0 ? <BookOpenText size={22} /> : index === 1 ? <ExternalLink size={22} /> : <LifeBuoy size={22} />}
            </div>
            <h3 className="mt-5 text-xl font-black text-[#081221]">{item.title}</h3>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#5d7389]">{item.description}</p>
            <Link
              href={item.href}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0f6eb8] px-5 py-3 text-sm font-black text-white"
            >
              {item.actionLabel}
              <ArrowRight size={16} />
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
