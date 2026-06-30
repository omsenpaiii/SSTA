import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { siteInfo } from "@/lib/site-content";

export default function ContactPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
      <section className="rounded-[32px] border border-[#dce8f3] bg-white p-7 shadow-[0_18px_50px_rgba(12,50,88,0.08)]">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#0f6eb8]">Contact</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-[#081221]">
          Reach the SSTA team when you need a hand.
        </h2>
        <p className="mt-3 max-w-3xl text-base font-semibold leading-7 text-[#5d7389]">
          Use the details below for course support, scheduling questions, access issues, or student guidance.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { label: "Email", value: siteInfo.email, href: `mailto:${siteInfo.email}`, icon: Mail },
            { label: "Phone", value: siteInfo.phone, href: siteInfo.phoneHref, icon: Phone },
            { label: "Campus", value: siteInfo.address, href: "/contact", icon: MapPin },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-[24px] border border-[#e1edf6] bg-[#fbfdff] p-5"
            >
              <div className="flex size-11 items-center justify-center rounded-2xl bg-[#eef5fb] text-[#0f6eb8]">
                <item.icon size={20} />
              </div>
              <p className="mt-4 text-sm font-black uppercase tracking-[0.16em] text-[#7f92a5]">
                {item.label}
              </p>
              <p className="mt-2 text-base font-black text-[#081221]">{item.value}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <article className="rounded-[32px] border border-[#dce8f3] bg-white p-7 shadow-[0_18px_50px_rgba(12,50,88,0.08)]">
          <h3 className="text-2xl font-black tracking-tight text-[#081221]">Best reasons to contact us</h3>
          <div className="mt-5 grid gap-3">
            {[
              "Trouble opening a course or resource",
              "Need help understanding the next activity",
              "Questions about enrolment or verification",
              "Support with scheduling or practical training requirements",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-[#e1edf6] bg-[#fbfdff] px-4 py-3 text-sm font-black text-[#081221]"
              >
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[32px] border border-[#dce8f3] bg-white p-7 shadow-[0_18px_50px_rgba(12,50,88,0.08)]">
          <h3 className="text-2xl font-black tracking-tight text-[#081221]">Need the public contact page?</h3>
          <p className="mt-3 text-sm font-semibold leading-6 text-[#5d7389]">
            If you want the broader website contact page with extra academy context, you can open it directly from here.
          </p>
          <Link
            href="/contact"
            className="mt-5 inline-flex rounded-full bg-[#0f6eb8] px-5 py-3 text-sm font-black text-white"
          >
            Open public contact page
          </Link>
        </article>
      </section>
    </div>
  );
}
