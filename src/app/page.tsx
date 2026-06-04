"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  BookOpenCheck,
  Lock,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Video,
} from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CheckoutButton } from "@/components/CheckoutButton";
import { benefits, faqs, testimonials } from "@/lib/site-content";
import { courseCategories, courses, getFeaturedCourse, type CourseLesson } from "@/lib/courses";

const mediaCards = [
  {
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80",
    alt: "Security students in a guided training session",
    className:
      "left-[2%] top-[18%] z-20 w-[48%] rotate-[-9deg] md:left-[8%] md:w-[31%]",
    delay: 0.15,
  },
  {
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80",
    alt: "Instructor presenting a training lesson",
    className:
      "left-1/2 top-[2%] z-10 hidden w-[37%] -translate-x-1/2 rotate-[1deg] md:block",
    delay: 0.32,
  },
  {
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=80",
    alt: "Online course dashboard on a laptop",
    className:
      "right-[2%] top-[22%] z-30 w-[48%] rotate-[10deg] md:right-[8%] md:w-[31%]",
    delay: 0.5,
  },
];

const floaters = [
  { Icon: ShieldCheck, className: "left-[10%] top-[24%]", delay: 0 },
  { Icon: Sparkles, className: "left-[24%] top-[46%]", delay: 0.8 },
  { Icon: Star, className: "right-[18%] top-[22%]", delay: 1.4 },
  { Icon: Lock, className: "right-[10%] top-[48%]", delay: 0.5 },
  { Icon: Video, className: "left-[16%] top-[66%]", delay: 1.1 },
];

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
  const { scrollYProgress } = useScroll();
  const heroWordY = useTransform(scrollYProgress, [0, 0.35], [0, 90]);
  const collageY = useTransform(scrollYProgress, [0, 0.35], [0, -70]);
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

      <section className="relative isolate min-h-screen overflow-hidden bg-white px-5 pb-8 pt-16 sm:px-8 lg:px-12">
        <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_14%_14%,rgba(245,184,0,0.22),transparent_25%),radial-gradient(circle_at_86%_11%,rgba(0,169,232,0.19),transparent_29%),linear-gradient(180deg,#ffffff_0%,#f8fcff_64%,#edf8ff_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-20 h-1/2 bg-gradient-to-t from-[#eef8ff] to-transparent" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center pb-0 pt-16 text-center lg:pt-20">
          <motion.div
            style={{ y: heroWordY }}
            className="pointer-events-none absolute left-1/2 top-[34%] -z-10 hidden -translate-x-1/2 select-none text-[19vw] font-black leading-none tracking-normal text-[#0067b1]/5 lg:block"
          >
            SSTA
          </motion.div>

          <div className="pointer-events-none absolute inset-0 z-0 hidden md:block">
            {floaters.map(({ Icon, className, delay }) => (
              <motion.div
                key={className}
                animate={{ y: [0, -18, 0], rotate: [0, 8, -6, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay }}
                className={`absolute ${className} rounded-2xl border border-[#f5b800]/25 bg-white/62 p-3 text-[#0067b1] opacity-70 shadow-lg shadow-[#0067b1]/10 backdrop-blur-md`}
              >
                <Icon size={26} />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={reveal}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 max-w-4xl"
          >
            <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-[#f5b800]/45 bg-white/78 px-4 py-2 text-sm font-black text-[#d96f00] shadow-[0_10px_30px_rgba(245,184,0,0.18)] backdrop-blur">
              <Sparkles size={16} fill="currentColor" />
              Knowledge is power
            </div>
            <h1 className="mx-auto max-w-4xl text-5xl font-black leading-[0.96] tracking-normal text-[#020d24] sm:text-6xl lg:text-6xl">
              Select Security Training & Professional Certification.
            </h1>
            <p className="mx-auto mt-7 max-w-3xl text-lg font-bold leading-8 text-[#53647c] sm:text-xl">
              Australia-ready security courses with in-site video lessons,
              protected modules, one-time payment access, and a premium student
              experience for SSTA learners.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
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
          </motion.div>

          <motion.div
            style={{ y: collageY }}
            className="relative z-10 mt-10 h-[420px] w-full max-w-6xl md:h-[500px]"
          >
            {mediaCards.map((card, index) => (
              <motion.div
                key={card.alt}
                initial={{ opacity: 0, y: 90, scale: 0.86 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ scale: 1.045, rotate: 0, zIndex: 40 }}
                transition={{ duration: 0.9, delay: card.delay, type: "spring", stiffness: 55 }}
                className={`absolute aspect-[4/5] rounded-[1.25rem] bg-white p-3 shadow-[0_30px_80px_rgba(0,74,143,0.18)] will-change-transform ${card.className}`}
              >
                <div className="relative h-full overflow-hidden rounded-2xl bg-[#eef8ff]">
                  <Image
                    src={card.image}
                    alt={card.alt}
                    fill
                    priority={index === 0}
                    sizes="(min-width: 1024px) 31vw, 48vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#123e95]/30 via-transparent to-white/5" />
                </div>
              </motion.div>
            ))}
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
              Explore SSTA programs inspired by the Baker Ebert course structure: clear categories,
              transparent fees, practical requirements and a visible preview-before-payment model.
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

      <SiteFooter />
    </main>
  );
}
