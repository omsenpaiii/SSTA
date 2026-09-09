import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { AppUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { CPP20218_COURSE_SLUG } from "@/lib/cpp20218";

export const SECURITY_ENROLLMENT_BUCKET = "security-enrollments";
export const SECURITY_CLUSTER_ONE_AMOUNT = 15000;
const cookieName = "ssta_security_application";
export async function getSecurityGuest(create = false) {
  const jar = await cookies();
  let token = jar.get(cookieName)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    if (!create) return null;
    token = randomBytes(32).toString("hex");
    jar.set(cookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return `guest:${createHash("sha256").update(token).digest("hex")}`;
}

// A verified account and the submitting browser must both match before guest results move.
export async function linkSecurityEnrollment(user: AppUser) {
  const db = getSupabaseAdmin();
  if (!db) return;
  const guest = await getSecurityGuest();
  if (!guest) return;
  const { data: leads, error } = await db
    .from("enrollment_leads")
    .select("id,first_name,last_name,phone,address,security_user_key")
    .eq("security_guest_key", guest)
    .eq("email", user.email.toLowerCase())
    .eq("course_slug", CPP20218_COURSE_SLUG)
    .not("document_path", "is", null);
  if (error) throw error;
  const lead = leads?.find(
    (row) => !row.security_user_key,
  );
  if (!lead || lead.security_user_key === user.id) return;
  const results = await Promise.all([
    db
      .from("student_profiles")
      .upsert(
        {
          user_key: user.id,
          email: user.email,
          first_name: lead.first_name,
          last_name: lead.last_name,
          phone: lead.phone,
          residential_address: lead.address,
        },
        { onConflict: "user_key" },
      ),
    db
      .from("lln_attempts")
      .update({ user_key: user.id, email: user.email })
      .eq("user_key", guest)
      .eq("course_slug", CPP20218_COURSE_SLUG),
  ]);
  for (const result of results) if (result.error) throw result.error;
  // Ignore existing enrollment rows so a repeated visit cannot undo an admin decision or payment.
  const enrollment = await db
    .from("course_enrollments")
    .upsert(
      {
        user_key: user.id,
        course_slug: CPP20218_COURSE_SLUG,
        status: "active",
        amount_paid: 0,
        currency: "AUD",
        source: "self_enrolled",
      },
      { onConflict: "user_key,course_slug", ignoreDuplicates: true },
    );
  if (enrollment.error) throw enrollment.error;
  const linked = await db
    .from("enrollment_leads")
    .update({ security_user_key: user.id })
    .eq("id", lead.id);
  if (linked.error) throw linked.error;
}
