"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getAppUrl } from "@/lib/app-url";
import { getCurrentUser, isAdminEmail, syncStudentProfileFromUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export type AuthFormState = {
  error?: string;
  success?: string;
};

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[a-zA-Z]/, "Password must include a letter.")
  .regex(/[0-9]/, "Password must include a number.");

const signInSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
  redirectUrl: z.string().trim().optional(),
});

const signUpSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name."),
  lastName: z.string().trim().min(1, "Enter your last name."),
  email: z.email("Enter a valid email address."),
  phone: z.string().trim().optional(),
  password: passwordSchema,
  redirectUrl: z.string().trim().optional(),
});

const emailSchema = z.object({
  email: z.email("Enter a valid email address."),
});

const resetSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

function getNextPath(rawRedirect: string | null | undefined, fallback = "/dashboard") {
  const value = rawRedirect?.trim();
  if (!value || !value.startsWith("/")) {
    return fallback;
  }
  return value;
}

function getPostAuthDestination(email: string, redirectUrl?: string | null) {
  if (redirectUrl && redirectUrl.startsWith("/")) {
    return redirectUrl;
  }

  return isAdminEmail(email) ? "/admin" : "/dashboard";
}

export async function signInWithPassword(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    redirectUrl: formData.get("redirectUrl"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Unable to sign in." };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  await syncStudentProfileFromUser(data.user);
  redirect(getPostAuthDestination(parsed.data.email, parsed.data.redirectUrl));
}

export async function signUpWithPassword(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    redirectUrl: formData.get("redirectUrl"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Unable to create account." };
  }

  const nextPath = getNextPath(parsed.data.redirectUrl);
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        full_name: `${parsed.data.firstName} ${parsed.data.lastName}`.trim(),
        phone: parsed.data.phone || undefined,
      },
      emailRedirectTo: `${getAppUrl()}/auth/callback?next=${encodeURIComponent(nextPath)}`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    await syncStudentProfileFromUser(data.user);
  }

  if (data.session?.user?.email) {
    redirect(getPostAuthDestination(data.session.user.email, parsed.data.redirectUrl));
  }

  return {
    success: "Check your email to confirm your account and finish signing in.",
  };
}

export async function requestPasswordReset(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Unable to send reset link." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getAppUrl()}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: "Password reset link sent. Check your inbox and follow the secure link.",
  };
}

export async function updatePassword(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = resetSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Unable to reset password." };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { error: "Your recovery session has expired. Request a new reset link." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { error: error.message };
  }

  return { success: "Password updated. You can continue with your new credentials." };
}
