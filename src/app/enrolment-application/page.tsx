import { SecurityEnrollmentForm } from "@/components/SecurityEnrollmentForm";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getCurrentUser } from "@/lib/auth";
export default async function EnrollmentApplicationPage() {
  const user = await getCurrentUser();
  return <main className="min-h-screen bg-slate-50"><SiteHeader /><section className="mx-auto max-w-5xl px-5 py-12 sm:px-8"><div className="mx-auto mb-8 max-w-3xl text-center"><p className="text-sm font-black uppercase tracking-widest text-[#0067b1]">Free public enrollment</p><h1 className="mt-3 text-4xl font-black text-[#020d24]">Security Certificate II enrolment form</h1><p className="mt-5 text-lg leading-8 text-[#53647c]">Download the Word form, fill in your details and submit it below. Enrollment and the Security LLN are free. No account or payment is required to submit.</p></div><SecurityEnrollmentForm email={user?.email} /></section><SiteFooter /></main>;
}
