import { redirect } from "next/navigation";
import { EnrollmentApplicationForm } from "@/components/EnrollmentApplicationForm";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getCurrentUser } from "@/lib/auth";
import { getCourse } from "@/lib/course-repository";
import { getEnrollmentApplication, hasPaidInitialFee } from "@/lib/enrollment-application";
import { getSupabaseAdmin } from "@/lib/supabase";

export default async function EnrolmentApplicationPage({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  const { course: courseSlug = "" } = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?redirect_url=${encodeURIComponent(`/enrolment-application?course=${courseSlug}`)}`);
  const course = await getCourse(courseSlug);
  if (!course) redirect("/courses");
  if (!(await hasPaidInitialFee(user.id, course.slug))) redirect(`/enroll?course=${course.slug}`);
  const supabase = getSupabaseAdmin();
  const [{ data: profile }, existing] = await Promise.all([
    supabase ? supabase.from("student_profiles").select("first_name,last_name,email,phone,date_of_birth,usi,residential_address").eq("user_key", user.id).maybeSingle() : Promise.resolve({ data: null }),
    getEnrollmentApplication(user.id, course.slug),
  ]);
  return <main className="min-h-screen bg-slate-50"><SiteHeader /><section className="px-5 py-10 sm:px-8 sm:py-16"><div className="mx-auto mb-8 max-w-3xl text-center"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#0067b1]">Step 2 of 2</p><h1 className="mt-3 text-4xl font-black text-[#020d24] sm:text-5xl">Complete your enrolment application</h1><p className="mt-4 font-bold leading-7 text-slate-600">Your initial payment is confirmed. Submit the full application below and the SSTA team will review it.</p></div><EnrollmentApplicationForm course={course} existing={existing} prefill={{ firstName: profile?.first_name ?? user.firstName ?? "", lastName: profile?.last_name ?? user.lastName ?? "", email: profile?.email ?? user.email, phone: profile?.phone ?? user.phone ?? "", dob: profile?.date_of_birth ?? "", address: profile?.residential_address ?? "", usi: profile?.usi ?? "" }} /></section><SiteFooter /></main>;
}
