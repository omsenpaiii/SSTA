import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase";

export const enrollmentApplicationSchema = z.object({
  courseSlug: z.string().trim().min(1),
  firstName: z.string().trim().min(2),
  lastName: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().min(8),
  dob: z.string().trim().min(1, "Date of birth is required"),
  preferredStartDate: z.string().trim().optional().default(""),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
  townOfBirth: z.string().trim().min(2),
  countryOfBirth: z.string().trim().min(2),
  nationality: z.string().trim().min(2),
  passportNumber: z.string().trim().max(80).optional().default(""),
  visaNumber: z.string().trim().max(80).optional().default(""),
  postalAddress: z.string().trim().max(500).optional().default(""),
  emergencyName: z.string().trim().min(2),
  emergencyPhone: z.string().trim().min(8),
  emergencyRelationship: z.string().trim().min(2),
  emergencyAddress: z.string().trim().max(500).optional().default(""),
  homeLanguage: z.string().trim().min(2),
  englishProficiency: z.enum(["very_well", "well", "not_well", "not_at_all"]),
  indigenousStatus: z.enum(["no", "aboriginal", "torres_strait_islander", "both", "prefer_not_to_say"]),
  disabilityStatus: z.enum(["no", "yes", "prefer_not_to_say"]),
  disabilityDetails: z.string().trim().max(1000).optional().default(""),
  highestSchoolLevel: z.string().trim().min(1),
  schoolCompletionYear: z.string().trim().max(4).optional().default(""),
  highestQualification: z.string().trim().min(1),
  qualificationYear: z.string().trim().max(4).optional().default(""),
  qualificationCountry: z.string().trim().max(120).optional().default(""),
  englishTestDetails: z.string().trim().max(500).optional().default(""),
  needsLlnAssistance: z.enum(["yes", "no", "unsure"]),
  seekingCreditTransfer: z.enum(["yes", "no", "unsure"]),
  employmentStatus: z.string().trim().min(1),
  studyReason: z.string().trim().min(1),
  usi: z.string().trim().length(10, "USI must be exactly 10 characters"),
  agentName: z.string().trim().max(160).optional().default(""),
  studentDeclaration: z.literal(true, { error: "You must accept the student declaration." }),
});

export type EnrollmentApplicationInput = z.infer<typeof enrollmentApplicationSchema>;

export type EnrollmentApplicationRecord = {
  id: string;
  user_key: string;
  enrollment_id: string | null;
  course_slug: string;
  status: "draft" | "submitted" | "changes_requested" | "approved";
  application_data: Omit<EnrollmentApplicationInput, "courseSlug" | "studentDeclaration">;
  student_declaration: boolean;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by_email: string | null;
  reviewer_notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function getEnrollmentApplication(userKey: string, courseSlug: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("enrollment_applications")
    .select("*")
    .eq("user_key", userKey)
    .eq("course_slug", courseSlug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as EnrollmentApplicationRecord | null;
}

export async function hasPaidInitialFee(userKey: string, courseSlug: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;
  const { data, error } = await supabase
    .from("payment_intents")
    .select("id")
    .eq("user_key", userKey)
    .eq("course_slug", courseSlug)
    .eq("purpose", "course_enrollment")
    .eq("status", "paid")
    .contains("metadata", { initialPayment: "true" })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return Boolean(data);
}

export async function submitEnrollmentApplication(input: {
  userKey: string;
  enrollmentId?: string | null;
  application: EnrollmentApplicationInput;
}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase is not configured.");
  const existing = await getEnrollmentApplication(input.userKey, input.application.courseSlug);
  if (existing?.status === "approved") throw new Error("This application has already been approved.");
  const { courseSlug, studentDeclaration, ...applicationData } = input.application;
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("enrollment_applications")
    .upsert({
      user_key: input.userKey,
      enrollment_id: input.enrollmentId ?? null,
      course_slug: courseSlug,
      status: "submitted",
      application_data: applicationData,
      student_declaration: studentDeclaration,
      submitted_at: now,
      reviewed_at: null,
      reviewed_by_email: null,
      reviewer_notes: null,
      updated_at: now,
    }, { onConflict: "user_key,course_slug" })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  const { error: profileError } = await supabase.from("student_profiles").update({
    first_name: input.application.firstName,
    last_name: input.application.lastName,
    email: input.application.email.toLowerCase(),
    phone: input.application.phone,
    date_of_birth: input.application.dob,
    usi: input.application.usi.toUpperCase(),
    address: input.application.postalAddress || null,
    disability_status: input.application.disabilityStatus,
    disability_details: input.application.disabilityDetails || null,
    updated_at: now,
  }).eq("user_key", input.userKey);
  if (profileError) throw new Error(profileError.message);
  return data as EnrollmentApplicationRecord;
}
