import { EnrollmentForm } from "@/components/EnrollmentForm";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function EnrollPage() {
  return (
    <main className="min-h-screen bg-slate-50 selection:bg-[#18aee5]/30">
      {/* Premium Minimal Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="group flex items-center gap-3 transition-opacity hover:opacity-80">
            <ArrowLeft className="text-[#0067b1]" size={20} />
            <span className="font-black text-[#020d24] text-sm hidden sm:block">Back to Home</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <span className="relative block size-10 shrink-0 overflow-hidden rounded-full bg-white shadow-sm border border-slate-100">
              <Image
                src="/ssta-logo.jpg"
                alt="SSTA logo"
                width={86}
                height={69}
                className="absolute left-1/2 top-1/2 h-auto w-[170%] max-w-none -translate-x-[48%] -translate-y-[45%] object-contain"
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
      <section className="relative isolate px-5 py-12 sm:px-8 sm:py-20 lg:py-24 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-[#18aee5]/10 blur-3xl -z-10" />
        <div className="absolute bottom-[-10%] left-[-5%] h-[500px] w-[500px] rounded-full bg-[#f5b800]/10 blur-3xl -z-10" />

        <div className="mx-auto max-w-3xl text-center mb-12">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#f5b800]/45 bg-white px-4 py-1.5 text-xs font-black text-[#d96f00] shadow-sm mb-6 uppercase tracking-wider">
            <ShieldCheck size={14} /> Official RTO Enrollment
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#020d24] tracking-tight leading-tight mb-4">
            Begin your training journey.
          </h1>
          <p className="text-lg font-bold text-[#53647c] max-w-2xl mx-auto">
            Complete the form below to register your details and securely unlock access to our professional security training modules.
          </p>
        </div>

        <EnrollmentForm />
      </section>
    </main>
  );
}
