"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Loader2, PhoneCall, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStartTodayDisplay, isCourseAvailableForEnrollment, type Course } from "@/lib/courses";

const formSchema = z.object({
  courseId: z.string().min(1, "Please select a course"), firstName: z.string().trim().min(2, "First name is required"),
  lastName: z.string().trim().min(2, "Last name is required"), email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().min(8, "Phone number is required"), referredBy: z.string().trim().max(120).optional(),
});
type FormValues = z.infer<typeof formSchema>;
type Props = { initialCourseSlug?: string; courses: Course[]; initialValues?: Partial<FormValues> };

export function EnrollmentForm({ initialCourseSlug = "", courses, initialValues = {} }: Props) {
  const available = courses.filter(isCourseAvailableForEnrollment);
  const initialCourse = available.some((course) => course.slug === initialCourseSlug) ? initialCourseSlug : "";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: {
    courseId: initialCourse, firstName: initialValues.firstName ?? "", lastName: initialValues.lastName ?? "",
    email: initialValues.email ?? "", phone: initialValues.phone ?? "", referredBy: initialValues.referredBy ?? "",
  }});
  const courseId = useWatch({ control, name: "courseId" });
  const selected = available.find((course) => course.slug === courseId);

  async function submit(data: FormValues) {
    setIsSubmitting(true); setSubmitError(null);
    try {
      const leadResponse = await fetch("/api/enrollments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const lead = await leadResponse.json() as { enrollmentId?: string; courseSlug?: string; error?: string };
      if (!leadResponse.ok || !lead.enrollmentId) {
        if (leadResponse.status === 401) { const back = `/enroll?course=${encodeURIComponent(data.courseId)}`; window.location.assign(`/sign-in?redirect_url=${encodeURIComponent(back)}`); return; }
        throw new Error(lead.error ?? "Unable to save your details.");
      }
      const checkoutResponse = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseSlug: lead.courseSlug ?? data.courseId, enrollmentId: lead.enrollmentId }) });
      const checkout = await checkoutResponse.json() as { url?: string; error?: string; signInUrl?: string; courseUrl?: string };
      if (!checkoutResponse.ok || !checkout.url) {
        if (checkout.courseUrl) return void window.location.assign(checkout.courseUrl);
        if (checkout.signInUrl) return void window.location.assign(checkout.signInUrl);
        throw new Error(checkout.error ?? "Unable to start secure payment.");
      }
      window.location.assign(checkout.url);
    } catch (error) { setSubmitError(error instanceof Error ? error.message : "Unable to continue."); setIsSubmitting(false); }
  }

  const fields: Array<["firstName" | "lastName" | "email" | "phone", string]> = [["firstName", "First name"], ["lastName", "Last name"], ["email", "Email address"], ["phone", "Phone number"]];
  return (
    <form onSubmit={handleSubmit(submit)} className="mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
      <div className="bg-[#001633] px-6 py-7 text-white sm:px-9"><p className="text-xs font-black uppercase tracking-[0.2em] text-[#f7b500]">Start today</p><h2 className="mt-2 text-2xl font-black sm:text-3xl">Choose your course and pay $150</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">Only your contact details are needed now. After payment, complete the full enrolment application and our team will contact you.</p></div>
      <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-9">
        <div className="sm:col-span-2"><Label>Course</Label><Select value={courseId ?? ""} onValueChange={(value) => setValue("courseId", value ?? "", { shouldValidate: true })}><SelectTrigger className="mt-2 h-12"><SelectValue placeholder="Select a course" /></SelectTrigger><SelectContent>{available.map((course) => <SelectItem key={course.slug} value={course.slug}>{course.title} — {getStartTodayDisplay(course)}</SelectItem>)}</SelectContent></Select>{errors.courseId && <p className="mt-1 text-sm text-red-600">{errors.courseId.message}</p>}</div>
        {fields.map(([name, label]) => <div key={name}><Label htmlFor={name}>{label}</Label><Input id={name} type={name === "email" ? "email" : "text"} className="mt-2 h-12" {...register(name)} />{errors[name] && <p className="mt-1 text-sm text-red-600">{errors[name]?.message}</p>}</div>)}
        <div className="sm:col-span-2"><Label htmlFor="referredBy">Referred by (optional)</Label><Input id="referredBy" className="mt-2 h-12" {...register("referredBy")} /></div>
        {selected && <div className="sm:col-span-2 flex items-center justify-between rounded-2xl bg-blue-50 p-4"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Due today</p><p className="text-2xl font-black text-[#001633]">AUD $150</p></div><ShieldCheck className="size-8 text-[#0874c9]" /></div>}
        {submitError && <p className="sm:col-span-2 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{submitError}</p>}
        <div className="sm:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><a href="tel:+61431696558" className="inline-flex items-center gap-2 text-sm font-bold text-[#0067b1]"><PhoneCall className="size-4" />Questions? Call Joseph: +61 431 696 558</a><Button type="submit" disabled={isSubmitting} className="h-12 rounded-xl bg-[#0874c9] px-7 font-black hover:bg-[#005f9f]">{isSubmitting ? <><Loader2 className="mr-2 size-4 animate-spin" />Opening payment</> : <>Pay $150 securely<ArrowRight className="ml-2 size-4" /></>}</Button></div>
      </div>
    </form>
  );
}
