import Link from "next/link";
import { ArrowRight, FileText, PhoneCall } from "lucide-react";
import { PublicEnquiryForm } from "@/components/PublicEnquiryForm";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { siteInfo } from "@/lib/site-content";

export default async function EnquirePage({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  const params = await searchParams;
  return <main className="min-h-screen bg-[#f8fcff] text-[#020d24]"><SiteHeader /><section className="relative overflow-hidden px-5 py-16 sm:px-8 sm:py-24"><div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_15%,rgba(245,184,0,0.18),transparent_24%),radial-gradient(circle_at_90%_12%,rgba(24,174,229,0.18),transparent_28%)]" /><div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-start"><div className="pt-3"><p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#0067b1] shadow-sm"><FileText size={15} /> Future student enquiry</p><h1 className="mt-6 text-5xl font-black leading-[0.98] sm:text-6xl">A clear start to your SSTA journey.</h1><p className="mt-6 max-w-xl text-lg font-bold leading-8 text-[#53647c]">Ask a question, tell us which course interests you, and securely share any helpful supporting documents. An SSTA team member will get in touch.</p><div className="mt-8 grid gap-3"><Link href="/courses" className="inline-flex items-center gap-2 font-black text-[#0067b1] hover:text-[#123e95]">Explore courses <ArrowRight size={17} /></Link><a href={siteInfo.phoneHref} className="inline-flex items-center gap-2 font-black text-[#0067b1] hover:text-[#123e95]"><PhoneCall size={17} /> Prefer to call? {siteInfo.phone}</a></div></div><PublicEnquiryForm initialCourseSlug={params.course ?? ""} /></div></section><SiteFooter /></main>;
}
