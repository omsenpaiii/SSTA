"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone, ShieldCheck } from "lucide-react";
import { requestPasswordReset, signInWithPassword, signUpWithPassword, updatePassword, type AuthFormState } from "@/lib/auth-actions";

type SharedProps = {
  redirectUrl?: string;
  errorMessage?: string;
};

const initialState: AuthFormState = {};

function AuthTextField({
  label,
  name,
  type = "text",
  placeholder,
  icon: Icon,
  autoComplete,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  icon: typeof Mail;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-3 text-base font-black text-[#101827]">
      <span>{label}</span>
      <span className="flex h-16 items-center rounded-2xl border border-slate-200 bg-white px-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
        <Icon size={22} className="mr-4 shrink-0 text-[#8a97a9]" />
        <input
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="h-full w-full bg-transparent text-lg font-bold text-[#111827] outline-none placeholder:text-[#97a4b5]"
        />
      </span>
    </label>
  );
}

function PasswordField({
  label = "Password",
  name = "password",
  placeholder = "Enter your password",
  autoComplete,
}: {
  label?: string;
  name?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="grid gap-3 text-base font-black text-[#101827]">
      <span>{label}</span>
      <span className="flex h-16 items-center rounded-2xl border border-slate-200 bg-white px-5 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
        <Lock size={22} className="mr-4 shrink-0 text-[#8a97a9]" />
        <input
          name={name}
          type={visible ? "text" : "password"}
          required
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="h-full w-full bg-transparent text-lg font-bold text-[#111827] outline-none placeholder:text-[#97a4b5]"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="ml-3 text-[#7b8798]"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={22} /> : <Eye size={22} />}
        </button>
      </span>
    </label>
  );
}

function GoogleButton({ redirectUrl }: { redirectUrl?: string }) {
  const href = useMemo(() => {
    const params = new URLSearchParams();
    if (redirectUrl) {
      params.set("redirect_url", redirectUrl);
    }
    const query = params.toString();
    return `/auth/google${query ? `?${query}` : ""}`;
  }, [redirectUrl]);

  return (
    <Link
      href={href}
      className="flex h-16 items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white text-xl font-black text-[#1c2736] shadow-[0_10px_28px_rgba(15,23,42,0.05)] transition hover:bg-slate-50"
    >
      <span className="text-3xl leading-none text-[#4285f4]">G</span>
      Continue with Google
    </Link>
  );
}

function Divider({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.16em] text-[#97a4b5]">
      <span className="h-px flex-1 bg-slate-200" />
      {text}
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

function SubmitButton({ label }: { label: string }) {
  return (
    <button
      type="submit"
      className="flex h-16 items-center justify-center gap-3 rounded-2xl bg-[#1f7ac1] text-xl font-black text-white shadow-[0_14px_28px_rgba(0,103,177,0.26)] transition hover:bg-[#0067b1]"
    >
      {label}
      <ArrowRight size={22} />
    </button>
  );
}

function Message({
  error,
  success,
  fallbackError,
}: {
  error?: string;
  success?: string;
  fallbackError?: string;
}) {
  const message = error || fallbackError;

  return (
    <>
      {message ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {message}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          {success}
        </div>
      ) : null}
    </>
  );
}

export function SignInForm({ redirectUrl, errorMessage }: SharedProps) {
  const [state, action] = useActionState(signInWithPassword, initialState);

  return (
    <div className="space-y-7">
      <GoogleButton redirectUrl={redirectUrl} />
      <Divider text="or sign in with email" />
      <form action={action} className="space-y-5">
        <input type="hidden" name="redirectUrl" value={redirectUrl ?? ""} />
        <Message error={state.error} fallbackError={errorMessage} />
        <AuthTextField
          label="Email Address"
          name="email"
          type="email"
          placeholder="admin@ssta.com.au"
          icon={Mail}
          autoComplete="email"
          required
        />
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-base font-black text-[#101827]">Password</span>
            <Link href="/forgot-password" className="text-sm font-black text-[#1f7ac1]">
              Forgot password?
            </Link>
          </div>
          <PasswordField autoComplete="current-password" />
        </div>
        <SubmitButton label="Sign in to Dashboard" />
      </form>
      <div className="border-t border-slate-200 pt-7 text-center text-base font-bold text-[#748091]">
        Don&apos;t have an account?{" "}
        <Link
          href={redirectUrl ? `/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}` : "/sign-up"}
          className="font-black text-[#0067b1]"
        >
          Create one
        </Link>
      </div>
    </div>
  );
}

export function SignUpForm({ redirectUrl, errorMessage }: SharedProps) {
  const [state, action] = useActionState(signUpWithPassword, initialState);

  return (
    <div className="space-y-7">
      <GoogleButton redirectUrl={redirectUrl} />
      <Divider text="or sign up with email" />
      <form action={action} className="space-y-5">
        <input type="hidden" name="redirectUrl" value={redirectUrl ?? ""} />
        <Message error={state.error} success={state.success} fallbackError={errorMessage} />
        <div className="grid gap-5 md:grid-cols-2">
          <AuthTextField
            label="First Name"
            name="firstName"
            placeholder="Om"
            icon={User}
            autoComplete="given-name"
            required
          />
          <AuthTextField
            label="Last Name"
            name="lastName"
            placeholder="Tomar"
            icon={User}
            autoComplete="family-name"
            required
          />
        </div>
        <AuthTextField
          label="Email Address"
          name="email"
          type="email"
          placeholder="you@ssta.net.au"
          icon={Mail}
          autoComplete="email"
          required
        />
        <AuthTextField
          label="Phone Number"
          name="phone"
          type="tel"
          placeholder="+61 400 000 000"
          icon={Phone}
          autoComplete="tel"
        />
        <PasswordField placeholder="Create a strong password" autoComplete="new-password" />
        <SubmitButton label="Create Account" />
      </form>
      <div className="border-t border-slate-200 pt-7 text-center text-base font-bold text-[#748091]">
        Already have an account?{" "}
        <Link
          href={redirectUrl ? `/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}` : "/sign-in"}
          className="font-black text-[#0067b1]"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

export function ForgotPasswordForm({ errorMessage }: { errorMessage?: string }) {
  const [state, action] = useActionState(requestPasswordReset, initialState);

  return (
    <form action={action} className="space-y-5">
      <Message error={state.error} success={state.success} fallbackError={errorMessage} />
      <AuthTextField
        label="Email Address"
        name="email"
        type="email"
        placeholder="Enter your SSTA email"
        icon={Mail}
        autoComplete="email"
        required
      />
      <SubmitButton label="Send Reset Link" />
      <div className="border-t border-slate-200 pt-7 text-center text-base font-bold text-[#748091]">
        Remembered it? <Link href="/sign-in" className="font-black text-[#0067b1]">Back to sign in</Link>
      </div>
    </form>
  );
}

export function ResetPasswordForm({ errorMessage }: { errorMessage?: string }) {
  const [state, action] = useActionState(updatePassword, initialState);

  return (
    <form action={action} className="space-y-5">
      <Message error={state.error} success={state.success} fallbackError={errorMessage} />
      <PasswordField label="New Password" placeholder="Enter your new password" autoComplete="new-password" />
      <PasswordField
        label="Confirm Password"
        name="confirmPassword"
        placeholder="Re-enter your new password"
        autoComplete="new-password"
      />
      <SubmitButton label="Update Password" />
      <div className="flex items-center justify-center gap-2 border-t border-slate-200 pt-7 text-sm font-bold text-[#748091]">
        <ShieldCheck size={16} className="text-[#1f7ac1]" />
        Recovery session required to save a new password.
      </div>
    </form>
  );
}
