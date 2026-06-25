import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { Lock, Play, ShieldCheck } from "lucide-react";
import { getUserAccess } from "@/lib/access";
import { getCourses } from "@/lib/course-repository";
import { isClerkConfigured } from "@/lib/clerk";
import { isSupabaseConfigured } from "@/lib/supabase";
import { SetupNotice } from "@/components/SetupNotice";

export default async function DashboardPage() {
  if (!isClerkConfigured()) {
    return (
      <SetupNotice
        title="Add Clerk keys to enable the student dashboard"
        items={["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY"]}
      />
    );
  }

  const user = await currentUser();

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef8ff] px-5">
        <div className="max-w-lg rounded-[1.5rem] bg-white p-8 text-center shadow-[0_24px_70px_rgba(0,74,143,0.12)]">
          <Lock className="mx-auto mb-4 text-[#0067b1]" />
          <h1 className="text-3xl font-black">Sign in to view your courses</h1>
          <Link
            href="/sign-in"
            className="mt-6 inline-flex rounded-full bg-[#0067b1] px-6 py-3 text-sm font-black text-white"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  const access = isSupabaseConfigured() ? await getUserAccess(user.id) : [];
  const activeSlugs = new Set(access.map((item) => item.course_slug));
  const courses = await getCourses();

  return (
    <main className="min-h-screen bg-[#eef8ff] px-5 py-12 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm font-black text-[#0067b1]">
          Back to SSTA
        </Link>
        <div className="mt-8 rounded-[1.5rem] bg-white p-8 shadow-[0_24px_70px_rgba(0,74,143,0.12)]">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-[#0067b1]">
            Student dashboard
          </p>
          <h1 className="mt-3 text-4xl font-black text-[#020d24]">
            Welcome, {user.firstName ?? "student"}
          </h1>
          {!isSupabaseConfigured() ? (
            <p className="mt-4 rounded-2xl bg-[#fff7dd] p-4 text-sm font-bold text-[#9b5b00]">
              Supabase env vars are not configured yet, so live enrolments will
              appear after the database is connected.
            </p>
          ) : null}
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {courses.map((course) => {
            const unlocked = activeSlugs.has(course.slug);
            return (
              <article
                key={course.slug}
                className="rounded-[1.25rem] border border-[#18aee5]/14 bg-white p-6 shadow-[0_18px_45px_rgba(0,74,143,0.08)]"
              >
                <div className="mb-5 flex size-12 items-center justify-center rounded-full bg-[#eef8ff] text-[#0067b1]">
                  {unlocked ? <Play size={20} /> : <ShieldCheck size={20} />}
                </div>
                <h2 className="text-xl font-black">{course.title}</h2>
                <p className="mt-3 text-sm font-bold leading-6 text-[#53647c]">
                  {unlocked
                    ? "Unlocked. Continue learning from your protected lesson library."
                    : "Locked. Complete checkout to unlock all lessons."}
                </p>
                <Link
                  href={unlocked ? "#lessons" : "/#courses"}
                  className="mt-5 inline-flex rounded-full bg-[#0067b1] px-5 py-3 text-sm font-black text-white"
                >
                  {unlocked ? "Continue" : "View course"}
                </Link>
              </article>
            );
          })}
        </div>

        <section id="lessons" className="mt-8 rounded-[1.5rem] bg-white p-8">
          <h2 className="text-2xl font-black">Available lessons</h2>
          <div className="mt-5 space-y-3">
            {courses[0].lessons.map((lesson) => {
              const unlocked = lesson.isPreview || activeSlugs.has(courses[0].slug);
              return (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between rounded-2xl border border-[#18aee5]/10 p-4"
                >
                  <div>
                    <p className="font-black">{lesson.title}</p>
                    <p className="text-sm font-bold text-[#53647c]">
                      {lesson.duration}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#eef8ff] px-3 py-1 text-xs font-black text-[#0067b1]">
                    {unlocked ? "Playable" : "Locked"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
