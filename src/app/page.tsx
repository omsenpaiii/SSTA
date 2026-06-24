"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpenCheck,
  Lock,
  Play,
  Sparkles,
} from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CheckoutButton } from "@/components/CheckoutButton";
import { InterestModal } from "@/components/InterestModal";
import { benefits, faqs, josephProfile, testimonials } from "@/lib/site-content";
import { courseCategories, courses, getFeaturedCourse, type CourseLesson } from "@/lib/courses";

const reveal = {
  hidden: { opacity: 0, y: 34 },
  visible: { opacity: 1, y: 0 },
};

function getEmbedUrl(url: string, provider: "youtube" | "google-drive"): string {
  if (!url) return "";
  if (provider === "youtube") {
    if (url.includes("/embed/")) return url;
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\\s]{11})/i);
    return ytMatch && ytMatch[1] ? `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0` : url;
  }
  if (url.includes("/preview")) return url;
  const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  return driveMatch && driveMatch[1] ? `https://drive.google.com/file/d/${driveMatch[1]}/preview` : url;
}

export default function Home() {
  const featuredCourse = getFeaturedCourse();
  const lessons: CourseLesson[] = featuredCourse.lessons;
  const firstPreview = lessons.find((lesson) => lesson.isPreview) ?? lessons[0];
  const [activeVideoUrl, setActiveVideoUrl] = useState(() =>
    firstPreview ? getEmbedUrl(firstPreview.videoUrl, firstPreview.videoProvider) : "",
  );
  const [activeLessonId, setActiveLessonId] = useState(firstPreview?.id ?? "");

  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#020d24]">
      <SiteHeader />

      <section className="relative isolate min-h-screen overflow-hidden bg-[#020d24] px-5 pb-12 pt-16 sm:px-8 lg:px-12">
        <div className="absolute inset-0 -z-30">
          <Image
            src="/hero.jpeg"
            alt="SSTA classroom training session"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(115deg,rgba(2,13,36,0.9)_10%,rgba(2,13,36,0.76)_42%,rgba(2,13,36,0.42)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_14%_18%,rgba(245,184,0,0.18),transparent_18%),radial-gradient(circle_at_82%_16%,rgba(24,174,229,0.16),transparent_22%)]" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-center pb-12 pt-20 text-left lg:min-h-[calc(100vh-8rem)] lg:items-center lg:pt-16 lg:text-center">

          <motion.div
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 max-w-4xl lg:mx-auto"
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#f5b800]/45 bg-white/12 px-4 py-2 text-sm font-black text-[#ffd56b] shadow-[0_10px_30px_rgba(245,184,0,0.18)] backdrop-blur lg:mx-auto">
              <Sparkles size={16} fill="currentColor" />
              Knowledge is power
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[0.96] tracking-normal text-white sm:text-6xl lg:text-7xl">
              Select Security Training Academy.
            </h1>
            <p className="mt-7 max-w-3xl text-lg font-bold leading-8 text-sky-50/88 sm:text-xl">
              Explore security, first aid, workplace safety, and career pathway courses with practical guidance from the SSTA team.
            </p>
            <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row lg:justify-center">
              <a
                href="#courses"
                className="inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#020d24] px-8 text-base font-black text-white shadow-[0_22px_45px_rgba(2,13,36,0.16)] transition hover:-translate-y-0.5 hover:bg-[#0067b1]"
              >
                Explore courses <ArrowRight size={20} />
              </a>
              <a
                href="#video"
                className="inline-flex h-14 items-center justify-center gap-3 rounded-full border border-[#18aee5]/45 bg-white px-8 text-base font-black text-[#0067b1] shadow-[0_16px_36px_rgba(0,103,177,0.08)] transition hover:-translate-y-0.5 hover:border-[#0067b1]"
              >
                <Play size={18} fill="currentColor" /> Watch preview
              </a>
            </div>
            <div className="mt-10 max-w-2xl rounded-[1.5rem] border border-white/15 bg-white/10 p-5 backdrop-blur-md lg:mx-auto">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-[#ffd56b]">
                Practical in-person learning
              </p>
              <p className="mt-3 text-base font-bold leading-7 text-white/88">
                Train with SSTA in a classroom environment designed for real skills, direct guidance, and confident outcomes.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="courses" className="bg-white px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={reveal}
            transition={{ duration: 0.65 }}
            className="mb-12 text-center"
          >
            <p className="mb-3 text-sm font-black uppercase tracking-[0.34em] text-[#0067b1]">
              Our Courses
            </p>
            <h2 className="mx-auto max-w-3xl text-4xl font-black tracking-normal sm:text-5xl">
              Industry-ready training with clear pathways.
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-base font-bold leading-7 text-[#53647c]">
              Explore SSTA programs with clear categories, transparent pathways, practical requirements, and additional learning options.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {courseCategories.map((category, index) => (
              <motion.article
                key={category.slug}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                className="group overflow-hidden rounded-[1.25rem] border border-[#18aee5]/14 bg-white shadow-[0_24px_70px_rgba(0,74,143,0.1)] transition duration-500 hover:-translate-y-2"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image src={category.image} alt={category.title} fill sizes="(min-width:1024px) 25vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020d24]/80 via-[#0067b1]/20 to-transparent" />
                  <h3 className="absolute bottom-4 left-4 right-4 text-2xl font-black text-white">
                    {category.title}
                  </h3>
                </div>
                <div className="p-5">
                  <p className="min-h-24 text-sm font-bold leading-6 text-[#53647c]">
                    {category.description}
                  </p>
                  <Link href={`/${category.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#0067b1]">
                    Learn More <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 pb-6 sm:px-8">
        <div className="mx-auto flex max-w-7xl justify-center">
          <a
            href="https://learntbusiness.com.au"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-14 items-center justify-center gap-3 rounded-full border border-[#18aee5]/35 bg-[#eef8ff] px-8 text-base font-black text-[#0067b1] shadow-[0_16px_36px_rgba(0,103,177,0.08)] transition hover:-translate-y-0.5 hover:border-[#0067b1]"
          >
            Explore More Courses <ArrowRight size={20} />
          </a>
        </div>
      </section>

      <section id="video" className="relative overflow-hidden bg-[#eef8ff] px-5 py-24 sm:px-8">
        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, x: -34 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
          >
            <p className="mb-3 text-sm font-black uppercase tracking-[0.28em] text-[#0067b1]">
              Top Course
            </p>
            <h2 className="text-4xl font-black tracking-normal sm:text-5xl">
              Learn without limits with {featuredCourse.title}.
            </h2>
            <p className="mt-5 text-lg font-bold leading-8 text-[#53647c]">
              Start with one unlocked lesson inside the website. The remaining modules are clearly
              marked and ready to unlock through login and payment.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CheckoutButton courseSlug={featuredCourse.slug} />
              <Link
                href={`/course/${featuredCourse.slug}`}
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#18aee5]/35 bg-white px-5 text-sm font-black text-[#0067b1]"
              >
                Course Details
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <p className="rounded-2xl bg-white p-5 text-sm font-black text-[#020d24] shadow-sm">
                1000+ learner-ready course interactions
              </p>
              <p className="rounded-2xl bg-white p-5 text-sm font-black text-[#020d24] shadow-sm">
                {courses.length}+ detailed SSTA courses loaded
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 34 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="rounded-[1.5rem] border border-white bg-white/86 p-5 shadow-[0_24px_70px_rgba(0,74,143,0.12)]"
          >
            <div className="overflow-hidden rounded-[1.25rem] border-[8px] border-[#020d24] bg-[#020d24]">
              <iframe
                className="aspect-video w-full"
                src={activeVideoUrl}
                title="SSTA preview lesson"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="mt-5 grid gap-3">
              {lessons.map((lesson, index) => (
                <button
                  key={lesson.id}
                  type="button"
                  disabled={!lesson.isPreview}
                  onClick={() => {
                    setActiveVideoUrl(getEmbedUrl(lesson.videoUrl, lesson.videoProvider));
                    setActiveLessonId(lesson.id);
                  }}
                  className={`flex items-center justify-between gap-4 rounded-2xl border p-4 text-left transition ${
                    activeLessonId === lesson.id ? "border-[#0067b1] bg-[#eef8ff]" : "border-[#18aee5]/12 bg-white"
                  } ${lesson.isPreview ? "cursor-pointer hover:border-[#0067b1]" : "cursor-not-allowed opacity-75"}`}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${lesson.isPreview ? "bg-[#0067b1] text-white" : "bg-slate-100 text-slate-500"}`}>
                      {lesson.isPreview ? <Play size={16} fill="currentColor" /> : <Lock size={16} />}
                    </span>
                    <span>
                      <span className="block font-black text-[#020d24]">{index + 1}. {lesson.title}</span>
                      <span className="text-sm font-bold text-[#53647c]">{lesson.duration}</span>
                    </span>
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${lesson.isPreview ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {lesson.isPreview ? "Free" : "Locked"}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-white px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 grid gap-8 rounded-[1.75rem] border border-[#18aee5]/14 bg-[#f8fcff] p-8 shadow-[0_24px_70px_rgba(0,74,143,0.08)] lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="mb-3 text-sm font-black uppercase tracking-[0.28em] text-[#0067b1]">
                About SSTA
              </p>
              <h2 className="text-4xl font-black tracking-normal sm:text-5xl">
                Joseph brings three decades of security and risk leadership.
              </h2>
              <p className="mt-5 text-base font-bold leading-7 text-[#53647c]">
                {josephProfile.summary}
              </p>
              <Link
                href="/about-us"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0067b1] px-6 py-3 text-sm font-black text-white transition hover:bg-[#123e95]"
              >
                Learn More <ArrowRight size={16} />
              </Link>
            </div>
            <div className="relative h-[320px] overflow-hidden rounded-[1.5rem] border-[8px] border-white shadow-[0_24px_70px_rgba(0,74,143,0.12)]">
              <div
                aria-label="Joseph leading an SSTA classroom session"
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/hero.jpeg')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020d24]/12 via-transparent to-white/5" />
            </div>
          </div>
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.28em] text-[#0067b1]">
              Benefits
            </p>
            <h2 className="text-4xl font-black tracking-normal sm:text-5xl">
              Built around practical training outcomes.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, index) => (
              <motion.article
                key={benefit.title}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.06 }}
                className="rounded-[1.25rem] border border-[#18aee5]/14 bg-[#eef8ff] p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-[0_24px_60px_rgba(0,74,143,0.1)]"
              >
                <span className="text-5xl font-black text-[#0067b1]/20">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 text-xl font-black">{benefit.title}</h3>
                <p className="mt-3 text-sm font-bold leading-6 text-[#53647c]">{benefit.text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#eef8ff] px-5 py-24 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mb-3 text-sm font-black uppercase tracking-[0.28em] text-[#0067b1]">
              Frequently Asked Questions
            </p>
            <h2 className="text-4xl font-black tracking-normal sm:text-5xl">
              Clear answers before enrolment.
            </h2>
            <div className="mt-8 rounded-[1.25rem] bg-white p-5 shadow-sm">
              <BookOpenCheck className="text-[#f5b800]" size={34} />
              <p className="mt-3 text-sm font-bold leading-6 text-[#53647c]">
                Course pages now expose overview, fees, units, requirements, delivery modes and preview access.
              </p>
            </div>
          </div>
          <div className="grid gap-4">
            {faqs.map((faq) => (
              <article key={faq.question} className="rounded-[1.25rem] border border-white bg-white p-6 shadow-sm">
                <h3 className="text-lg font-black">{faq.question}</h3>
                <p className="mt-3 text-sm font-bold leading-6 text-[#53647c]">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.28em] text-[#0067b1]">
              Student Voice
            </p>
            <h2 className="text-4xl font-black tracking-normal sm:text-5xl">
              What students should feel.
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article key={testimonial.name} className="rounded-[1.25rem] border border-[#18aee5]/14 bg-white p-6 shadow-[0_18px_50px_rgba(0,74,143,0.08)]">
                <p className="text-base font-bold leading-7 text-[#53647c]">&quot;{testimonial.quote}&quot;</p>
                <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-[#0067b1]">
                  {testimonial.name}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#eef8ff] px-5 py-20 sm:px-8 border-t border-[#18aee5]/14">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-[#0067b1]">
            Our Commitment
          </p>
          <h2 className="mt-4 text-4xl font-black tracking-normal sm:text-5xl text-[#020d24]">
            Academic Excellence & Practical Standards
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-base font-bold leading-8 text-[#53647c]">
            Select Security Training Academy is committed to delivering training of the highest standards. We ensure our courses combine hands-on practical skills, modern compliance frameworks, and clear pathways to help you succeed in your career.
          </p>
        </div>
      </section>

      <SiteFooter />
      <InterestModal />
    </main>
  );
}
