"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import type { Course } from "@/lib/courses";
import type { EnrollmentApplicationRecord } from "@/lib/enrollment-application";

type Prefill = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  usi: string;
};

function Field({ label, name, required = false, type = "text", defaultValue = "", placeholder = "" }: { label: string; name: string; required?: boolean; type?: string; defaultValue?: string; placeholder?: string }) {
  return <label className="grid gap-2 text-sm font-black text-[#081221]"><span>{label}{required ? " *" : ""}</span><input name={name} type={type} required={required} defaultValue={defaultValue} placeholder={placeholder} className="h-12 rounded-xl border border-slate-200 bg-white px-4 font-semibold outline-none focus:border-[#0f6eb8] focus:ring-2 focus:ring-[#0f6eb8]/15" /></label>;
}

function SelectField({ label, name, options, defaultValue = "", required = true }: { label: string; name: string; options: Array<[string, string]>; defaultValue?: string; required?: boolean }) {
  return <label className="grid gap-2 text-sm font-black text-[#081221]"><span>{label}{required ? " *" : ""}</span><select name={name} required={required} defaultValue={defaultValue} className="h-12 rounded-xl border border-slate-200 bg-white px-4 font-semibold outline-none focus:border-[#0f6eb8] focus:ring-2 focus:ring-[#0f6eb8]/15"><option value="">Select an option</option>{options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>;
}

export function EnrollmentApplicationForm({ course, prefill, existing }: { course: Course; prefill: Prefill; existing: EnrollmentApplicationRecord | null }) {
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const values = existing?.application_data ?? {};
  const value = (key: string) => String((values as Record<string, unknown>)[key] ?? "");

  async function submit(formData: FormData) {
    setSubmitting(true);
    setNotice(null);
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch("/api/enrollment-application", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, courseSlug: course.slug, studentDeclaration: formData.get("studentDeclaration") === "on" }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setNotice({ type: "error", text: result.error ?? "Unable to submit your application." });
      setSubmitting(false);
      return;
    }
    setNotice({ type: "success", text: "Application submitted. The SSTA team will review it and contact you by phone or email." });
    setSubmitting(false);
  }

  return <form action={submit} className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(0,74,143,0.1)]">
    <div className="bg-[#062846] px-6 py-7 text-white sm:px-9"><p className="text-xs font-black uppercase tracking-[0.18em] text-sky-200">Full application for enrolment</p><h2 className="mt-2 text-3xl font-black">{course.title}</h2><p className="mt-3 max-w-3xl font-semibold leading-7 text-white/75">Complete this after your initial payment. Required fields are marked with an asterisk; LLN support is available but is not a payment prerequisite.</p></div>
    {existing ? <div className={`mx-6 mt-6 rounded-2xl border px-5 py-4 text-sm font-bold sm:mx-9 ${existing.status === "approved" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : existing.status === "changes_requested" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-blue-200 bg-blue-50 text-blue-900"}`}>Status: {existing.status.replaceAll("_", " ")}{existing.reviewer_notes ? ` — ${existing.reviewer_notes}` : ""}</div> : null}
    <div className="grid gap-8 p-6 sm:p-9">
      <section><h3 className="text-xl font-black">Student details</h3><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Legal given name" name="firstName" required defaultValue={prefill.firstName} /><Field label="Legal family name" name="lastName" required defaultValue={prefill.lastName} /><Field label="Email" name="email" type="email" required defaultValue={prefill.email} /><Field label="Mobile" name="phone" type="tel" required defaultValue={prefill.phone} /><Field label="Date of birth" name="dob" type="date" required defaultValue={prefill.dob} /><Field label="Preferred course start date" name="preferredStartDate" type="date" defaultValue={value("preferredStartDate")} /><SelectField label="Gender" name="gender" defaultValue={value("gender")} options={[["male","Male"],["female","Female"],["other","Other"],["prefer_not_to_say","Prefer not to say"]]} /><Field label="Town of birth" name="townOfBirth" required defaultValue={value("townOfBirth")} /><Field label="Country of birth" name="countryOfBirth" required defaultValue={value("countryOfBirth")} /><Field label="Nationality" name="nationality" required defaultValue={value("nationality")} /><Field label="Passport number (if applicable)" name="passportNumber" defaultValue={value("passportNumber")} /><Field label="Visa number (if applicable)" name="visaNumber" defaultValue={value("visaNumber")} /></div><label className="mt-4 grid gap-2 text-sm font-black"><span>Residential/postal address</span><textarea name="postalAddress" defaultValue={value("postalAddress") || prefill.address} className="min-h-24 rounded-xl border border-slate-200 p-4 font-semibold" /></label></section>
      <section><h3 className="text-xl font-black">Emergency contact</h3><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Contact name" name="emergencyName" required defaultValue={value("emergencyName")} /><Field label="Phone number" name="emergencyPhone" required defaultValue={value("emergencyPhone")} /><Field label="Relationship" name="emergencyRelationship" required defaultValue={value("emergencyRelationship")} /><Field label="Address (optional)" name="emergencyAddress" defaultValue={value("emergencyAddress")} /></div></section>
      <section><h3 className="text-xl font-black">Language, culture and support</h3><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Language spoken at home" name="homeLanguage" required defaultValue={value("homeLanguage")} /><SelectField label="English proficiency" name="englishProficiency" defaultValue={value("englishProficiency")} options={[["very_well","Very well"],["well","Well"],["not_well","Not well"],["not_at_all","Not at all"]]} /><SelectField label="Aboriginal or Torres Strait Islander origin" name="indigenousStatus" defaultValue={value("indigenousStatus")} options={[["no","No"],["aboriginal","Aboriginal"],["torres_strait_islander","Torres Strait Islander"],["both","Both"],["prefer_not_to_say","Prefer not to say"]]} /><SelectField label="Disability, impairment or long-term condition?" name="disabilityStatus" defaultValue={value("disabilityStatus")} options={[["no","No"],["yes","Yes — I may need support"],["prefer_not_to_say","Prefer not to say"]]} /><Field label="Accessibility/support details (optional)" name="disabilityDetails" defaultValue={value("disabilityDetails")} /><SelectField label="Would you like LLN assistance?" name="needsLlnAssistance" defaultValue={value("needsLlnAssistance")} options={[["yes","Yes"],["no","No"],["unsure","Unsure — contact me"]]} /></div></section>
      <section><h3 className="text-xl font-black">Education and employment</h3><div className="mt-4 grid gap-4 sm:grid-cols-2"><Field label="Highest completed school level" name="highestSchoolLevel" required defaultValue={value("highestSchoolLevel")} /><Field label="School completion year" name="schoolCompletionYear" defaultValue={value("schoolCompletionYear")} /><Field label="Highest qualification achieved" name="highestQualification" required defaultValue={value("highestQualification")} /><Field label="Qualification year" name="qualificationYear" defaultValue={value("qualificationYear")} /><Field label="Country qualification issued" name="qualificationCountry" defaultValue={value("qualificationCountry")} /><Field label="English test details (if applicable)" name="englishTestDetails" defaultValue={value("englishTestDetails")} /><SelectField label="Seeking credit transfer or RPL?" name="seekingCreditTransfer" defaultValue={value("seekingCreditTransfer")} options={[["yes","Yes"],["no","No"],["unsure","Unsure"]]} /><Field label="Current employment status" name="employmentStatus" required defaultValue={value("employmentStatus")} /><Field label="Main reason for undertaking this course" name="studyReason" required defaultValue={value("studyReason")} /><Field label="USI" name="usi" required defaultValue={value("usi") || prefill.usi} placeholder="10 character USI" /><Field label="Education agent/referrer (optional)" name="agentName" defaultValue={value("agentName")} /></div></section>
      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5"><label className="flex items-start gap-3 text-sm font-bold leading-6 text-blue-950"><input type="checkbox" name="studentDeclaration" required defaultChecked={existing?.student_declaration} className="mt-1 size-5" /><span>I declare that the information provided is true and correct, consent to SSTA collecting and using it for enrolment, training, regulatory and student-support purposes, and understand that SSTA may contact me for supporting documents.</span></label></section>
      {notice ? <div className={`rounded-2xl border px-5 py-4 text-sm font-bold ${notice.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>{notice.text}</div> : null}
      <button type="submit" disabled={submitting || existing?.status === "approved"} className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#0067b1] px-8 font-black text-white disabled:cursor-not-allowed disabled:opacity-60">{submitting ? <Loader2 className="animate-spin" size={19} /> : existing?.status === "approved" ? <CheckCircle2 size={19} /> : <Send size={19} />}{submitting ? "Submitting..." : existing?.status === "approved" ? "Application approved" : "Submit application"}</button>
    </div>
  </form>;
}
