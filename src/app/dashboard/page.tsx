import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookCheck, Clock3, GraduationCap, Layers3, TrendingUp } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { formatActivityStatus, formatRelativeUpdate, getStudentPortalData } from "@/lib/student-portal";

export default async function DashboardHomePage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const portalData = await getStudentPortalData(user);
  const continueCourse = portalData.continueCourse;

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="portal-card rounded-[28px] p-7 sm:p-8">
          <p className="portal-section-label">
            Welcome back
          </p>
          <h2 className="portal-page-heading mt-3 max-w-[12ch]">
            {user.firstName ? `${user.firstName}, your progress is moving.` : "Your progress is moving."}
          </h2>
          <p className="portal-page-copy mt-4 max-w-3xl">
            Keep your SSTA learning in one place: course access, activity tracking, resources, and the next task that gets you closer to completion.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Enrolled courses",
                value: String(portalData.totalCourses),
                icon: GraduationCap,
              },
              {
                label: "Average progress",
                value: `${portalData.averageProgress}%`,
                icon: TrendingUp,
              },
              {
                label: "Completed activities",
                value: String(portalData.completedActivities),
                icon: BookCheck,
              },
              {
                label: "Remaining tasks",
                value: String(portalData.remainingActivities),
                icon: Layers3,
              },
            ].map((item) => (
              <article
                key={item.label}
                className="portal-subtle-card rounded-[22px] p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-black leading-5 text-[#5d7389]">{item.label}</span>
                  <span className="flex size-11 items-center justify-center rounded-[16px] bg-[#eef5fb] text-[#0f6eb8]">
                    <item.icon size={20} />
                  </span>
                </div>
                <p className="mt-5 text-[2.6rem] leading-none font-black tracking-tight text-[#081221]">
                  {item.value}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="portal-card rounded-[28px] p-7 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="portal-section-label">
                Continue learning
              </p>
              <h3 className="mt-2 max-w-[12ch] text-[2rem] font-black tracking-tight text-[#081221]">
                {continueCourse ? continueCourse.title : "Your next course will appear here"}
              </h3>
            </div>
            <div className="rounded-[16px] bg-[#eef5fb] px-3 py-2 text-xs font-black text-[#0f6eb8]">
              {continueCourse ? `${continueCourse.progressPercent}% complete` : "Ready when you are"}
            </div>
          </div>

          {continueCourse ? (
            <>
              <div className="mt-5 overflow-hidden rounded-[24px]">
                <div className="relative h-52">
                  <Image
                    src={continueCourse.image}
                    alt={continueCourse.title}
                    fill
                    sizes="(min-width:1280px) 30vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,33,0.02)_0%,rgba(8,18,33,0.72)_100%)]" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-white/78">
                      {continueCourse.code}
                    </p>
                    <p className="mt-2 text-xl font-black text-white">
                      {continueCourse.completedActivities} completed · {continueCourse.remainingActivities} remaining
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-5 text-sm font-semibold leading-6 text-[#5d7389]">
                {continueCourse.overview}
              </p>
              <div className="mt-5 h-3 rounded-full bg-[#edf3f8]">
                <div
                  className="h-3 rounded-full bg-[linear-gradient(90deg,#0f6eb8_0%,#1b97db_100%)]"
                  style={{ width: `${continueCourse.progressPercent}%` }}
                />
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-semibold text-[#5d7389]">
                  Updated {formatRelativeUpdate(continueCourse.updatedAt)}
                </span>
                <Link
                  href={`/dashboard/course/${continueCourse.slug}`}
                  className="portal-button-primary inline-flex items-center gap-2 px-5 py-3 text-sm"
                >
                  Open workspace
                  <ArrowRight size={18} />
                </Link>
              </div>
            </>
          ) : (
            <div className="mt-8 rounded-[24px] border border-dashed border-[#c9d9e8] bg-[#fbfdff] p-8 text-center">
              <p className="text-base font-semibold text-[#5d7389]">
                Once you enrol in a course, this panel becomes your launch point for lessons, activity tracking, and resources.
              </p>
              <Link
                href="/dashboard/browse-courses"
                className="mt-5 inline-flex rounded-[16px] bg-[#081221] px-5 py-3 text-sm font-black text-white"
              >
                Browse courses
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="portal-card rounded-[28px] p-7 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black tracking-tight text-[#081221]">Next up</h3>
              <p className="mt-2 text-sm font-semibold text-[#5d7389]">
                Keep momentum on the activities that still need attention.
              </p>
            </div>
            <Link
              href="/dashboard/my-courses"
              className="text-sm font-black text-[#0f6eb8]"
            >
              View all courses
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {portalData.incompleteActivityFeed.length ? (
              portalData.incompleteActivityFeed.map((activity) => (
                <Link
                  key={`${activity.courseSlug}-${activity.id}`}
                  href={`/dashboard/course/${activity.courseSlug}/activities/${activity.id}`}
                  className="portal-subtle-card flex flex-wrap items-center justify-between gap-4 rounded-[20px] p-5 transition hover:border-[#0f6eb8]/30 hover:bg-white"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f6eb8]">
                      {activity.courseTitle}
                    </p>
                    <h4 className="mt-2 text-lg font-black text-[#081221]">{activity.title}</h4>
                    <p className="mt-1 text-sm font-semibold text-[#5d7389]">{activity.summary}</p>
                  </div>
                  <div className="text-right">
                    <div className="rounded-[16px] bg-[#eef5fb] px-3 py-2 text-xs font-black text-[#0f6eb8]">
                      {formatActivityStatus(activity.status)}
                    </div>
                    <p className="mt-2 text-xs font-semibold text-[#7f92a5]">{activity.group}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-[#c9d9e8] bg-[#fbfdff] p-8 text-center">
                <h4 className="text-xl font-black text-[#081221]">Everything is up to date</h4>
                <p className="mt-3 text-sm font-semibold text-[#5d7389]">
                  Once you start working through activities, this feed will keep the next important task in front of you.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="portal-card rounded-[28px] p-7 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-black tracking-tight text-[#081221]">Recent activity</h3>
              <p className="mt-2 text-sm font-semibold text-[#5d7389]">
                Quick recap of the lessons and unit work you touched most recently.
              </p>
            </div>
            <Clock3 size={18} className="text-[#7f92a5]" />
          </div>

          <div className="mt-6 space-y-4">
            {portalData.recentActivity.length ? (
              portalData.recentActivity.map((activity) => (
                <div
                  key={`${activity.id}-${activity.updatedAt ?? "recent"}`}
                  className="portal-subtle-card rounded-[20px] p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-lg font-black text-[#081221]">{activity.title}</h4>
                    <span className="rounded-2xl bg-[#e7fff1] px-3 py-1 text-xs font-black text-[#198754]">
                      {formatActivityStatus(activity.status)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-[#5d7389]">{activity.subtitle}</p>
                  <div className="mt-4 flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.14em] text-[#7f92a5]">
                    <span>{activity.group}</span>
                    <span>{formatRelativeUpdate(activity.updatedAt)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-[#c9d9e8] bg-[#fbfdff] p-8 text-center">
                <h4 className="text-xl font-black text-[#081221]">No recent activity yet</h4>
                <p className="mt-3 text-sm font-semibold text-[#5d7389]">
                  Your latest lesson and activity updates will start appearing here as you use the portal.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
