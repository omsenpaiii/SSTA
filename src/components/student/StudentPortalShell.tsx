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

  const summaryCards = useMemo(
    () => [
      { label: "Enrolled courses", value: stats.totalCourses },
      { label: "Active enrolments", value: stats.activeEnrollments },
      { label: "Tasks remaining", value: stats.remainingActivities },
    ],
    [stats.activeEnrollments, stats.remainingActivities, stats.totalCourses],
  );

  return (
    <div className="min-h-screen bg-[#f4f8fc] text-[#081221]">
      <header className="sticky top-0 z-40 border-b border-[#d9e7f3] bg-white/92 backdrop-blur">
        <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
              <span className="relative block size-12 shrink-0 overflow-hidden rounded-2xl border border-[#cfe0ee] bg-white p-1 shadow-sm">
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

            <div className="hidden items-center gap-3 sm:flex">
              <div className="portal-shell-card flex items-center gap-3 rounded-[20px] px-3 py-2">
                <span className="flex size-10 items-center justify-center rounded-full bg-[#0f6eb8] text-sm font-black text-white">
                  {user.initials}
                </span>
                <span className="hidden text-left lg:block">
                  <span className="block text-sm font-black text-[#081221]">{user.name}</span>
                  <span className="block text-xs font-bold text-[#6b7f94]">{user.email}</span>
                </span>
              </div>
              <form action="/auth/sign-out" method="post">
                <button className="portal-button-secondary px-4 py-2.5 transition hover:bg-[#eef5fb]">
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

          <div className="mt-4 hidden items-center justify-between gap-6 xl:flex">
            <nav className="hide-scrollbar -mx-1 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-1">
              {navItems.map(({ href, label }) => {
                const active = isActivePath(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`shrink-0 rounded-[16px] px-4 py-2.5 text-sm font-black transition ${
                      active
                        ? "bg-[#0f6eb8] text-white shadow-[0_14px_28px_rgba(15,110,184,0.16)]"
                        : "text-[#5c7187] hover:bg-[#f2f7fb] hover:text-[#0b2b4e]"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="portal-subtle-card flex shrink-0 items-center gap-2 rounded-[18px] px-3 py-2">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-[#7b8ea2]">
                Portal view
              </span>
              <span className="text-sm font-bold text-[#5d7389]">Learning workspace</span>
            </div>
          </div>

          <div className="mt-4 hidden grid-cols-3 gap-3 md:grid xl:grid-cols-3">
            {summaryCards.map((item) => (
              <div key={item.label} className="portal-subtle-card rounded-[18px] px-4 py-3">
                <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#7b8ea2]">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-black tracking-tight text-[#081221]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {open ? (
          <div className="border-t border-[#d9e7f3] bg-white xl:hidden">
            <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6">
              <div className="portal-subtle-card mb-4 rounded-[24px] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-full bg-[#0f6eb8] text-sm font-black text-white">
                    {user.initials}
                  </span>
                  <span>
                    <span className="block text-sm font-black text-[#081221]">{user.name}</span>
                    <span className="block text-xs font-bold text-[#6b7f94]">{user.email}</span>
                  </span>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-3 gap-2">
                {summaryCards.map((item) => (
                  <div key={item.label} className="portal-subtle-card rounded-[18px] px-3 py-3">
                    <p className="text-[0.64rem] font-black uppercase tracking-[0.14em] text-[#7b8ea2]">
                      {item.label}
                    </p>
                    <p className="mt-2 text-lg font-black text-[#081221]">{item.value}</p>
                  </div>
                ))}
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
                <button className="portal-button-secondary w-full px-4 py-3">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        ) : null}
      </header>

      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-[30px] border border-[#dce8f3] bg-[linear-gradient(135deg,#0b2b4e_0%,#0d4674_44%,#177fc2_100%)] px-6 py-7 text-white shadow-[0_22px_48px_rgba(12,50,88,0.14)] sm:px-8">
          <div className="flex flex-wrap items-start gap-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-white/12">
              <BookOpen size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-white/68">
                Learning workspace
              </p>
              <h1 className="mt-2 max-w-[16ch] text-3xl font-black tracking-tight sm:text-[3rem]">
                Learn, track progress, and move with confidence.
              </h1>
              <p className="mt-3 max-w-[56ch] text-sm font-semibold leading-7 text-white/76 sm:text-base">
                Your enrolments, learning progress, resources, and next steps all stay in one cleaner workspace.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3 xl:hidden">
            {summaryCards.map((item) => (
              <div
                key={item.label}
                className="rounded-[22px] border border-white/14 bg-white/10 px-4 py-4 backdrop-blur"
              >
                <p className="text-xs font-black uppercase tracking-[0.16em] text-white/64">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-black text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {children}
      </div>

      <div className="fixed bottom-5 right-5 z-30">
        <Link
          href="/dashboard/contact"
          className="portal-button-primary inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm"
        >
          <ShieldCheck size={18} />
          Support
        </Link>
      </div>
    </div>
  );
}
