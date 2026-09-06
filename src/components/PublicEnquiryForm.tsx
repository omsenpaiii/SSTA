"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, FileUp, Loader2, ShieldCheck } from "lucide-react";
import { ReCaptchaField } from "@/components/ReCaptchaField";
import { courses as defaultCourses, type Course } from "@/lib/courses";

const MAX_DOCUMENTS = 5;
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

export function PublicEnquiryForm({ initialCourseSlug = "" }: { initialCourseSlug?: string }) {
  const [courses, setCourses] = useState<Course[]>(defaultCourses);
  const [courseSlug, setCourseSlug] = useState(initialCourseSlug);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaResetKey, setCaptchaResetKey] = useState(0);
  const [documents, setDocuments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/courses")
      .then((response) => response.json())
      .then((data: { courses?: Course[] }) => {
        if (Array.isArray(data.courses) && data.courses.length) setCourses(data.courses);
      })
      .catch(() => setCourses(defaultCourses));
  }, []);

  function handleFiles(files: FileList | null) {
    const next = Array.from(files ?? []);
    if (next.length > MAX_DOCUMENTS) {
      setError(`Choose no more than ${MAX_DOCUMENTS} documents.`);
      return;
    }
    const invalid = next.find((file) => !["application/pdf", "image/jpeg", "image/png"].includes(file.type) || file.size > MAX_DOCUMENT_SIZE);
    if (invalid) {
      setError("Documents must be PDF, JPG, or PNG files and 10 MB or smaller.");
      return;
    }
    setError("");
    setDocuments(next);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!captchaToken) {
      setError("Please confirm you are not a robot.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    formData.set("captchaToken", captchaToken);
    documents.forEach((document) => formData.append("documents", document));

    try {
      const response = await fetch("/api/interests", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to send your enquiry.");
      setSuccess(true);
      event.currentTarget.reset();
      setDocuments([]);
      setCourseSlug("");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to send your enquiry.");
      setCaptchaToken("");
      setCaptchaResetKey((current) => current + 1);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-8 text-center"><CheckCircle2 className="mx-auto text-emerald-600" size={46} /><h2 className="mt-4 text-2xl font-black text-[#020d24]">Enquiry received</h2><p className="mx-auto mt-3 max-w-lg font-bold leading-7 text-slate-600">Thank you. The SSTA team will contact you using the email or phone number you provided.</p></div>;
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[1.5rem] border border-[#18aee5]/20 bg-white p-6 shadow-[0_24px_70px_rgba(0,74,143,0.1)] sm:p-8">
      <div className="mb-7 flex items-start gap-3"><span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#eef8ff] text-[#0067b1]"><ShieldCheck size={22} /></span><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#0067b1]">Start with SSTA</p><h2 className="mt-1 text-2xl font-black text-[#020d24]">Tell us how we can help</h2><p className="mt-2 text-sm font-bold leading-6 text-[#53647c]">This is an enquiry only. Course access and the formal enrolment form remain available after the required payment step.</p></div></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" name="firstName" required />
        <Field label="Last name" name="lastName" required />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Email address" name="email" type="email" required />
        <Field label="Phone number" name="phone" type="tel" required />
      </div>
      <label className="mt-4 grid gap-2 text-sm font-black text-[#020d24]">Course you are interested in<select name="courseSlug" required value={courseSlug} onChange={(event) => setCourseSlug(event.target.value)} className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 font-bold outline-none focus:border-[#18aee5]"><option value="" disabled>Select a course</option>{courses.map((course) => <option key={course.slug} value={course.slug}>{course.title}</option>)}</select></label>
      <label className="mt-4 grid gap-2 text-sm font-black text-[#020d24]">How can we help? <span className="font-bold text-slate-500">(optional)</span><textarea name="message" maxLength={4000} rows={5} className="resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 font-semibold leading-6 outline-none focus:border-[#18aee5]" placeholder="Tell us about your training goals, questions, or availability." /></label>
      <label className="mt-4 grid gap-2 rounded-2xl border border-dashed border-[#18aee5]/35 bg-[#f8fcff] p-4 text-sm font-black text-[#020d24]">Supporting documents <span className="font-bold text-[#53647c]">Optional — PDF, JPG, or PNG; up to 5 files, 10 MB each.</span><span className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-3 py-2 text-[#0067b1] shadow-sm"><FileUp size={18} /> Choose files<input type="file" accept="application/pdf,image/jpeg,image/png" multiple className="sr-only" onChange={(event) => handleFiles(event.target.files)} /></span>{documents.length ? <span className="font-bold text-emerald-700">{documents.length} document{documents.length === 1 ? "" : "s"} ready: {documents.map((file) => file.name).join(", ")}</span> : null}</label>
      <div className="mt-5"><ReCaptchaField error="" onChange={setCaptchaToken} resetKey={captchaResetKey} /></div>
      {error ? <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</p> : null}
      <button type="submit" disabled={isSubmitting || !captchaToken} className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#0067b1] px-6 text-base font-black text-white shadow-[0_16px_35px_rgba(0,103,177,0.22)] transition hover:bg-[#123e95] disabled:cursor-wait disabled:opacity-60">{isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Sending enquiry…</> : "Send enquiry"}</button>
    </form>
  );
}

function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return <label className="grid gap-2 text-sm font-black text-[#020d24]">{label}<input name={name} type={type} required={required} className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 font-semibold outline-none focus:border-[#18aee5]" /></label>;
}
