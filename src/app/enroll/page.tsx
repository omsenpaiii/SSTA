import { ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { EnrollmentForm } from "@/components/EnrollmentForm";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getCourses } from "@/lib/course-repository";
import { getCurrentUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

type EnrollPageProps = {
  searchParams: Promise<{
    course?: string | string[];
  }>;
};

export default async function EnrollPage({ searchParams }: EnrollPageProps) {
  const params = await searchParams;
  const courseParam = Array.isArray(params.course)
    ? params.course[0]
    : params.course;
  const [courses, user] = await Promise.all([getCourses(), getCurrentUser()]);
  const returnPath = courseParam ? `/enroll?course=${encodeURIComponent(courseParam)}` : "/enroll";

  if (!user) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(returnPath)}`);
  }

  const supabase = getSupabaseAdmin();
  const { data: profile } = user && supabase
    ? await supabase
        .from("student_profiles")
        .select("first_name,last_name,email,phone,date_of_birth,usi,residential_address,disability_status,disability_details,referred_by")
        .eq("user_key", user.id)
        .maybeSingle()
    : { data: null };
  const initialValues = profile ? {
    firstName: profile.first_name ?? user?.firstName ?? "",
    lastName: profile.last_name ?? user?.lastName ?? "",
    email: user.email,
    phone: profile.phone ?? "",
    dob: profile.date_of_birth ?? "",
    usi: profile.usi ?? "",
    address: profile.residential_address ?? "",
    disabilityStatus: profile.disability_status ?? "no",
    disabilityDetails: profile.disability_details ?? "",
    referredBy: profile.referred_by ?? "",
  } : user ? {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email,
  } : undefined;

  return (
    <main className="min-h-screen bg-slate-50 selection:bg-[#18aee5]/30">
      <SiteHeader />

      <section className="relative isolate overflow-hidden px-5 py-10 sm:px-8 sm:py-14 lg:py-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_10%,rgba(24,174,229,0.14),transparent_28%),radial-gradient(circle_at_15%_85%,rgba(245,184,0,0.14),transparent_24%),linear-gradient(180deg,#ffffff_0%,#eef8ff_100%)]" />

        <div className="mx-auto mb-8 max-w-3xl text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f5b800]/45 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#d96f00] shadow-sm">
            <ShieldCheck size={14} /> Enrolment · Payment · Course Access
          </p>
          <h1 className="text-4xl font-black leading-tight tracking-normal text-[#020d24] sm:text-5xl">
            Complete your enrolment and start your course.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg font-bold leading-8 text-[#53647c]">
            Choose your course, submit your enrolment details and pay securely. Your course opens in the student portal as soon as payment is confirmed.
          </p>
        </div>

        <EnrollmentForm initialCourseSlug={courseParam} courses={courses} initialValues={initialValues} />
      </section>

      <SiteFooter />
    </main>
  );
}
