"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone, ShieldCheck, Loader2 } from "lucide-react";
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
    <label className="grid gap-1.5 text-sm font-bold tracking-wide text-slate-700">
      <span>{label}</span>
      <span className="group flex h-14 items-center rounded-2xl border border-slate-200 bg-white px-5 shadow-[0_4px_16px_rgba(15,23,42,0.02)] transition-all duration-200 focus-within:border-[#1f7ac1] focus-within:ring-4 focus-within:ring-[#1f7ac1]/10 hover:border-slate-300">
        <Icon size={20} className="mr-4 shrink-0 text-slate-400 transition-colors duration-200 group-focus-within:text-[#1f7ac1]" />
        <input
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="h-full w-full bg-transparent text-[1.05rem] font-semibold text-[#111827] outline-none placeholder:text-slate-400 placeholder:font-normal"
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
  aside,
}: {
  label?: string;
  name?: string;
  placeholder?: string;
  autoComplete?: string;
  aside?: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  const inputField = (
    <span className="group flex h-14 items-center rounded-2xl border border-slate-200 bg-white px-5 shadow-[0_4px_16px_rgba(15,23,42,0.02)] transition-all duration-200 focus-within:border-[#1f7ac1] focus-within:ring-4 focus-within:ring-[#1f7ac1]/10 hover:border-slate-300">
      <Lock size={20} className="mr-4 shrink-0 text-slate-400 transition-colors duration-200 group-focus-within:text-[#1f7ac1]" />
      <input
        name={name}
        type={visible ? "text" : "password"}
        required
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-full w-full bg-transparent text-[1.05rem] font-semibold text-[#111827] outline-none placeholder:text-slate-400 placeholder:font-normal"
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="ml-3 text-slate-400 transition-colors duration-200 hover:text-[#1f7ac1] focus:outline-none"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </span>
  );

  if (label) {
    return (
      <label className="grid gap-1.5 text-sm font-bold tracking-wide text-slate-700">
        <span className="flex items-center justify-between gap-3">
          <span>{label}</span>
          {aside}
        </span>
        {inputField}
      </label>
    );
  }

  return inputField;
}

function GoogleButton({ redirectUrl, disabled }: { redirectUrl?: string; disabled?: boolean }) {
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
      href={disabled ? "#" : href}
      onClick={(e) => {
        if (disabled) e.preventDefault();
      }}
      className={`flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white text-base font-bold text-slate-700 shadow-[0_4px_16px_rgba(15,23,42,0.02)] transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:scale-[1.01] active:scale-[0.99] ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Continue with Google
    </Link>
  );
}

function Divider({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
      <span className="h-px flex-1 bg-slate-100" />
      {text}
      <span className="h-px flex-1 bg-slate-100" />
    </div>
  );
}

function SubmitButton({ label, loading }: { label: string; loading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="group flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#1f7ac1] text-base font-bold text-white shadow-[0_4px_20px_rgba(31,122,193,0.15)] transition-all duration-200 hover:bg-[#1a66a3] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-75 disabled:pointer-events-none"
    >
      {loading ? (
        <Loader2 size={20} className="animate-spin" />
      ) : (
        <>
          {label}
          <ArrowRight size={20} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </>
      )}
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
        <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/50 px-4 py-3.5 text-sm font-semibold text-rose-800 leading-normal">
          <span className="mt-0.5 shrink-0 text-rose-500">⚠</span>
          <div>{message}</div>
        </div>
      ) : null}
      {success ? (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-3.5 text-sm font-semibold text-emerald-800 leading-normal">
          <span className="mt-0.5 shrink-0 text-emerald-500">✓</span>
          <div>{success}</div>
        </div>
      ) : null}
    </>
  );
}

export function SignInForm({ redirectUrl, errorMessage }: SharedProps) {
  const [state, action, isPending] = useActionState(signInWithPassword, initialState);

  return (
    <div className="space-y-6">
      <GoogleButton redirectUrl={redirectUrl} disabled={isPending} />
      <Divider text="or sign in with email" />
      <form action={action} className="space-y-6 flex flex-col">
        <input type="hidden" name="redirectUrl" value={redirectUrl ?? ""} />
        <Message error={state.error} fallbackError={errorMessage} />
        <AuthTextField
          label="Email Address"
          name="email"
          type="email"
          placeholder="admin@ssta.com.au"
          icon={Mail}
          autoComplete="username"
          required
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          aside={
            <Link
              href="/forgot-password"
              className="text-sm font-bold text-[#1f7ac1] transition-colors hover:text-[#1a66a3]"
            >
              Forgot password?
            </Link>
          }
        />
        <SubmitButton label="Sign in" loading={isPending} />
      </form>
      <div className="border-t border-slate-100 pt-6 text-center text-sm font-semibold text-slate-500">
        Don&apos;t have an account?{" "}
        <Link
          href={redirectUrl ? `/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}` : "/sign-up"}
          className="font-bold text-[#1f7ac1] hover:text-[#1a66a3] transition-colors"
        >
          Create one
        </Link>
      </div>
    </div>
  );
}

export function SignUpForm({ redirectUrl, errorMessage }: SharedProps) {
  const [state, action, isPending] = useActionState(signUpWithPassword, initialState);

  return (
    <div className="space-y-6">
      <GoogleButton redirectUrl={redirectUrl} disabled={isPending} />
      <Divider text="or sign up with email" />
      <form action={action} className="space-y-6 flex flex-col">
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
          autoComplete="username"
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
        <PasswordField
          label="Password"
          placeholder="Create a password"
          autoComplete="new-password"
        />
        <SubmitButton label="Create account" loading={isPending} />
      </form>
      <div className="border-t border-slate-100 pt-6 text-center text-sm font-semibold text-slate-500">
        Already have an account?{" "}
        <Link
          href={redirectUrl ? `/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}` : "/sign-in"}
          className="font-bold text-[#1f7ac1] hover:text-[#1a66a3] transition-colors"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}

export function ForgotPasswordForm({ errorMessage }: { errorMessage?: string }) {
  const [state, action, isPending] = useActionState(requestPasswordReset, initialState);

  return (
    <form action={action} className="space-y-6 flex flex-col">
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
      <SubmitButton label="Send reset link" loading={isPending} />
      <div className="border-t border-slate-100 pt-6 text-center text-sm font-semibold text-slate-500">
        Remembered it?{" "}
        <Link href="/sign-in" className="font-bold text-[#1f7ac1] hover:text-[#1a66a3] transition-colors">
          Back to sign in
        </Link>
      </div>
    </form>
  );
}

export function ResetPasswordForm({ errorMessage }: { errorMessage?: string }) {
  const [state, action, isPending] = useActionState(updatePassword, initialState);

  return (
    <form action={action} className="space-y-6 flex flex-col">
      <Message error={state.error} success={state.success} fallbackError={errorMessage} />
      <PasswordField
        label="New Password"
        placeholder="Create your new password"
        autoComplete="new-password"
      />
      <PasswordField
        label="Confirm Password"
        name="confirmPassword"
        placeholder="Confirm your new password"
        autoComplete="new-password"
      />
      <SubmitButton label="Save new password" loading={isPending} />
      <div className="flex items-center justify-center gap-2 border-t border-slate-100 pt-6 text-xs font-semibold text-slate-500">
        <ShieldCheck size={16} className="text-[#1f7ac1]" />
        Recovery session required to save a new password.
      </div>
    </form>
  );
}
