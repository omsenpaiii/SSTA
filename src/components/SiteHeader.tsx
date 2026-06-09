"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import { courseMenu, primaryLinks, siteInfo } from "@/lib/site-content";

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-[0_12px_40px_rgba(0,74,143,0.08)]">
      <div className="bg-[#0067b1] px-5 py-2 text-center text-xs font-black uppercase tracking-[0.2em] text-white">
        Knowledge is power. Enrol now and start with a preview lesson.
      </div>
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8"
      >
        <Link href="/" className="flex min-w-0 items-center gap-3" onClick={() => setIsOpen(false)}>
          <span className="relative block size-12 shrink-0 overflow-hidden rounded-full border border-[#18aee5]/20 bg-white shadow-sm">
            <Image
              src="/ssta-logo.jpg"
              alt="SSTA logo"
              width={86}
              height={69}
              className="absolute left-1/2 top-1/2 h-auto w-[170%] max-w-none -translate-x-[45%] -translate-y-[45%] object-contain"
            />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-black uppercase tracking-[0.28em] text-[#0067b1]">
              {siteInfo.shortName}
            </span>
            {siteInfo.rto ? (
              <span className="block truncate text-xs font-bold text-[#53647c]">
                {siteInfo.rto}
              </span>
            ) : null}
          </span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {primaryLinks.map((link) =>
            link.label === "Courses" ? (
              <div key={link.label} className="group relative">
                <Link
                  href={link.href}
                  className="inline-flex items-center gap-1.5 py-7 text-sm font-black text-[#020d24] transition hover:text-[#0067b1]"
                >
                  Courses <ChevronDown size={16} />
                </Link>
                <div className="pointer-events-none absolute left-1/2 top-full max-h-[72vh] w-[min(1100px,calc(100vw-64px))] -translate-x-1/2 translate-y-4 overflow-y-auto rounded-2xl border border-[#18aee5]/14 bg-white p-4 opacity-0 shadow-[0_28px_80px_rgba(0,74,143,0.16)] transition duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="grid gap-3 lg:grid-cols-3 xl:grid-cols-4">
                    {courseMenu.map((category) => (
                      <div key={category.slug} className="rounded-2xl bg-[#eef8ff] p-4">
                        <Link
                          href={`/${category.slug}`}
                          className="text-sm font-black uppercase tracking-[0.18em] text-[#0067b1]"
                        >
                          {category.title}
                        </Link>
                        <div className="mt-3 grid gap-2">
                          {category.courses.slice(0, 3).map((course) => (
                            <Link
                              key={course.slug}
                              href={`/course/${course.slug}`}
                              className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-[#020d24] transition hover:text-[#0067b1]"
                            >
                              {course.title}
                            </Link>
                          ))}
                          {category.courses.length > 3 ? (
                            <Link
                              href={`/${category.slug}`}
                              className="px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#0067b1]"
                            >
                              View all {category.courses.length}
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="py-7 text-sm font-black text-[#020d24] transition hover:text-[#0067b1]"
              >
                {link.label}
              </Link>
            ),
          )}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Show when="signed-out">
            <SignInButton>
              <button className="rounded-full px-4 py-3 text-sm font-black text-[#0067b1] transition hover:bg-[#eef8ff]">
                Login
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="rounded-full bg-[#020d24] px-5 py-3 text-sm font-black text-white shadow-[0_14px_35px_rgba(2,13,36,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0067b1]">
                Signup
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
          <Link
            href="/enroll"
            className="rounded-full bg-[#f5b800] px-5 py-3 text-sm font-black text-[#020d24] shadow-[0_14px_35px_rgba(245,184,0,0.22)] transition hover:-translate-y-0.5 hover:bg-[#ffc824]"
          >
            Enrol Now
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-full border border-[#18aee5]/25 bg-white text-[#0067b1] lg:hidden"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-[#18aee5]/12 bg-white lg:hidden"
          >
            <div className="mx-auto grid max-w-7xl gap-2 px-5 py-5">
              {primaryLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="rounded-2xl px-4 py-3 text-base font-black text-[#020d24] hover:bg-[#eef8ff]"
                >
                  {link.label}
                </Link>
              ))}
              <div className="rounded-2xl bg-[#eef8ff] p-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0067b1]">
                  Course areas
                </p>
                <div className="mt-3 grid gap-2">
                  {courseMenu.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/${category.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-[#020d24]"
                    >
                      {category.title}
                    </Link>
                  ))}
                </div>
              </div>
              <Link
                href="/enroll"
                onClick={() => setIsOpen(false)}
                className="mt-2 rounded-full bg-[#0067b1] px-5 py-3 text-center text-sm font-black text-white"
              >
                Enrol Now
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
