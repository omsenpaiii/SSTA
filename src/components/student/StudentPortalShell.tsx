"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CircleHelp,
  GraduationCap,
  LayoutDashboard,
  Link2,
  Menu,
  MessageSquareQuote,
  ScanSearch,
  ShieldCheck,
  X,
} from "lucide-react";
import type { AppUser } from "@/lib/auth";

type StudentPortalShellProps = {
  user: AppUser;
  stats: {
    totalCourses: number;
    activeEnrollments: number;
    remainingActivities: number;
  };
  children: React.ReactNode;
};

const navItems = [
  { href: "/dashboard", label: "Student Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/lln", label: "LLN", icon: CircleHelp },
  { href: "/dashboard/browse-courses", label: "Browse Courses", icon: BriefcaseBusiness },
  { href: "/dashboard/my-courses", label: "My Courses", icon: GraduationCap },
  { href: "/dashboard/feedback", label: "Feedback", icon: MessageSquareQuote },
  { href: "/dashboard/useful-links", label: "Useful Links", icon: Link2 },
  { href: "/dashboard/contact", label: "Contact", icon: Bell },
  { href: "/dashboard/verify-certificate", label: "Verify Certificate", icon: ScanSearch },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard/my-courses" && pathname.startsWith("/dashboard/course/")) {
    return true;
  }

  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function StudentPortalShell({ user, stats, children }: StudentPortalShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const summary = useMemo(
    () => [
      `${stats.totalCourses} course${stats.totalCourses === 1 ? "" : "s"}`,
      `${stats.activeEnrollments} active`,
      `${stats.remainingActivities} remaining`,
    ].join(" · "),
    [stats],
  );

  return (
    <div className="min-h-screen bg-[#f4f8fc] text-[#081221]">
      <header className="sticky top-0 z-40 border-b border-[#d9e7f3] bg-white/92 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-3">
              <span className="relative block size-12 overflow-hidden rounded-2xl border border-[#cfe0ee] bg-white p-1 shadow-sm">
                <Image
                  src="/ssta.jpg"
                  alt="SSTA logo"
                  fill
                  sizes="48px"
                  className="object-contain object-[56%_50%]"
                />
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="block text-[1.7rem] font-black leading-none tracking-tight text-[#0b2b4e]">
                  SSTA
                </span>
                <span className="block text-xs font-bold uppercase tracking-[0.16em] text-[#6f849a]">
                  Student Portal
                </span>
              </span>
            </Link>
            <div className="hidden rounded-full bg-[#eef5fb] px-3 py-2 text-xs font-bold text-[#5d7389] xl:block">
              {summary}
            </div>
          </div>

          <nav className="hidden items-center gap-1 xl:flex">
            {navItems.map(({ href, label }) => {
              const active = isActivePath(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-full px-4 py-2.5 text-sm font-black transition ${
                    active
                      ? "bg-[#0f6eb8] text-white shadow-[0_16px_30px_rgba(15,110,184,0.2)]"
                      : "text-[#566a80] hover:bg-[#eef5fb] hover:text-[#0b2b4e]"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex items-center gap-3 rounded-full border border-[#d8e6f2] bg-white px-3 py-2 shadow-sm">
              <span className="flex size-10 items-center justify-center rounded-full bg-[#0f6eb8] text-sm font-black text-white">
                {user.initials}
              </span>
              <span className="hidden text-left lg:block">
                <span className="block text-sm font-black text-[#081221]">{user.name}</span>
                <span className="block text-xs font-bold text-[#6b7f94]">{user.email}</span>
              </span>
            </div>
            <form action="/auth/sign-out" method="post">
              <button className="rounded-full border border-[#d8e6f2] px-4 py-2.5 text-sm font-black text-[#0f6eb8] transition hover:bg-[#eef5fb]">
                Sign out
              </button>
            </form>
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex size-11 items-center justify-center rounded-full border border-[#d8e6f2] bg-white text-[#0f6eb8] xl:hidden"
            aria-label={open ? "Close navigation" : "Open navigation"}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open ? (
          <div className="border-t border-[#d9e7f3] bg-white xl:hidden">
            <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6">
              <div className="mb-4 rounded-3xl bg-[#eef5fb] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-full bg-[#0f6eb8] text-sm font-black text-white">
                    {user.initials}
                  </span>
                  <span>
                    <span className="block text-sm font-black text-[#081221]">{user.name}</span>
                    <span className="block text-xs font-bold text-[#6b7f94]">{user.email}</span>
                  </span>
                </div>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-[#6f849a]">
                  {summary}
                </p>
              </div>
              <div className="grid gap-2">
                {navItems.map(({ href, label, icon: Icon }) => {
                  const active = isActivePath(pathname, href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black transition ${
                        active
                          ? "bg-[#0f6eb8] text-white"
                          : "bg-white text-[#566a80] hover:bg-[#eef5fb] hover:text-[#0b2b4e]"
                      }`}
                    >
                      <Icon size={18} />
                      {label}
                    </Link>
                  );
                })}
              </div>
              <form action="/auth/sign-out" method="post" className="mt-4">
                <button className="w-full rounded-2xl border border-[#d8e6f2] px-4 py-3 text-sm font-black text-[#0f6eb8]">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        ) : null}
      </header>

      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-[28px] border border-[#dce8f3] bg-[linear-gradient(135deg,#0b2b4e_0%,#0f5f9c_55%,#1883c8_100%)] px-6 py-5 text-white shadow-[0_30px_70px_rgba(12,50,88,0.2)]">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-white/12">
            <BookOpen size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-white/72">
              Learning workspace
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-[2rem]">
              Learn, track progress, and move with confidence.
            </h1>
          </div>
          <div className="grid gap-2 rounded-[24px] border border-white/12 bg-white/10 px-5 py-4 text-sm font-bold text-white/88 backdrop-blur sm:grid-cols-3">
            <span>{stats.totalCourses} enrolled courses</span>
            <span>{stats.activeEnrollments} active enrolments</span>
            <span>{stats.remainingActivities} tasks remaining</span>
          </div>
        </div>
        {children}
      </div>

      <div className="fixed bottom-5 right-5 z-30">
        <Link
          href="/dashboard/contact"
          className="inline-flex items-center gap-2 rounded-full bg-[#0f6eb8] px-5 py-3 text-sm font-black text-white shadow-[0_20px_40px_rgba(15,110,184,0.24)]"
        >
          <ShieldCheck size={18} />
          Help
        </Link>
      </div>
    </div>
  );
}
