import { z } from "zod";
import { getCourse } from "@/lib/courses";
import { getSupabaseAdmin } from "@/lib/supabase";

export const enrollmentSchema = z.object({
  firstName: z.string().trim().min(2, "First name is required"),
  lastName: z.string().trim().min(2, "Last name is required"),
  email: z.string().trim().email("Invalid email address"),
  phone: z.string().trim().min(10, "Phone number is required"),
  dob: z.string().trim().min(1, "Date of birth is required"),
  usi: z
    .string()
    .trim()
    .min(10, "USI must be exactly 10 characters")
    .max(10, "USI must be exactly 10 characters"),
  address: z.string().trim().min(10, "Please provide your full address"),
  courseId: z.string().trim().min(1, "Please select a course"),
});

export type EnrollmentInput = z.infer<typeof enrollmentSchema>;

export type EnrollmentLead = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  usi: string;
  address: string;
  course_slug: string;
  payment_status: "pending" | "paid" | "failed" | "cancelled";
  stripe_session_id: string | null;
  created_at: string;
};

export type EnrollmentPaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled";

const leadSelect =
  "id,first_name,last_name,email,phone,date_of_birth,usi,address,course_slug,payment_status,stripe_session_id,created_at";

export async function createEnrollmentLead(input: EnrollmentInput) {
  const course = getCourse(input.courseId);

  if (!course) {
    throw new Error("Selected course was not found.");
  }

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabase
    .from("enrollment_leads")
    .insert({
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      phone: input.phone,
      date_of_birth: input.dob,
      usi: input.usi.toUpperCase(),
      address: input.address,
      course_slug: course.slug,
      payment_status: "pending",
    })
    .select(leadSelect)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as EnrollmentLead;
}

export async function getEnrollmentLead(id: string) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("enrollment_leads")
    .select(leadSelect)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as EnrollmentLead | null;
}

export async function updateEnrollmentCheckoutSession(input: {
  enrollmentId: string;
  stripeSessionId: string;
}) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return { skipped: true };
  }

  const { error } = await supabase
    .from("enrollment_leads")
    .update({
      stripe_session_id: input.stripeSessionId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.enrollmentId);

  if (error) {
    throw new Error(error.message);
  }

  return { skipped: false };
}

export async function updateEnrollmentPaymentStatus(input: {
  enrollmentId: string;
  paymentStatus: EnrollmentPaymentStatus;
  stripeSessionId?: string | null;
  onlyIfCurrentSession?: boolean;
}) {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return { skipped: true };
  }

  const values: {
    payment_status: EnrollmentPaymentStatus;
    stripe_session_id?: string;
    updated_at: string;
  } = {
    payment_status: input.paymentStatus,
    updated_at: new Date().toISOString(),
  };

  if (input.stripeSessionId) {
    values.stripe_session_id = input.stripeSessionId;
  }

  let query = supabase
    .from("enrollment_leads")
    .update(values)
    .eq("id", input.enrollmentId);

  if (input.paymentStatus !== "paid") {
    query = query.neq("payment_status", "paid");
  }

  if (input.onlyIfCurrentSession && input.stripeSessionId) {
    query = query.eq("stripe_session_id", input.stripeSessionId);
  }

  const { error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return { skipped: false };
}
