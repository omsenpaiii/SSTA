"use client";

import { useState } from "react";
import { courses, type Course } from "@/lib/courses";
import { CheckoutButton } from "@/components/CheckoutButton";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft, Clock, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

function getStoredCourses() {
  if (typeof window === "undefined") {
    return courses;
  }

  const stored = localStorage.getItem("ssta_courses");
  if (!stored) {
    return courses;
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as Course[]) : courses;
  } catch (error) {
    console.error("Error parsing courses from localStorage:", error);
    return courses;
  }
}

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [activeCourses] = useState<Course[]>(getStoredCourses);

  const categories = ["All", "Most Popular", "New Cohort", "Practical"];

  // Filter logic
  const filteredCourses = activeCourses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === "All") return matchesSearch;
    return matchesSearch && course.label.toLowerCase() === selectedFilter.toLowerCase();
  });

  return (
    <main className="min-h-screen bg-slate-50 selection:bg-[#18aee5]/30">
      {/* Header matching enroll page */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="group flex items-center justify-center gap-3 transition-opacity hover:opacity-80 min-h-12 min-w-12 p-2.5 -ml-2.5 rounded-full hover:bg-slate-100/50"
            aria-label="Back to Home"
          >
            <ArrowLeft className="text-[#0067b1] shrink-0" size={20} />
            <span className="font-black text-[#020d24] text-sm hidden sm:block">Back to Home</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="relative block size-10 shrink-0 overflow-hidden rounded-full bg-white shadow-sm border border-slate-100">
              <Image
                src="/ssta-logo.jpg"
                alt="SSTA logo"
                width={86}
                height={69}
                className="absolute left-1/2 top-1/2 h-auto w-[170%] max-w-none -translate-x-[45%] -translate-y-[45%] object-contain"
              />
            </span>
            <div>
              <p className="text-sm font-black tracking-widest text-[#0067b1] uppercase">SSTA</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase">RTO Code: 40873</p>
            </div>
          </div>

          <div className="w-[100px] flex justify-end">
            <ShieldCheck className="text-[#f5b800]" size={24} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <section className="relative isolate px-5 py-12 sm:px-8 sm:py-20 overflow-hidden min-h-[calc(100vh-80px)]">
        {/* Decorative Background Elements */}
        <div className="absolute top-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-[#18aee5]/10 blur-3xl -z-10" />
        <div className="absolute bottom-[-10%] left-[-5%] h-[500px] w-[500px] rounded-full bg-[#f5b800]/10 blur-3xl -z-10" />

        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#0067b1]/20 bg-[#0067b1]/5 px-4 py-1.5 text-xs font-black text-[#0067b1] shadow-sm mb-6 uppercase tracking-wider">
              COURSE CATALOGUE
            </p>
            <h1 className="text-4xl sm:text-5xl font-black text-[#020d24] tracking-tight leading-tight mb-4">
              All Training Programs
            </h1>
            <p className="text-lg font-bold text-[#53647c] max-w-2xl mx-auto">
              Find the right certification to advance your career.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-3xl mx-auto mb-16 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input
                type="text"
                placeholder="Search for courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 rounded-full border-slate-200 bg-white font-semibold focus-visible:ring-[#18aee5] shadow-sm text-base"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar scroll-smooth">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedFilter(cat)}
                  className={`shrink-0 rounded-full h-12 px-6 text-sm font-bold transition-all flex items-center justify-center cursor-pointer ${
                    selectedFilter === cat
                      ? "bg-[#020d24] text-white shadow-md"
                      : "bg-white text-slate-500 hover:bg-slate-100 hover:text-[#020d24]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Layout */}
          {filteredCourses.length > 0 ? (
            <motion.div layout className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {filteredCourses.map((course) => (
                  <motion.article
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    key={course.slug}
                    className="flex flex-col overflow-hidden rounded-[1.5rem] border border-[#18aee5]/15 bg-white shadow-[0_24px_50px_rgba(0,103,177,0.06)] hover:shadow-[0_30px_60px_rgba(0,103,177,0.12)] transition-shadow"
                  >
                    <div className="relative h-56 w-full shrink-0 overflow-hidden">
                      <Image
                        src={course.image}
                        alt={course.title}
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#020d24]/90 via-[#020d24]/20 to-transparent" />

                      <div className="absolute left-6 top-6 rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#0067b1] shadow-md">
                        {course.label}
                      </div>

                      <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
                        <h3 className="text-xl font-black leading-tight text-white line-clamp-2">
                          {course.title}
                        </h3>
                        <div className="rounded-full bg-[#f5b800] px-3 py-1 text-sm font-black text-[#020d24]">
                          ${course.priceAud}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <div className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0067b1]">
                        <Clock size={16} />
                        {course.duration}
                      </div>
                      <p className="flex-1 text-sm font-bold leading-relaxed text-[#53647c]">
                        {course.description}
                      </p>
                      <div className="mt-6">
                        <CheckoutButton courseSlug={course.slug} />
                      </div>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="rounded-full bg-slate-100 p-6 mb-4">
                <Search size={32} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-black text-[#020d24] mb-2">No courses found</h3>
              <p className="text-slate-500 font-semibold max-w-md">
                We couldn&apos;t find any courses matching your search &quot;{searchQuery}&quot;. Try adjusting your filters.
              </p>
              <button
                onClick={() => { setSearchQuery(""); setSelectedFilter("All"); }}
                className="mt-6 text-[#0067b1] font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
