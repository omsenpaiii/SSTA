import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { siteInfo } from "@/lib/site-content";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white text-[#020d24]">
      <SiteHeader />
      <section className="relative isolate overflow-hidden px-5 py-16 sm:px-8 sm:py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(245,184,0,0.18),transparent_24%),radial-gradient(circle_at_85%_12%,rgba(24,174,229,0.18),transparent_28%),linear-gradient(180deg,#ffffff_0%,#eef8ff_100%)]" />
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-[#0067b1] shadow-sm">
            <ShieldCheck size={15} /> Contact SSTA
          </p>
          <h1 className="max-w-4xl text-5xl font-black leading-tight tracking-normal sm:text-6xl">
            Ask about enrolment, course access or training pathways.
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-bold leading-8 text-[#53647c]">
            Use the contact details below or start the enrolment form. SSTA will respond through the configured intake mailbox.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <a href={`mailto:${siteInfo.email}`} className="rounded-[1.5rem] bg-white p-6 shadow-[0_24px_70px_rgba(0,74,143,0.08)]">
              <Mail className="text-[#0067b1]" size={32} />
              <h2 className="mt-5 text-xl font-black">Email</h2>
              <p className="mt-2 text-sm font-bold text-[#53647c]">{siteInfo.email}</p>
            </a>
            <a href={siteInfo.phoneHref} className="rounded-[1.5rem] bg-white p-6 shadow-[0_24px_70px_rgba(0,74,143,0.08)]">
              <Phone className="text-[#f5b800]" size={32} />
              <h2 className="mt-5 text-xl font-black">Phone</h2>
              <p className="mt-2 text-sm font-bold text-[#53647c]">{siteInfo.phone}</p>
            </a>
            <div className="rounded-[1.5rem] bg-white p-6 shadow-[0_24px_70px_rgba(0,74,143,0.08)]">
              <MapPin className="text-[#0067b1]" size={32} />
              <h2 className="mt-5 text-xl font-black">Address</h2>
              <p className="mt-2 text-sm font-bold text-[#53647c]">{siteInfo.address}</p>
            </div>
            <div className="rounded-[1.5rem] bg-white p-6 shadow-[0_24px_70px_rgba(0,74,143,0.08)]">
              <MessageCircle className="text-[#0067b1]" size={32} />
              <h2 className="mt-5 text-xl font-black">IT Support — {siteInfo.itSupport.name}</h2>
              <p className="mt-2 text-sm font-bold text-[#53647c]">{siteInfo.itSupport.phone}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <a href={siteInfo.itSupport.phoneHref} className="inline-flex items-center gap-2 rounded-full bg-[#0067b1] px-4 py-2 text-xs font-black text-white">
                  <Phone size={15} /> Call
                </a>
                <a href={siteInfo.itSupport.whatsappHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-black text-white">
                  <MessageCircle size={15} /> WhatsApp
                </a>
              </div>
            </div>
          </div>

          <Link href="/enroll" className="mt-10 inline-flex rounded-full bg-[#0067b1] px-6 py-4 text-sm font-black text-white">
            Start Enrolment
          </Link>
          <p className="mt-10 text-xs font-semibold text-[#7d90a5]">Powered by Buildshoot</p>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
