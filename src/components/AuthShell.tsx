import Link from "next/link";
import { ShieldCheck, Users, GraduationCap, LineChart, type LucideIcon } from "lucide-react";

type AuthShellProps = {
  title: string;
  subtitle: string;
  mode: "sign-in" | "sign-up";
  children: React.ReactNode;
};

export function AuthShell({ title, subtitle, mode, children }: AuthShellProps) {
  const featureRows: { heading: string; copy: string; icon: LucideIcon }[] = [
    { heading: "Student dashboard", copy: "Course access and lesson records", icon: Users },
    { heading: "Course management", copy: "Training programs and modules", icon: GraduationCap },
    { heading: "Secure payments", copy: "Enrollment and reporting visibility", icon: LineChart },
  ];

  return (
    <main className="grid min-h-screen bg-white text-[#101827] lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-[#082647] px-10 py-12 text-white lg:block">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:56px_56px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(24,174,229,0.22),transparent_30%),linear-gradient(140deg,#09213e_0%,#0d3b69_52%,#06162a_100%)]" />
        <div className="relative z-10 flex h-full min-h-[680px] flex-col justify-between">
          <Link href="/" className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-2xl border border-white/18 bg-white/10">
              <ShieldCheck size={28} />
            </span>
            <span>
              <span className="block text-2xl font-black">SSTA</span>
              <span className="block text-sm font-bold uppercase tracking-[0.12em] text-white/58">
                {mode === "sign-in" ? "Secure Portal" : "Student Access"}
              </span>
            </span>
          </Link>

          <div className="max-w-2xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/12 px-4 py-2 text-sm font-black text-white/82">
              <span className="size-2 rounded-full bg-[#f5b800]" />
              {mode === "sign-in" ? "SECURE ACCOUNT ACCESS" : "CREATE SSTA ACCOUNT"}
            </div>
            <h1 className="text-5xl font-black leading-[1.05] tracking-normal xl:text-6xl">
              Manage your academy journey with confidence.
            </h1>
            <p className="mt-8 max-w-xl text-xl font-bold leading-9 text-white/68">
              Sign in with Google or email to access course enrolments, lessons, and SSTA account tools.
            </p>
          </div>

          <div className="grid max-w-2xl gap-5">
            {featureRows.map(({ heading, copy, icon: Icon }) => (
              <div key={heading} className="grid grid-cols-[48px_1fr_24px] items-center gap-5">
                <span className="flex size-12 items-center justify-center rounded-xl border border-white/12 bg-white/7 text-[#f5b800]">
                  <Icon size={22} />
                </span>
                <span>
                  <span className="block text-base font-black">{heading}</span>
                  <span className="block text-sm font-bold text-white/48">{copy}</span>
                </span>
                <ShieldCheck size={18} className="text-emerald-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-5 py-12">
        <div className="w-full max-w-[520px]">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-4xl font-black tracking-normal text-[#111827]">{title}</h2>
            <p className="mt-3 text-lg font-bold text-[#748091]">{subtitle}</p>
          </div>
          <div className="auth-card">{children}</div>
          <div className="mt-8 border-t border-slate-200 pt-7 text-center text-sm font-bold text-[#748091]">
            <ShieldCheck className="mr-2 inline-block align-[-4px]" size={18} />
            Protected by SSTA Security
          </div>
        </div>
      </section>
    </main>
  );
}

export const clerkAppearance = {
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none bg-transparent",
    card: "w-full shadow-none bg-transparent p-0",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlockButton:
      "h-14 rounded-xl border border-slate-200 bg-white text-base font-black text-[#1f2937] shadow-sm hover:bg-slate-50",
    dividerLine: "bg-slate-200",
    dividerText: "text-xs font-black uppercase text-[#748091]",
    formFieldLabel: "text-sm font-black text-[#1f2937]",
    formFieldInput:
      "h-14 rounded-xl border border-slate-200 bg-white px-4 text-base font-bold text-[#111827] shadow-sm focus:border-[#0067b1] focus:ring-[#0067b1]",
    formButtonPrimary:
      "h-14 rounded-xl bg-[#1f7ac1] text-base font-black text-white shadow-md hover:bg-[#0067b1]",
    footerActionText: "text-sm font-bold text-[#748091]",
    footerActionLink: "text-sm font-black text-[#0067b1] hover:text-[#123e95]",
    identityPreviewText: "font-bold text-[#111827]",
    formResendCodeLink: "font-black text-[#0067b1]",
  },
  variables: {
    colorPrimary: "#0067b1",
    colorText: "#111827",
    borderRadius: "0.85rem",
    fontFamily: "var(--font-geist-sans), Arial, sans-serif",
  },
};
