import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, LockKeyhole, PhoneCall } from "lucide-react";
import { redirect } from "next/navigation";
import { EnrollmentApplicationForm } from "@/components/EnrollmentApplicationForm";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getCurrentUser } from "@/lib/auth";
import { getCourse } from "@/lib/course-repository";
import {
  getEligibleEnrollmentApplicationCourses,
  getEnrollmentApplication,
  hasPaidInitialFee,
} from "@/lib/enrollment-application";
import { getSupabaseAdmin } from "@/lib/supabase";

type PageProps = { searchParams: Promise<{ course?: string }> };

function PublicApplicationShell({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-[#f4f9fd]"><SiteHeader />{children}<SiteFooter /></main>;
}

function LockedApplication({ signedIn, courseSlug }: { signedIn: boolean; courseSlug?: string }) {
  const startHref = courseSlug ? `/enroll?course=${encodeURIComponent(courseSlug)}` : "/enroll";
  const returnTo = courseSlug ? `/enrolment-application?course=${encodeURIComponent(courseSlug)}` : "/enrolment-application";

  return (
    <PublicApplicationShell>
      <section className="px-5 py-12 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-[30px] border border-[#d7e6f2] bg-white shadow-[0_28px_80px_rgba(0,74,143,0.12)]">
          <div className="bg-[#062846] px-7 py-9 text-white sm:px-10">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-white/10 text-[#f5b800]"><LockKeyhole size={28} /></div>
            <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-sky-200">Enrolment Form locked</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Start your course for $150.</h1>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-white/75">Choose your course and complete the secure $150 initial payment. As soon as Stripe confirms it, this full enrolment form unlocks for that course.</p>
          </div>
          <div className="grid gap-6 p-7 sm:p-10">
            <ol className="grid gap-3 sm:grid-cols-3">
              {["Choose a course", "Pay $150 securely", "Complete the full form"].map((step, index) => (
                <li key={step} className="rounded-2xl border border-[#d7e6f2] bg-[#f7fbff] p-4 text-sm font-black text-[#17334d]">
                  <span className="mb-3 flex size-7 items-center justify-center rounded-full bg-[#0067b1] text-xs text-white">{index + 1}</span>{step}
                </li>
              ))}
            </ol>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/courses" className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-[#bcd5e8] px-5 text-sm font-black text-[#0067b1] transition hover:bg-[#eef8ff]">Choose a course</Link>
              <Link href={startHref} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#0067b1] px-5 text-sm font-black text-white shadow-[0_14px_30px_rgba(0,103,177,0.2)] transition hover:bg-[#005793]">Start for $150 <ArrowRight size={17} /></Link>
            </div>
            {!signedIn ? (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-bold leading-6 text-amber-950">Already paid or started checkout? <Link href={`/sign-in?redirect_url=${encodeURIComponent(returnTo)}`} className="underline underline-offset-2">Sign in</Link> to check your access, or <Link href={`/sign-up?redirect_url=${encodeURIComponent(returnTo)}`} className="underline underline-offset-2">create your student account</Link> first.</p>
            ) : (
              <p className="rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm font-bold leading-6 text-sky-950">You are signed in, but no confirmed $150 initial payment was found for this course. If you have just paid, wait a moment and refresh while Stripe finishes confirmation.</p>
            )}
            <a href="tel:+61431696558" className="mx-auto inline-flex items-center gap-2 text-sm font-black text-[#0067b1]"><PhoneCall size={17} /> Need help? Call Joseph on +61 431 696 558</a>
          </div>
        </div>
      </section>
    </PublicApplicationShell>
  );
}

export default async function EnrolmentApplicationPage({ searchParams }: PageProps) {
  const { course: courseSlug } = await searchParams;
  const user = await getCurrentUser();

  if (!user) return <LockedApplication signedIn={false} courseSlug={courseSlug} />;

  const eligibleCourses = await getEligibleEnrollmentApplicationCourses(user.id);

  if (!courseSlug) {
    if (eligibleCourses.length === 1) redirect(`/enrolment-application?course=${encodeURIComponent(eligibleCourses[0].slug)}`);
    if (eligibleCourses.length === 0) return <LockedApplication signedIn />;

    return (
      <PublicApplicationShell>
        <section className="px-5 py-12 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0067b1]">Enrolment Form unlocked</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-[#020d24] sm:text-5xl">Choose an application</h1>
              <p className="mx-auto mt-4 max-w-2xl font-bold leading-7 text-slate-600">Your $150 initial payments are confirmed. Select the course application you want to complete or review.</p>
            </div>
            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              {eligibleCourses.map((course) => (
                <Link key={course.slug} href={`/enrolment-application?course=${encodeURIComponent(course.slug)}`} className="group rounded-3xl border border-[#d7e6f2] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0067b1]/40 hover:shadow-lg">
                  <div className="flex items-start justify-between gap-4"><span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><FileText size={21} /></span><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-emerald-700">{course.applicationStatus?.replaceAll("_", " ") ?? "Not started"}</span></div>
                  <h2 className="mt-5 text-xl font-black leading-7 text-[#020d24]">{course.title}</h2>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#0067b1]">Open application <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </PublicApplicationShell>
    );
  }

  const course = await getCourse(courseSlug);
  if (!course) return <LockedApplication signedIn />;
  if (!(await hasPaidInitialFee(user.id, course.slug))) return <LockedApplication signedIn courseSlug={course.slug} />;

  const supabase = getSupabaseAdmin();
  const [{ data: profile }, existing] = await Promise.all([
    supabase ? supabase.from("student_profiles").select("first_name,last_name,email,phone,date_of_birth,usi,residential_address").eq("user_key", user.id).maybeSingle() : Promise.resolve({ data: null }),
    getEnrollmentApplication(user.id, course.slug),
  ]);

  return (
    <PublicApplicationShell>
      <section className="px-5 py-10 sm:px-8 sm:py-16">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><CheckCircle2 size={24} /></div>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-[#0067b1]">$150 payment confirmed</p>
          <h1 className="mt-3 text-4xl font-black text-[#020d24] sm:text-5xl">Complete your enrolment application</h1>
          <p className="mt-4 font-bold leading-7 text-slate-600">Your form is unlocked for {course.title}. Submit it below and the SSTA team will review it.</p>
        </div>
        <EnrollmentApplicationForm course={course} existing={existing} prefill={{ firstName: profile?.first_name ?? user.firstName ?? "", lastName: profile?.last_name ?? user.lastName ?? "", email: profile?.email ?? user.email, phone: profile?.phone ?? user.phone ?? "", dob: profile?.date_of_birth ?? "", address: profile?.residential_address ?? "", usi: profile?.usi ?? "" }} />
      </section>
    </PublicApplicationShell>
  );
}
