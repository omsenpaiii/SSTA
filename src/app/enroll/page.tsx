import { ShieldCheck } from "lucide-react";
import { EnrollmentForm } from "@/components/EnrollmentForm";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

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

  return (
    <main className="min-h-screen bg-slate-50 selection:bg-[#18aee5]/30">
      <SiteHeader />

      <section className="relative isolate overflow-hidden px-5 py-14 sm:px-8 sm:py-20 lg:py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_85%_10%,rgba(24,174,229,0.14),transparent_28%),radial-gradient(circle_at_15%_85%,rgba(245,184,0,0.14),transparent_24%),linear-gradient(180deg,#ffffff_0%,#eef8ff_100%)]" />

        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#f5b800]/45 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#d96f00] shadow-sm">
            <ShieldCheck size={14} /> Official SSTA Enrollment
          </p>
          <h1 className="text-4xl font-black leading-tight tracking-normal text-[#020d24] sm:text-5xl lg:text-6xl">
            Enrol for your preferred course now.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg font-bold leading-8 text-[#53647c]">
            Submit your details, select your course and continue to secure checkout when payment keys are configured.
          </p>
        </div>

        <EnrollmentForm initialCourseSlug={courseParam} />
      </section>

      <SiteFooter />
    </main>
  );
}
