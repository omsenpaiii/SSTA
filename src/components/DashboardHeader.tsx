"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, X } from "lucide-react";
import { siteInfo } from "@/lib/site-content";

type DashboardHeaderProps = {
  user: {
    name: string;
    email: string;
    initials: string;
  };
};

const portalLinks = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Browse Courses", href: "/courses" },
  { label: "Contact", href: "/contact" },
];

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const linkClassName = (href: string) => {
    const isActive = pathname === href;

    return `rounded-xl px-3 py-2 text-sm font-black transition ${
      isActive
        ? "bg-[#eef8ff] text-[#0067b1]"
        : "text-[#020d24] hover:bg-[#eef8ff] hover:text-[#0067b1]"
    }`;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#18aee5]/12 bg-white shadow-[0_12px_40px_rgba(0,74,143,0.08)]">
      <nav
        aria-label="Student portal navigation"
        className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8"
      >
        <Link href="/dashboard" className="flex min-w-0 items-center gap-3" onClick={() => setIsOpen(false)}>
          <span className="relative block size-14 shrink-0 overflow-hidden rounded-full border border-[#18aee5]/20 bg-white p-1 shadow-sm">
            <Image
              src="/ssta.jpg"
              alt="SSTA logo"
              fill
              sizes="56px"
              className="scale-[0.95] object-contain object-[56%_50%]"
            />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-black uppercase tracking-[0.28em] text-[#0067b1]">
              {siteInfo.shortName}
            </span>
            <span className="block truncate text-xs font-bold uppercase tracking-[0.18em] text-[#53647c]">
              Student Portal
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {portalLinks.map((link) => (
            <Link key={link.label} href={link.href} className={linkClassName(link.href)}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="inline-flex items-center gap-3 rounded-full border border-[#18aee5]/20 bg-white px-3 py-2 text-left shadow-sm">
            <span className="flex size-10 items-center justify-center rounded-full bg-[#0067b1] text-sm font-black text-white">
              {user.initials}
            </span>
            <span>
              <span className="block text-sm font-black text-[#020d24]">{user.name}</span>
              <span className="block max-w-48 truncate text-xs font-bold text-[#53647c]">{user.email}</span>
            </span>
          </div>
          <form action="/auth/sign-out" method="post">
            <button className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-black text-[#0067b1] transition hover:bg-[#eef8ff]">
              <LogOut size={18} /> Sign out
            </button>
          </form>
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
              {portalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={linkClassName(link.href)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 rounded-2xl border border-[#18aee5]/15 bg-white p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-full bg-[#0067b1] text-sm font-black text-white">
                    {user.initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-black text-[#020d24]">{user.name}</span>
                    <span className="block truncate text-sm font-bold text-[#53647c]">{user.email}</span>
                  </span>
                </div>
                <form action="/auth/sign-out" method="post" className="mt-3">
                  <button className="inline-flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-black text-[#0067b1] hover:bg-[#eef8ff]">
                    <LogOut size={18} /> Sign out
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
