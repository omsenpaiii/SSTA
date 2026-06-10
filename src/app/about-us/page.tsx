import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { benefits, josephProfile } from "@/lib/site-content";

export default function AboutUsPage() {
  return (
    <main className="min-h-screen bg-white text-[#020d24]">
      <SiteHeader />
      <section className="relative isolate overflow-hidden px-5 py-16 sm:px-8 sm:py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(245,184,0,0.18),transparent_24%),radial-gradient(circle_at_85%_12%,rgba(24,174,229,0.18),transparent_28%),linear-gradient(180deg,#ffffff_0%,#eef8ff_100%)]" />
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#0067b1] shadow-sm">
              <ShieldCheck size={15} /> About SSTA
            </p>
            <h1 className="text-4xl font-black leading-tight tracking-normal sm:text-5xl">
              Joseph leads SSTA with practical security experience.
            </h1>
            <p className="mt-5 text-lg font-bold leading-8 text-[#53647c]">
              {josephProfile.summary}
            </p>
            <p className="mt-5 text-base font-bold leading-7 text-[#53647c]">
              {josephProfile.details[0]}
            </p>
            <Link href="/courses" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#0067b1] px-6 py-4 text-sm font-black text-white">
              Explore Courses <ArrowRight size={17} />
            </Link>
          </div>
          <div className="relative h-[420px] overflow-hidden rounded-[1.5rem] border-[10px] border-white shadow-[0_30px_90px_rgba(0,74,143,0.14)]">
            <Image
              src="/ssta-classroom-hero.jpeg"
              alt="Joseph delivering training to SSTA students"
              fill
              sizes="(min-width:1024px) 48vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-4xl rounded-[1.5rem] bg-[#020d24] p-8 text-white shadow-[0_24px_70px_rgba(0,74,143,0.12)]">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-[#f5b800]">
              {josephProfile.name} | {josephProfile.title}
            </p>
            <div className="mt-5 grid gap-4 text-sm font-bold leading-7 text-sky-100/85">
              {josephProfile.details.slice(1).map((detail) => (
                <p key={detail}>{detail}</p>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <article key={benefit.title} className="rounded-[1.25rem] border border-[#18aee5]/14 bg-[#eef8ff] p-6">
                <CheckCircle2 className="text-[#0067b1]" size={28} />
                <h2 className="mt-4 text-xl font-black">{benefit.title}</h2>
                <p className="mt-3 text-sm font-bold leading-6 text-[#53647c]">{benefit.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
