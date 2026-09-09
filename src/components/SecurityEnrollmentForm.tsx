"use client";
import Link from "next/link";
import { SecurityFlowDialog } from "@/components/SecurityFlowDialog";
import { useState } from "react";
import { ReCaptchaField } from "@/components/ReCaptchaField";

export function SecurityEnrollmentForm({ email = "" }: { email?: string }) {
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showNextStep, setShowNextStep] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [captchaVersion, setCaptchaVersion] = useState(0);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    data.set("captchaToken", captcha ?? "");
    try {
      const response = await fetch("/api/security/enrollment", {
        method: "POST",
        body: data,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to submit.");
      setSubmitted(true);
      setShowNextStep(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit.");
      setCaptcha(null);
      setCaptchaVersion((value) => value + 1);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black">
          1. Download and complete your enrollment form
        </h2>
        <p className="my-3 text-slate-600">
          Download the free Word form, fill in your details, save it, then
          upload your completed copy below. Enrollment and the Security LLN test
          are free.
        </p>
        <a
          href="/forms/security-enrollment.docx"
          download
          className="inline-flex rounded-xl bg-[#0067b1] px-5 py-3 font-bold text-white"
        >
          Download Word enrollment form
        </a>
        <p className="mt-4 text-sm text-slate-600">
          Already submitted?{" "}
          <Link
            className="font-bold text-[#0067b1] underline"
            href="/lln/security"
          >
            Take the free Security LLN test
          </Link>
        </p>
      </section>
      <form
        onSubmit={submit}
        className="space-y-5 rounded-2xl border border-sky-100 bg-white p-6 shadow-sm"
      >
        <h2 className="text-xl font-black">
          2. Submit your details and completed form
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["firstName", "First name", "text"],
            ["lastName", "Last name", "text"],
            ["email", "Email", "email"],
            ["phone", "Phone number", "tel"],
          ].map(([name, label, type]) => (
            <label key={name} className="grid gap-2 font-bold">
              {label}
              <input
                name={name}
                type={type}
                required
                maxLength={name === "email" ? 254 : 100}
                defaultValue={name === "email" ? email : undefined}
                readOnly={name === "email" && Boolean(email)}
                className="h-12 rounded-lg border border-slate-300 px-3 font-normal"
              />
            </label>
          ))}
        </div>
        <label className="grid gap-2 font-bold">
          Residential address
          <textarea
            name="address"
            required
            minLength={10}
            maxLength={1000}
            rows={3}
            className="min-w-0 w-full rounded-lg border border-slate-300 p-3 font-normal"
          />
        </label>
        <label className="grid gap-2 font-bold">
          Completed Word form (.docx, maximum 4 MB)
          <input
            name="document"
            type="file"
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            required
            className="min-w-0 w-full rounded-lg border border-slate-300 p-3 font-normal"
          />
        </label>
        <p className="text-sm text-slate-600">
          SSTA staff can review and download your form. Use this email when
          creating your student account, and continue in this browser to keep
          your LLN result linked.
        </p>
        <ReCaptchaField key={captchaVersion} onChange={setCaptcha} />
        {error && (
          <p role="alert" className="text-red-700">
            {error}
          </p>
        )}
        <button
          disabled={busy || !captcha || submitted}
          className="rounded-xl bg-[#0067b1] px-6 py-3 font-bold text-white disabled:opacity-50"
        >
          {busy
            ? "Submitting…"
            : submitted
              ? "Form submitted"
              : "Submit free enrollment form"}
        </button>
      </form>
      {showNextStep && (
        <SecurityFlowDialog
          titleId="enrollment-success"
          onClose={() => setShowNextStep(false)}
        >
          <h2 id="enrollment-success" className="text-2xl font-black">
            Your enrollment form is submitted!
          </h2>
          <p className="my-5 text-slate-600">
            Now complete your free Security LLN test. After passing, visit your
            student portal. Pay AUD $150 when you are ready to start Cluster 1.
          </p>
          <Link
            autoFocus
            href="/lln/security"
            className="inline-flex rounded-xl bg-[#0067b1] px-5 py-3 font-bold text-white"
          >
            Start free Security LLN
          </Link>
          <button
            type="button"
            onClick={() => setShowNextStep(false)}
            className="ml-4 underline"
          >
            Close
          </button>
        </SecurityFlowDialog>
      )}
    </div>
  );
}
