"use client";
import { CPP20218_COURSE_SLUG } from "@/lib/cpp20218";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

type CheckoutButtonProps = {
  courseSlug: string;
  className?: string;
  children?: React.ReactNode;
};

export function CheckoutButton({
  courseSlug,
  className,
  children = "Enrol Now",
}: CheckoutButtonProps) {
  const isCpp20218 = courseSlug === CPP20218_COURSE_SLUG;
  const href = isCpp20218
    ? "/enroll?course=certificate-ii-security-operations"
    : `/enroll?course=${courseSlug}`;
  const label = isCpp20218 ? "Free enrollment form" : children;

  return (
    <Link
      href={href}
      className={
        className ??
        "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0067b1] px-5 text-sm font-black text-white transition hover:bg-[#123e95]"
      }
    >
      <ArrowRight size={18} />
      {label}
    </Link>
  );
}
