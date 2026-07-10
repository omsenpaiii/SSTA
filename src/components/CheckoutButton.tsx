"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

const CPP20218_COURSE_SLUG = "certificate-ii-security-operations";

type CheckoutButtonProps = {
  courseSlug: string;
  className?: string;
  children?: React.ReactNode;
};

export function CheckoutButton({
  courseSlug,
  className,
  children = "Enroll Now",
}: CheckoutButtonProps) {
  const isCpp20218 = courseSlug === CPP20218_COURSE_SLUG;
  const href = isCpp20218
    ? `/dashboard/lln/cpp20218?mode=buy&returnTo=${encodeURIComponent(`/course/${CPP20218_COURSE_SLUG}`)}`
    : `/enroll?course=${courseSlug}`;
  const label = children === "Enroll Now" && isCpp20218 ? "Buy Now" : children;

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
