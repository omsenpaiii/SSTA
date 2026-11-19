import Image from "next/image";
import { FohsComingSoonButton } from "@/components/FohsComingSoonButton";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import type { Course } from "@/lib/courses";

const topics = [
  ["Event readiness", "Understand your position, check the working environment and prepare to work with the wider event team."],
  ["Crowd welfare", "Develop awareness of changing crowd conditions and recognise when a patron may need support."],
  ["Team communication", "Practise clear communication and coordinated responses in event scenarios."],
  ["Professional judgement", "Consider the decisions that help protect patrons, colleagues and the event experience."],
];

export function FohsCoursePage({ course }: { course: Course }) {
  return (
    <main className="min-h-screen bg-white text-[#020d24]">
      <SiteHeader />
      <section className="bg-[#eef8ff] px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="font-black uppercase tracking-widest text-[#0067b1]">FOHS · Non-accredited short course</p>
            <h1 className="mt-5 text-5xl font-black leading-tight sm:text-6xl">Front of House Security</h1>
            <p className="mt-6 text-lg leading-8 text-[#53647c]">{course.overview}</p>
            <FohsComingSoonButton className="mt-8 inline-flex rounded-full bg-[#0067b1] px-7 py-4 font-black text-white hover:bg-[#123e95]" />
            <p className="mt-5 font-bold text-[#53647c]">Face to face · Certificate of participation</p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image src={course.image} alt="Concert security staff beside a front-of-stage crowd barrier" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="text-3xl font-black">Focused on the event environment.</h2>
            <p className="mt-5 text-lg leading-8 text-[#53647c]">Specialist professional development for security workers and event teams, developed around the practical demands of front-of-house operations.</p>
            <p className="mt-5 leading-7 text-[#53647c]">Badger Integrity Group focuses on raising professional standards through practical skills, sound judgement and integrity.</p>
          </div>
          <div className="grid gap-7 sm:grid-cols-2">
            {topics.map(([title, text]) => <div key={title} className="border-t-2 border-[#18aee5] pt-5"><h3 className="text-xl font-black">{title}</h3><p className="mt-3 leading-7 text-[#53647c]">{text}</p></div>)}
          </div>
        </div>
        <div className="mt-14 rounded-3xl bg-[#020d24] p-8 text-white sm:p-10">
          <h2 className="text-3xl font-black">Talk to us about the next course.</h2>
          <p className="mt-4 max-w-3xl leading-7 text-sky-100/85">Dates, duration, venue, fees and entry requirements will be confirmed by the team. This course provides a certificate of participation. It does not award a nationally recognised qualification or security licence, and employment is not guaranteed.</p>
          <FohsComingSoonButton className="mt-7 inline-flex rounded-full bg-[#f5b800] px-6 py-3 font-black text-[#020d24]">Ask about dates and fees</FohsComingSoonButton>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
