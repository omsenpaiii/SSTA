"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Grid2X2, List, Search, TimerReset } from "lucide-react";
import {
  formatCourseDuration,
  formatEnrollmentMeta,
  formatRelativeUpdate,
  type StudentCourseSummary,
} from "@/lib/student-portal";

type MyCoursesViewProps = {
  courses: StudentCourseSummary[];
};

export function MyCoursesView({ courses }: MyCoursesViewProps) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return courses;
    return courses.filter((course) =>
      [
        course.title,
        course.code,
        course.overview,
        course.category,
        course.label,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [courses, query]);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#dce8f3] bg-white p-6 shadow-[0_18px_50px_rgba(12,50,88,0.08)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-[#081221]">My Courses</h2>
            <p className="mt-2 max-w-3xl text-base font-semibold leading-7 text-[#5d7389]">
              Continue your learning journey, revisit your enrolled programs, and jump back into the next activity without losing context.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-full bg-[#eef5fb] px-4 py-2 text-sm font-black text-[#5d7389]">
            <TimerReset size={16} />
            {filtered.length} enrolled course{filtered.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-[#e1edf6] bg-[#fbfdff] p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <label className="flex h-14 flex-1 items-center gap-3 rounded-2xl border border-[#d9e7f3] bg-white px-4 text-sm font-semibold text-[#5d7389]">
              <Search size={18} className="text-[#86a0b7]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search courses by name, code, overview, or industry..."
                className="h-full w-full bg-transparent outline-none placeholder:text-[#90a3b7]"
              />
            </label>
            <div className="flex items-center rounded-2xl border border-[#d9e7f3] bg-white p-1">
              <button
                type="button"
                onClick={() => setView("grid")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition ${
                  view === "grid" ? "bg-[#081221] text-white" : "text-[#5d7389]"
                }`}
              >
                <Grid2X2 size={16} />
                Grid
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black transition ${
                  view === "list" ? "bg-[#081221] text-white" : "text-[#5d7389]"
                }`}
              >
                <List size={16} />
                List
              </button>
            </div>
          </div>
        </div>
      </section>

      {filtered.length ? (
        <div
          className={
            view === "grid"
              ? "grid gap-6 lg:grid-cols-2 xl:grid-cols-3"
              : "grid gap-4"
          }
        >
          {filtered.map((course) => (
            <article
              key={course.slug}
              className={`overflow-hidden rounded-[28px] border border-[#dce8f3] bg-white shadow-[0_18px_50px_rgba(12,50,88,0.08)] ${
                view === "list" ? "grid gap-0 lg:grid-cols-[320px_1fr]" : ""
              }`}
            >
              <div className={`relative ${view === "list" ? "min-h-[240px]" : "h-52"}`}>
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  sizes={view === "list" ? "(min-width:1024px) 320px, 100vw" : "(min-width:1280px) 33vw, (min-width:1024px) 50vw, 100vw"}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,33,0.02)_0%,rgba(8,18,33,0.72)_100%)]" />
                <div className="absolute left-4 top-4 inline-flex rounded-full bg-[#19b468] px-3 py-1 text-xs font-black text-white">
                  {course.statusLabel}
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-white/16 px-3 py-1 text-xs font-black text-white backdrop-blur">
                      {course.code}
                    </span>
                    <span className="rounded-full bg-white/16 px-3 py-1 text-xs font-black text-white backdrop-blur">
                      {course.progressPercent}%
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white">{course.title}</h3>
                </div>
              </div>
              <div className="flex flex-col p-6">
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#eef5fb] px-3 py-1 text-xs font-black text-[#0f6eb8]">
                    {course.category}
                  </span>
                  <span className="rounded-full bg-[#f4f8fc] px-3 py-1 text-xs font-black text-[#5d7389]">
                    {formatEnrollmentMeta(course)}
                  </span>
                </div>
                <p className="text-sm font-semibold leading-6 text-[#5d7389]">{course.overview}</p>
                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between text-sm font-black text-[#081221]">
                    <span>Progress</span>
                    <span>{course.completedActivities}/{course.totalActivities}</span>
                  </div>
                  <div className="h-3 rounded-full bg-[#edf3f8]">
                    <div
                      className="h-3 rounded-full bg-[linear-gradient(90deg,#0f6eb8_0%,#1b97db_100%)]"
                      style={{ width: `${course.progressPercent}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm font-bold text-[#5d7389]">
                    <span>{formatCourseDuration(course.duration)}</span>
                    <span className="text-right">{formatRelativeUpdate(course.updatedAt)}</span>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-[#5d7389]">
                    {course.remainingActivities} activities left
                  </div>
                  <Link
                    href={`/dashboard/course/${course.slug}`}
                    className="rounded-full bg-[#0f6eb8] px-5 py-3 text-sm font-black text-white shadow-[0_18px_36px_rgba(15,110,184,0.22)]"
                  >
                    Open workspace
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="rounded-[28px] border border-dashed border-[#c9d9e8] bg-white p-12 text-center shadow-[0_18px_50px_rgba(12,50,88,0.06)]">
          <h3 className="text-2xl font-black text-[#081221]">No matching courses yet</h3>
          <p className="mt-3 text-base font-semibold text-[#5d7389]">
            Try another search term or head to Browse Courses to review the wider SSTA catalogue.
          </p>
          <Link
            href="/dashboard/browse-courses"
            className="mt-6 inline-flex rounded-full bg-[#081221] px-5 py-3 text-sm font-black text-white"
          >
            Browse courses
          </Link>
        </section>
      )}
    </div>
  );
}
