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
    {
      heading: mode === "sign-in" ? "Student Database" : "Student access",
      copy:
        mode === "sign-in"
          ? "Full enrolment and contact records"
          : "Course access and lesson records",
      icon: Users,
    },
    {
      heading: mode === "sign-in" ? "Course Management" : "Training programs",
      copy:
        mode === "sign-in"
          ? "Track training programs and modules"
          : "Structured lessons and admin-ready content",
      icon: GraduationCap,
    },
    {
      heading: mode === "sign-in" ? "Revenue Insights" : "Secure payments",
      copy:
        mode === "sign-in"
          ? "Payment tracking and reporting"
          : "Enrollment and reporting visibility",
      icon: LineChart,
    },
  ];

  return (
    <main className="grid min-h-screen bg-white text-[#101827] lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative hidden overflow-hidden bg-[#082647] px-10 py-14 text-white lg:block xl:px-16">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:68px_68px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(146,208,255,0.18),transparent_24%),linear-gradient(140deg,#0a2444_0%,#123f71_56%,#0a223e_100%)]" />
        <div className="relative z-10 flex h-full min-h-[760px] flex-col justify-between">
          <Link href="/" className="flex items-center gap-4">
            <span className="flex size-16 items-center justify-center rounded-3xl border border-white/18 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <ShieldCheck size={28} />
            </span>
            <span>
              <span className="block text-[2.15rem] font-black leading-none">SSTA</span>
              <span className="mt-1 block text-sm font-black uppercase tracking-[0.08em] text-white/58">
                {mode === "sign-in" ? "Admin Portal" : "Student Access"}
              </span>
            </span>
          </Link>

          <div className="max-w-2xl">
            <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/12 px-5 py-2.5 text-sm font-black text-white/82 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <span className="size-2 rounded-full bg-[#f5b800]" />
              {mode === "sign-in" ? "SECURE ADMIN ACCESS" : "CREATE SSTA ACCOUNT"}
            </div>
            <h1 className="max-w-[12ch] text-5xl font-black leading-[0.98] tracking-normal xl:text-[4.4rem]">
              {mode === "sign-in"
                ? "Manage your academy with confidence."
                : "Start your SSTA access with confidence."}
            </h1>
            <p className="mt-8 max-w-[28rem] text-xl font-medium leading-11 text-white/62">
              {mode === "sign-in"
                ? "Complete control over student enrolments, course management, and training operations in one secure dashboard."
                : "Use Google or email to access course enrolments, lessons, and your SSTA learning tools."}
            </p>
          </div>

          <div className="grid max-w-2xl gap-6">
            {featureRows.map(({ heading, copy, icon: Icon }) => (
              <div key={heading} className="grid grid-cols-[48px_1fr_24px] items-center gap-5">
                <span className="flex size-14 items-center justify-center rounded-2xl border border-white/12 bg-white/7 text-[#f5b800]">
                  <Icon size={22} />
                </span>
                <span>
                  <span className="block text-[1.05rem] font-black">{heading}</span>
                  <span className="block text-sm font-bold text-white/46">{copy}</span>
                </span>
                <ShieldCheck size={18} className="text-emerald-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-5 py-12 xl:px-10">
        <div className="w-full max-w-[640px]">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-5xl font-black tracking-normal text-[#111827]">{title}</h2>
            <p className="mt-4 text-[1.7rem] font-medium text-[#7d8999] lg:text-[1.9rem]">{subtitle}</p>
          </div>
          <div className="auth-card">{children}</div>
          <div className="mt-10 border-t border-slate-200 pt-8 text-center text-sm font-bold text-[#748091]">
            <ShieldCheck className="mr-2 inline-block align-[-4px]" size={18} />
            Protected by SSTA Security · v2.0
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
      "h-16 rounded-2xl border border-slate-200 bg-white text-lg font-black text-[#1f2937] shadow-[0_8px_24px_rgba(15,23,42,0.05)] hover:bg-slate-50",
    socialButtonsBlockButtonText: "text-lg font-black text-[#1f2937]",
    dividerLine: "bg-slate-200",
    dividerText: "text-xs font-black uppercase tracking-[0.14em] text-[#8a96a8]",
    formFieldLabel: "text-sm font-black text-[#111827]",
    formFieldInput:
      "h-16 rounded-2xl border border-slate-200 bg-white px-5 text-lg font-bold text-[#111827] shadow-[0_8px_24px_rgba(15,23,42,0.05)] focus:border-[#0067b1] focus:ring-[#0067b1]",
    formButtonPrimary:
      "h-16 rounded-2xl bg-[#1f7ac1] text-lg font-black text-white shadow-[0_10px_24px_rgba(0,103,177,0.28)] hover:bg-[#0067b1]",
    formFieldAction: "font-black text-[#1f7ac1] hover:text-[#0f5d9f]",
    formFieldHintText: "text-sm font-bold text-[#7d8999]",
    footerActionText: "text-sm font-bold text-[#748091]",
    footerActionLink: "text-sm font-black text-[#0067b1] hover:text-[#123e95]",
    identityPreviewText: "font-bold text-[#111827]",
    formResendCodeLink: "font-black text-[#0067b1]",
    otpCodeFieldInput:
      "h-16 rounded-2xl border border-slate-200 bg-white text-lg font-black text-[#111827] shadow-[0_8px_24px_rgba(15,23,42,0.05)]",
  },
  variables: {
    colorPrimary: "#0067b1",
    colorText: "#111827",
    colorBackground: "#f8fafc",
    colorInputBackground: "#ffffff",
    colorInputText: "#111827",
    borderRadius: "1rem",
    fontFamily: "var(--font-geist-sans), Arial, sans-serif",
  },
};
