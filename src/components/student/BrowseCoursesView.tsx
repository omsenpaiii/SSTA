"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import type { CourseCatalogCard } from "@/lib/student-portal";

type BrowseCoursesViewProps = {
  courses: CourseCatalogCard[];
};

export function BrowseCoursesView({ courses }: BrowseCoursesViewProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(courses.map((course) => course.category))).sort()],
    [courses],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesCategory = category === "All" || course.category === category;
      if (!matchesCategory) return false;
      if (!normalized) return true;

      return [course.title, course.code, course.category, course.overview, course.label]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    });
  }, [category, courses, query]);

  const hasActiveFilters = query.trim().length > 0 || category !== "All";

  function clearFilters() {
    setQuery("");
    setCategory("All");
  }

  return (
    <div className="space-y-6">
      <section className="portal-card rounded-[28px] p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-[#081221]">Browse Courses</h2>
            <p className="portal-page-copy mt-2 max-w-3xl">
              Explore the wider SSTA catalogue, compare industries, and jump straight into your enrolled workspaces where access is already active.
            </p>
          </div>
          <p className="shrink-0 text-sm font-black text-[#5d7389]" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "course" : "courses"}
          </p>
        </div>

        <div className="mt-7 space-y-4">
          <label className="portal-input flex h-16 w-full items-center gap-3 px-5 text-base font-semibold text-[#5d7389] shadow-[0_12px_30px_rgba(15,110,184,0.06)] transition focus-within:border-[#77bce8] focus-within:ring-4 focus-within:ring-[#0f6eb8]/8">
            <Search size={21} className="shrink-0 text-[#0f6eb8]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search courses by name, code, overview, or category..."
              className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#90a3b7]"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear course search"
                className="grid size-9 shrink-0 place-items-center rounded-full text-[#6f8499] transition hover:bg-[#e8f3fb] hover:text-[#0f6eb8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f6eb8]"
              >
                <X size={18} />
              </button>
            ) : null}
          </label>

          <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap" aria-label="Filter courses by category">
            {categories.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCategory(option)}
                aria-pressed={option === category}
                className={`shrink-0 rounded-[16px] px-4 py-3 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f6eb8] focus-visible:ring-offset-2 ${
                  option === category
                    ? "bg-[#0f6eb8] text-white shadow-[0_12px_24px_rgba(15,110,184,0.16)]"
                    : "border border-[#d8e6f2] bg-[#f4f8fc] text-[#5d7389] hover:border-[#9fc9e7] hover:bg-[#edf6fc] hover:text-[#0f6eb8]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </section>

      {filtered.length ? (
        <div className="grid auto-rows-fr gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course) => (
            <article
              key={course.slug}
              className="portal-card group flex h-full flex-col overflow-hidden rounded-[24px] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(15,110,184,0.14)]"
            >
              <div className="relative h-52 shrink-0 overflow-hidden">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  sizes="(min-width:1280px) 33vw, (min-width:768px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,33,0.02)_0%,rgba(8,18,33,0.72)_100%)]" />
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <span className="rounded-[14px] bg-white/16 px-3 py-1 text-xs font-black text-white backdrop-blur">
                    {course.code}
                  </span>
                  {course.enrolled ? (
                    <span className="rounded-[14px] bg-[#19b468] px-3 py-1 text-xs font-black text-white">
                      Enrolled
                    </span>
                  ) : null}
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="line-clamp-2 text-2xl font-black leading-tight text-white">{course.title}</h3>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex min-h-7 flex-wrap content-start gap-2">
                  <span className="rounded-[14px] bg-[#eef5fb] px-3 py-1 text-xs font-black text-[#0f6eb8]">
                    {course.category}
                  </span>
                  <span className="rounded-[14px] bg-[#f4f8fc] px-3 py-1 text-xs font-black text-[#5d7389]">
                    {course.duration}
                  </span>
                  {course.progressPercent != null ? (
                    <span className="rounded-[14px] bg-[#e7fff1] px-3 py-1 text-xs font-black text-[#198754]">
                      {course.progressPercent}% complete
                    </span>
                  ) : null}
                </div>
                <p className="line-clamp-4 min-h-24 text-sm font-semibold leading-6 text-[#5d7389]" title={course.overview}>
                  {course.overview}
                </p>
                <div className="mt-5 flex h-8 flex-nowrap gap-2 overflow-hidden">
                  {course.deliveryModes.slice(0, 2).map((mode) => (
                    <span
                      key={mode}
                      className="min-w-0 truncate rounded-[14px] border border-[#d9e7f3] px-3 py-1 text-xs font-black text-[#5d7389]"
                      title={mode}
                    >
                      {mode}
                    </span>
                  ))}
                  {course.deliveryModes.length > 2 ? (
                    <span className="shrink-0 rounded-[14px] border border-[#d9e7f3] px-3 py-1 text-xs font-black text-[#5d7389]">
                      +{course.deliveryModes.length - 2} more
                    </span>
                  ) : null}
                </div>
                <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#e3edf5] pt-5">
                  <span className="text-base font-black text-[#081221]">
                    AUD {course.priceAud.toLocaleString("en-AU")}
                  </span>
                  <Link
                    href={course.actionHref}
                    className={`shrink-0 rounded-[16px] px-5 py-3 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f6eb8] focus-visible:ring-offset-2 ${
                      course.enrolled
                        ? "bg-[#0f6eb8] text-white shadow-[0_18px_36px_rgba(15,110,184,0.14)] hover:bg-[#0b5d9d]"
                        : "border border-[#b9d7eb] bg-white text-[#0f6eb8] hover:border-[#0f6eb8] hover:bg-[#edf6fc]"
                    }`}
                  >
                    {course.actionLabel}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="portal-card rounded-[24px] border-dashed p-12 text-center">
          <h3 className="text-2xl font-black text-[#081221]">No courses match that search</h3>
          <p className="mt-3 text-base font-semibold text-[#5d7389]">
            Clear the search or switch category filters to explore the full SSTA course range again.
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 rounded-[16px] bg-[#0f6eb8] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0b5d9d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f6eb8] focus-visible:ring-offset-2"
            >
              Clear all filters
            </button>
          ) : null}
        </section>
      )}
    </div>
  );
}
