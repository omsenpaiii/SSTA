import { getSupabaseAdmin, isSupabaseAuthConfigured } from "@/lib/supabase";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getAdminEmails, getInitials, isAdminEmail, manualStudentKey, normalizeEmail } from "@/lib/auth-shared";
import { manualPhoneStudentKey, normalizeAustralianPhone } from "@/lib/phone";

export type AppUser = {
  id: string;
  email: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  initials: string;
};

type AuthUser = {
  id: string;
  email?: string | null;
  phone?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

function deriveNames(user: AuthUser) {
  const metadata = user.user_metadata ?? {};
  const fullName =
    typeof metadata.full_name === "string"
      ? metadata.full_name
      : typeof metadata.name === "string"
        ? metadata.name
        : null;
  const firstName =
    typeof metadata.first_name === "string"
      ? metadata.first_name
      : fullName?.split(/\s+/).filter(Boolean)[0] ?? null;
  const lastName =
    typeof metadata.last_name === "string"
      ? metadata.last_name
      : fullName
        ? fullName
            .split(/\s+/)
            .filter(Boolean)
            .slice(1)
            .join(" ") || null
        : null;

  return { firstName, lastName, fullName };
}

export async function getCurrentUser(): Promise<AppUser | null> {
  if (!isSupabaseAuthConfigured()) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email && !user?.phone) {
    return null;
  }

  const { firstName, lastName, fullName } = deriveNames(user);
  const email = normalizeEmail(user.email);
  const phone = normalizeAustralianPhone(user.phone) || null;
  const name = fullName ?? ([firstName, lastName].filter(Boolean).join(" ") || email.split("@")[0] || phone || "Student");
  const avatarUrl =
    typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null;

  return {
    id: user.id,
    email,
    name,
    firstName,
    lastName,
    phone,
    avatarUrl,
    initials: getInitials(name, email || phone || "Student"),
  };
}

export async function syncStudentProfileFromUser(user: AuthUser | null | undefined) {
  const supabase = getSupabaseAdmin();

  if (!supabase || (!user?.email && !user?.phone)) {
    return;
  }

  const email = normalizeEmail(user.email) || null;
  const phone = normalizeAustralianPhone(user.phone) || null;
  const userKey = user.id;
  const emailManualKey = email ? manualStudentKey(email) : null;
  const phoneManualKey = phone ? manualPhoneStudentKey(phone) : null;
  const { firstName, lastName } = deriveNames(user);
  const now = new Date().toISOString();

  const [{ data: realProfile }, { data: emailManualProfile }, { data: phoneManualProfile }, { data: phoneProfile }] = await Promise.all([
    supabase
      .from("student_profiles")
      .select("id,user_key,first_name,last_name,phone,email,origin")
      .eq("user_key", userKey)
      .maybeSingle(),
    emailManualKey ? supabase
      .from("student_profiles")
      .select("id,user_key,first_name,last_name,phone,email,origin")
      .eq("user_key", emailManualKey)
      .maybeSingle() : Promise.resolve({ data: null }),
    phoneManualKey ? supabase
      .from("student_profiles")
      .select("id,user_key,first_name,last_name,phone,email,origin")
      .eq("user_key", phoneManualKey)
      .maybeSingle() : Promise.resolve({ data: null }),
    phone ? supabase
      .from("student_profiles")
      .select("id,user_key,first_name,last_name,phone,email,origin")
      .eq("phone", phone)
      .limit(1)
      .maybeSingle() : Promise.resolve({ data: null }),
  ]);
  const manualProfile = [emailManualProfile, phoneManualProfile, phoneProfile]
    .find((profile) => profile && profile.user_key !== userKey) ?? null;
  const manualKey = manualProfile?.user_key ?? null;

  const mergedFirstName = realProfile?.first_name ?? manualProfile?.first_name ?? firstName ?? null;
  const mergedLastName = realProfile?.last_name ?? manualProfile?.last_name ?? lastName ?? null;
  const mergedPhone = realProfile?.phone ?? manualProfile?.phone ?? phone ?? null;

  if (manualProfile && manualKey) {
    if (realProfile) {
      await supabase
        .from("course_enrollments")
        .update({ user_key: userKey, updated_at: now })
        .eq("user_key", manualKey);
      await supabase
        .from("lesson_progress")
        .update({ user_key: userKey, updated_at: now })
        .eq("user_key", manualKey);
      await supabase
        .from("student_assignment_access")
        .update({ user_key: userKey, updated_at: now })
        .eq("user_key", manualKey);
      await supabase
        .from("assignment_submissions")
        .update({ user_key: userKey, updated_at: now })
        .eq("user_key", manualKey);
      await supabase.from("student_profiles").delete().eq("id", manualProfile.id);
    } else {
      await supabase
        .from("student_profiles")
        .update({
          user_key: userKey,
          email,
          first_name: mergedFirstName,
          last_name: mergedLastName,
          phone: mergedPhone,
          updated_at: now,
        })
        .eq("id", manualProfile.id);
      await supabase
        .from("course_enrollments")
        .update({ user_key: userKey, updated_at: now })
        .eq("user_key", manualKey);
      await supabase
        .from("lesson_progress")
        .update({ user_key: userKey, updated_at: now })
        .eq("user_key", manualKey);
      await supabase
        .from("student_assignment_access")
        .update({ user_key: userKey, updated_at: now })
        .eq("user_key", manualKey);
      await supabase
        .from("assignment_submissions")
        .update({ user_key: userKey, updated_at: now })
        .eq("user_key", manualKey);
    }
  }

  await supabase.from("student_profiles").upsert(
    {
      user_key: userKey,
      email,
      first_name: mergedFirstName,
      last_name: mergedLastName,
      phone: mergedPhone,
      origin: realProfile?.origin ?? manualProfile?.origin ?? "self_enrolled",
      updated_at: now,
    },
    { onConflict: "user_key" },
  );
}

export { getAdminEmails, getInitials, isAdminEmail, manualStudentKey, normalizeEmail };
