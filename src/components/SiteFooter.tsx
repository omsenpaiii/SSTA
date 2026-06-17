import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { courseMenu, primaryLinks, siteInfo } from "@/lib/site-content";

export function SiteFooter() {
  return (
    <footer className="bg-[#020d24] px-5 py-16 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_0.8fr_1fr_0.8fr]">
          <div>
            <Link href="/" className="flex items-center gap-4">
              <span className="relative block size-20 overflow-hidden rounded-full bg-white p-1">
                <Image
                  src="/ssta.jpg"
                  alt="SSTA logo"
                  fill
                  sizes="80px"
                  className="scale-[1.12] object-contain object-[56%_50%]"
                />
              </span>
              <span>
                <span className="block text-xl font-black">{siteInfo.name}</span>
                {siteInfo.rto ? (
                  <span className="text-sm font-bold text-[#18aee5]">{siteInfo.rto}</span>
                ) : null}
              </span>
            </Link>

            <div className="mt-6 grid gap-3 text-sm font-bold text-sky-100/75">
              <a href={`mailto:${siteInfo.email}`} className="flex items-start gap-3">
                <Mail className="mt-0.5 text-[#18aee5]" size={18} />
                {siteInfo.email}
              </a>
              <a href={siteInfo.phoneHref} className="flex items-start gap-3">
                <Phone className="mt-0.5 text-[#f5b800]" size={18} />
                {siteInfo.phone}
              </a>
              <p className="flex items-start gap-3">
                <MapPin className="mt-0.5 text-[#18aee5]" size={18} />
                {siteInfo.address}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.22em] text-[#f5b800]">
              Quick Links
            </h2>
            <div className="mt-5 grid gap-3">
              {primaryLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm font-bold text-sky-100/75 hover:text-white">
                  {link.label}
                </Link>
              ))}
              <Link href="/enroll" className="text-sm font-bold text-sky-100/75 hover:text-white">
                Enrol Now
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.22em] text-[#f5b800]">
              Courses
            </h2>
            <div className="mt-5 grid gap-3">
              {courseMenu.map((category) => (
                <Link
                  key={category.slug}
                  href={`/${category.slug}`}
                  className="text-sm font-bold text-sky-100/75 hover:text-white"
                >
                  {category.title}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-black uppercase tracking-[0.22em] text-[#f5b800]">
              Student Access
            </h2>
            <p className="mt-5 text-sm font-bold leading-7 text-sky-100/70">
              Explore accredited training, additional pathway courses, and contact-first options with guidance from the SSTA team.
            </p>
            <Link
              href="/courses"
              className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-[#0067b1] transition hover:bg-[#eef8ff]"
            >
              View Courses
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-8 text-xs font-bold text-sky-100/45 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright {new Date().getFullYear()} SSTA. All rights reserved.</p>
          <p>Knowledge is power.</p>
        </div>
      </div>
    </footer>
  );
}
