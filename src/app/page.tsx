"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Clock3,
  CreditCard,
  Lock,
  Mail,
  MapPin,
  Menu,
  Phone,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  Video,
  X,
} from "lucide-react";
import { CheckoutButton } from "@/components/CheckoutButton";
import { courses, getFeaturedCourse } from "@/lib/courses";

const featuredCourse = getFeaturedCourse();
const lessons = featuredCourse.lessons;

const stack = [
  {
    title: "Create your account",
    text: "Sign up securely to start your professional security training journey.",
    Icon: UserRound,
  },
  {
    title: "Enroll in a course",
    text: "Choose your training program and unlock all modules instantly.",
    Icon: CreditCard,
  },
  {
    title: "Track your progress",
    text: "Learn at your own pace and easily resume right where you left off.",
    Icon: BookOpenCheck,
  },
  {
    title: "Watch & get certified",
    text: "Complete high-quality video lessons from any device and earn your certificate.",
    Icon: BadgeCheck,
  },
];

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

const navLinks = [
  { name: "Home", href: "#" },
  { name: "Courses", href: "#courses" },
  { name: "Video Library", href: "#video" },
  { name: "Enroll", href: "/enroll" },
];

const reveal = {
  hidden: { opacity: 0, y: 34 },
  visible: { opacity: 1, y: 0 },
};

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroWordY = useTransform(scrollYProgress, [0, 0.35], [0, 90]);
  const collageY = useTransform(scrollYProgress, [0, 0.35], [0, -70]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 22);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#020d24]">
      <motion.header
        initial={{ y: -84, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/78 py-3 shadow-[0_16px_50px_rgba(0,74,143,0.11)] backdrop-blur-xl"
            : "bg-transparent py-6"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
          <a
            href="#"
            className="group flex items-center gap-3"
            onClick={() => setIsOpen(false)}
          >
            <span
              className={`relative block size-12 shrink-0 overflow-hidden rounded-full border transition-all duration-300 ${
                isScrolled
                  ? "border-[#18aee5]/18 bg-white shadow-sm"
                  : "border-transparent bg-white/72 shadow-[0_12px_34px_rgba(0,103,177,0.08)] backdrop-blur"
              }`}
            >
              <Image
                src="/ssta-logo.jpg"
                alt="SSTA logo"
                width={64}
                height={51}
                priority
                className="absolute left-1/2 top-1/2 h-auto w-[170%] max-w-none -translate-x-[45%] -translate-y-[45%] object-contain transition duration-300 group-hover:w-[178%]"
              />
            </span>
            <span className="hidden sm:block">
              <span className="block text-sm font-black tracking-[0.34em] text-[#0067b1]">
                SSTA
              </span>
              <span className="block text-xs font-bold text-[#53647c]">
                RTO Code: 40873
              </span>
            </span>
          </a>

          <nav className="hidden items-center gap-9 px-4 py-3 text-sm font-black text-[#123e95]/90 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="relative transition hover:text-[#0067b1] after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-[#f5b800] after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="mailto:admin@ssta.net.au"
              className="hidden rounded-full bg-[#0067b1] px-5 py-3 text-sm font-black text-white shadow-[0_14px_35px_rgba(0,103,177,0.26)] transition hover:-translate-y-0.5 hover:bg-[#123e95] sm:inline-flex"
            >
              Enquire now
            </a>
            <button
              className="inline-flex size-11 items-center justify-center rounded-full border border-[#18aee5]/22 bg-white/82 text-[#0067b1] shadow-sm backdrop-blur md:hidden"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              onClick={() => setIsOpen((open) => !open)}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.24 }}
              className="mx-5 mt-4 overflow-hidden rounded-[1.25rem] border border-[#18aee5]/12 bg-white/94 shadow-[0_24px_70px_rgba(0,74,143,0.14)] backdrop-blur-xl md:hidden"
            >
              <div className="grid gap-1 p-4">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="rounded-2xl px-4 py-3 text-base font-black text-[#123e95] transition hover:bg-[#eef8ff] hover:text-[#0067b1]"
                  >
                    {link.name}
                  </a>
                ))}
                <a
                  href="mailto:admin@ssta.net.au"
                  onClick={() => setIsOpen(false)}
                  className="mt-2 inline-flex items-center justify-center rounded-full bg-[#0067b1] px-5 py-3 text-sm font-black text-white"
                >
                  Enquire now
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <section className="relative isolate min-h-screen overflow-hidden bg-white px-5 pb-8 pt-28 sm:px-8 lg:px-12">
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
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay,
                }}
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
                transition={{
                  duration: 0.9,
                  delay: card.delay,
                  type: "spring",
                  stiffness: 55,
                }}
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
              Course catalogue
            </p>
            <h2 className="mx-auto max-w-3xl text-4xl font-black tracking-normal sm:text-5xl">
              Choose a program, preview the first lesson, unlock the rest.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base font-bold leading-7 text-[#53647c]">
              Each course is designed for embedded YouTube or Google Drive video
              modules, with a clear paid access path.
            </p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-3">
            {courses.map((course, index) => (
              <motion.article
                key={course.title}
                initial={{ opacity: 0, y: 38 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.65, delay: index * 0.12 }}
                className="group overflow-hidden rounded-[1.25rem] border border-[#18aee5]/14 bg-white shadow-[0_24px_70px_rgba(0,74,143,0.1)] transition duration-500 hover:-translate-y-2 hover:shadow-[0_32px_90px_rgba(0,74,143,0.16)]"
              >
                <div className="relative h-72 overflow-hidden">
                  <Image
                    src={course.image}
                    alt={`${course.title} course thumbnail`}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#123e95]/75 via-[#123e95]/10 to-transparent" />
                  <div className="absolute left-4 top-4 rounded-full bg-white/92 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#0067b1] shadow-sm backdrop-blur">
                    {course.label}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4 text-white">
                    <h3 className="text-2xl font-black tracking-normal">
                      {course.title}
                    </h3>
                    <span className="rounded-full bg-[#f5b800] px-3 py-1 text-sm font-black text-[#020d24]">
                      ${course.priceAud}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <span className="inline-flex items-center gap-2 text-sm font-black text-[#0067b1]">
                    <Clock3 size={16} /> {course.duration}
                  </span>
                  <p className="mt-3 min-h-24 text-base font-semibold leading-7 text-[#53647c]">
                    {course.description}
                  </p>
                  <div className="mt-6">
                    <CheckoutButton courseSlug={course.slug}>
                      Unlock with Stripe
                    </CheckoutButton>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="video"
        className="relative overflow-hidden bg-[#eef8ff] px-5 py-24 sm:px-8"
      >
        <div className="absolute left-[-8%] top-[-10%] h-80 w-80 rounded-full bg-[#18aee5]/12 blur-3xl" />
        <div className="absolute bottom-[-12%] right-[-8%] h-96 w-96 rounded-full bg-[#f5b800]/16 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div
            initial={{ opacity: 0, x: -34 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-[#f5b800] text-[#020d24]">
                <Play size={21} fill="currentColor" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.25em] text-[#0067b1]">
                  Preview lesson
                </p>
                <h2 className="text-3xl font-black tracking-normal sm:text-5xl">
                  Watch training inside the SSTA website
                </h2>
              </div>
            </div>
            <div className="overflow-hidden rounded-[1.5rem] border-[10px] border-white bg-[#020d24] shadow-[0_30px_90px_rgba(0,74,143,0.16)]">
              <iframe
                className="aspect-video w-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0"
                title="SSTA course preview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 34 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="rounded-[1.5rem] border border-white/80 bg-white/82 p-5 shadow-[0_24px_70px_rgba(0,74,143,0.12)] backdrop-blur"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black text-[#0067b1]">
                  Certificate II sample
                </p>
                <h3 className="text-2xl font-black">Lesson access</h3>
              </div>
              <span className="rounded-full bg-[#f5b800]/18 px-3 py-1 text-sm font-black text-[#d96f00]">
                $100 once
              </span>
            </div>

            <div className="space-y-3">
              {lessons.map((lesson, index) => (
                <motion.div
                  key={lesson.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-[#18aee5]/10 bg-white p-4 shadow-sm"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex size-11 shrink-0 items-center justify-center rounded-full ${
                        lesson.isPreview
                          ? "bg-[#0067b1] text-white"
                          : "bg-[#eef8ff] text-[#53647c]"
                      }`}
                    >
                      {lesson.isPreview ? (
                        <Play size={17} fill="currentColor" />
                      ) : (
                        <Lock size={17} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-black text-[#020d24]">
                        {index + 1}. {lesson.title}
                      </p>
                      <p className="text-sm font-bold text-[#53647c]">
                        {lesson.duration}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${
                      lesson.isPreview
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {lesson.isPreview ? "Free" : "Locked"}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.aside>
        </div>
      </section>

      <section id="payments" className="bg-white px-5 py-24 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <motion.div
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65 }}
          >
            <p className="mb-3 text-sm font-black uppercase tracking-[0.28em] text-[#0067b1]">
              Your Learning Journey
            </p>
            <h2 className="text-4xl font-black tracking-normal sm:text-5xl">
              Start your training in minutes.
            </h2>
            <p className="mt-5 text-lg font-bold leading-8 text-[#53647c]">
              Our platform makes it easy to get started. From account creation to course completion, everything is designed for a smooth and straightforward learning experience.
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {stack.map(({ title, text, Icon }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                className="rounded-[1.25rem] border border-[#18aee5]/13 bg-[#eef8ff] p-6 shadow-[0_18px_45px_rgba(0,74,143,0.08)] transition hover:-translate-y-1 hover:bg-white"
              >
                <div className="mb-5 flex size-12 items-center justify-center rounded-full bg-white text-[#0067b1] shadow-sm">
                  <Icon size={22} />
                </div>
                <h3 className="text-xl font-black">{title}</h3>
                <p className="mt-2 text-sm font-bold leading-6 text-[#53647c]">
                  {text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer
        id="contact"
        className="relative overflow-hidden bg-[#020d24] px-5 py-16 text-white sm:px-8"
      >
        <div className="absolute left-1/2 top-0 h-[1px] w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#18aee5]/50 to-transparent" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top,#0067b1_0%,transparent_70%)]" />

        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between"
          >
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <span className="relative block size-16 shrink-0 overflow-hidden rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  <Image
                    src="/ssta-logo.jpg"
                    alt="SSTA logo"
                    width={86}
                    height={69}
                    className="absolute left-1/2 top-1/2 h-auto w-[170%] max-w-none -translate-x-[45%] -translate-y-[45%] object-contain"
                  />
                </span>
                <div>
                  <h2 className="text-2xl font-black text-white">
                    Select Security
                  </h2>
                  <p className="text-sm font-bold tracking-widest text-[#18aee5]">
                    TRAINING ACADEMY
                  </p>
                  <p className="mt-1 text-xs font-bold text-sky-100/50">RTO Code: 40873</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 text-sm font-bold text-sky-50/80 sm:flex-row sm:gap-8">
              <a
                className="group flex items-center gap-3 rounded-2xl bg-white/5 p-4 transition hover:bg-white/10"
                href="mailto:admin@ssta.net.au"
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-[#0067b1] transition-colors group-hover:bg-[#18aee5]">
                  <Mail size={18} className="text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wider text-sky-200/60">Email us</span>
                  <span className="text-white">admin@ssta.net.au</span>
                </div>
              </a>
              <a
                className="group flex items-center gap-3 rounded-2xl bg-white/5 p-4 transition hover:bg-white/10"
                href="tel:+610431696558"
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-[#f5b800] transition-colors group-hover:bg-[#ffc824]">
                  <Phone size={18} className="text-[#020d24]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wider text-sky-200/60">Call us</span>
                  <span className="text-white">+61 0431 696 558</span>
                </div>
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.2 }}
            className="mt-12 flex flex-col items-center justify-between border-t border-white/10 pt-8 sm:flex-row"
          >
            <p className="flex items-center gap-2 text-sm font-bold text-sky-100/60">
              <MapPin size={16} /> Level 1, 1287 North Road, Huntingdale 3166
            </p>
            <p className="mt-4 text-xs font-bold text-sky-100/40 sm:mt-0">
              © {new Date().getFullYear()} SSTA. All rights reserved.
            </p>
          </motion.div>
        </div>
      </footer>
    </main>
  );
}
