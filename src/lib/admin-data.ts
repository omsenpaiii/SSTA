import { z } from "zod";
import { manualStudentKey } from "@/lib/admin";
import { getCourses } from "@/lib/course-repository";
import {
  getAdminCppAssignmentSnapshot,
  reviewAssignmentSubmission,
  setStudentAssignmentAccess,
  type AdminCppStudent,
  type CppAssignmentResource,
} from "@/lib/cpp20218";
import { type Course } from "@/lib/courses";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export type AdminStudent = {
  id: string;
  user_key: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  batch_number: number;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string | null;
};

export type AdminEnrollment = {
  id: string;
  user_key: string;
  course_slug: string;
  status: "active" | "refunded" | "revoked";
  stripe_customer_id: string | null;
  stripe_session_id: string | null;
  amount_paid: number | null;
  currency: string | null;
  created_at: string;
  updated_at: string | null;
};

export type AdminLead = {
  id: string;
  type: "enrollment" | "interest";
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  course_slug: string;
  disability_status?: "no" | "yes" | "prefer_not_to_say" | null;
  disability_details?: string | null;
  payment_status?: string | null;
  email_status?: string | null;
  created_at: string;
};

export type AdminSnapshot = {
  isSupabaseConfigured: boolean;
  courses: Course[];
  students: AdminStudent[];
  enrollments: AdminEnrollment[];
  leads: AdminLead[];
  cpp20218: {
    students: AdminCppStudent[];
    adminResources: CppAssignmentResource[];
  };
};

const courseSchema = z.object({
  slug: z.string().trim().min(1),
  code: z.string().trim().default("SSTA"),
  title: z.string().trim().min(1),
  category: z.string().trim().default("Other"),
  label: z.string().trim().default("Course"),
  priceAud: z.coerce.number().min(0).default(0),
  enrolmentFee: z.coerce.number().min(0).optional().nullable(),
  duration: z.string().trim().default(""),
  description: z.string().trim().min(1),
  overview: z.string().trim().optional().nullable(),
  image: z.string().trim().optional().nullable(),
  externalVideoUrl: z.string().trim().optional().nullable(),
  deliveryModes: z.array(z.string()).default([]),
  entryRequirements: z.array(z.string()).default([]),
  careerOutcomes: z.array(z.string()).default([]),
  unitSummary: z.string().trim().default(""),
  availability: z.enum(["open", "coming-soon", "details-to-follow"]).optional().nullable(),
  priceLabel: z.string().trim().optional().nullable(),
  statusNote: z.string().trim().optional().nullable(),
  detailVariant: z.enum(["standard", "contact-first"]).optional().nullable(),
  externalAccessUrl: z.string().trim().optional().nullable(),
  externalAccessLabel: z.string().trim().optional().nullable(),
  durationDetails: z.string().trim().optional().nullable(),
  feeDetails: z.string().trim().optional().nullable(),
  deliveryStrategy: z.string().trim().optional().nullable(),
  sourceArchiveUrl: z.string().trim().optional().nullable(),
  units: z.array(z.any()).default([]),
  lessons: z.array(z.any()).default([]),
});

const lessonSchema = z.object({
  courseSlug: z.string().trim().min(1),
  lessonKey: z.string().trim().optional(),
  title: z.string().trim().min(1),
  duration: z.string().trim().default(""),
  videoProvider: z.enum(["youtube", "google-drive"]).default("youtube"),
  videoUrl: z.string().trim().min(1),
  isPreview: z.coerce.boolean().default(false),
});

const studentSchema = z.object({
  firstName: z.string().trim().optional().nullable(),
  lastName: z.string().trim().optional().nullable(),
  email: z.string().trim().email(),
  phone: z.string().trim().optional().nullable(),
  batchNumber: z.coerce.number().int().positive().default(2),
  userKey: z.string().trim().optional().nullable(),
  courseSlug: z.string().trim().optional().nullable(),
  status: z.enum(["active", "refunded", "revoked"]).default("active"),
});

const enrollmentSchema = z.object({
  userKey: z.string().trim().optional().nullable(),
  email: z.string().trim().email().optional().nullable(),
  courseSlug: z.string().trim().min(1),
  status: z.enum(["active", "refunded", "revoked"]).default("active"),
  amountPaid: z.coerce.number().optional().nullable(),
  currency: z.string().trim().optional().nullable(),
});

const leadSchema = z.object({
  id: z.string().trim().optional().nullable(),
  type: z.enum(["enrollment", "interest"]).default("interest"),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().min(1),
  courseSlug: z.string().trim().min(1),
  disabilityStatus: z.enum(["no", "yes", "prefer_not_to_say"]).default("no"),
  disabilityDetails: z.string().trim().optional().nullable(),
  paymentStatus: z.enum(["pending", "paid", "failed", "cancelled"]).default("pending"),
  emailStatus: z.enum(["pending", "sent", "failed"]).default("pending"),
});

function requireSupabase() {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  return supabase;
}

function listFromText(value: string | null | undefined) {
  return (value ?? "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toCourseRow(course: z.infer<typeof courseSchema>) {
  return {
    slug: course.slug,
    code: course.code,
    title: course.title,
    category: course.category,
    label: course.label,
    price_aud: Math.round(course.priceAud),
    enrolment_fee: course.enrolmentFee ?? null,
    duration: course.duration,
    description: course.description,
    overview: course.overview ?? course.description,
    image_url: course.image ?? null,
    external_video_url: course.externalVideoUrl ?? null,
    delivery_modes: course.deliveryModes,
    entry_requirements: course.entryRequirements,
    career_outcomes: course.careerOutcomes,
    unit_summary: course.unitSummary,
    availability: course.availability ?? "open",
    price_label: course.priceLabel ?? null,
    status_note: course.statusNote ?? null,
    detail_variant: course.detailVariant ?? "standard",
    external_access_url: course.externalAccessUrl ?? null,
    external_access_label: course.externalAccessLabel ?? null,
    duration_details: course.durationDetails ?? null,
    fee_details: course.feeDetails ?? null,
    delivery_strategy: course.deliveryStrategy ?? null,
    source_archive_url: course.sourceArchiveUrl ?? null,
    is_active: true,
    updated_at: new Date().toISOString(),
  };
}

export async function getAdminSnapshot(): Promise<AdminSnapshot> {
  const courses = await getCourses();

  if (!isSupabaseConfigured()) {
    return {
      isSupabaseConfigured: false,
      courses,
      students: [],
      enrollments: [],
      leads: [],
      cpp20218: { students: [], adminResources: [] },
    };
  }

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return {
      isSupabaseConfigured: false,
      courses,
      students: [],
      enrollments: [],
      leads: [],
      cpp20218: { students: [], adminResources: [] },
    };
  }

  try {
    const [studentsResult, enrollmentsResult, enrollmentLeadsResult, interestLeadsResult] =
      await Promise.all([
        supabase
          .from("student_profiles")
          .select("id,user_key,first_name,last_name,email,phone,batch_number,stripe_customer_id,created_at,updated_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("course_enrollments")
          .select("id,user_key,course_slug,status,stripe_customer_id,stripe_session_id,amount_paid,currency,created_at,updated_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("enrollment_leads")
          .select("id,first_name,last_name,email,phone,course_slug,disability_status,disability_details,payment_status,email_status,created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("interest_leads")
          .select("id,first_name,last_name,email,phone,course_slug,created_at")
          .order("created_at", { ascending: false }),
      ]);

    const enrollmentLeads = ((enrollmentLeadsResult.data ?? []) as Omit<AdminLead, "type">[]).map(
      (lead) => ({ ...lead, type: "enrollment" as const }),
    );
    const interestLeads = ((interestLeadsResult.data ?? []) as Omit<AdminLead, "type">[]).map(
      (lead) => ({
        ...lead,
        type: "interest" as const,
        disability_status: null,
        disability_details: null,
      }),
    );

    const cpp20218 = await getAdminCppAssignmentSnapshot();

    return {
      isSupabaseConfigured: true,
      courses,
      students: (studentsResult.data ?? []) as AdminStudent[],
      enrollments: (enrollmentsResult.data ?? []) as AdminEnrollment[],
      leads: [...enrollmentLeads, ...interestLeads].sort((a, b) =>
        b.created_at.localeCompare(a.created_at),
      ),
      cpp20218,
    };
  } catch {
    return {
      isSupabaseConfigured: true,
      courses,
      students: [],
      enrollments: [],
      leads: [],
      cpp20218: { students: [], adminResources: [] },
    };
  }
}

export async function upsertAdminCourse(input: unknown) {
  const course = courseSchema.parse(input);
  const supabase = requireSupabase();

  const { error } = await supabase
    .from("courses")
    .upsert(toCourseRow(course), { onConflict: "slug" });

  if (error) {
    throw new Error(error.message);
  }

  return course;
}

export async function upsertAdminLesson(input: unknown) {
  const lesson = lessonSchema.parse(input);
  const supabase = requireSupabase();
  const lessonKey =
    lesson.lessonKey ||
    lesson.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const { count } = await supabase
    .from("course_lessons")
    .select("id", { count: "exact", head: true })
    .eq("course_slug", lesson.courseSlug);

  const { error } = await supabase.from("course_lessons").upsert(
    {
      course_slug: lesson.courseSlug,
      lesson_key: lessonKey,
      title: lesson.title,
      duration: lesson.duration,
      video_provider: lesson.videoProvider,
      video_url: lesson.videoUrl,
      is_preview: lesson.isPreview,
      position: count ?? 0,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "course_slug,lesson_key" },
  );

  if (error) {
    throw new Error(error.message);
  }

  return { ...lesson, lessonKey };
}

export async function replaceAdminCourseUnits(
  courseSlug: string,
  units: { code: string; title: string; type?: string; prerequisite?: string | null }[],
) {
  const supabase = requireSupabase();
  await supabase.from("course_units").delete().eq("course_slug", courseSlug);

  if (!units.length) {
    return;
  }

  const { error } = await supabase.from("course_units").insert(
    units.map((unit, index) => ({
      course_slug: courseSlug,
      code: unit.code,
      title: unit.title,
      type:
        unit.type === "Core" || unit.type === "Elective" || unit.type === "Skill set"
          ? unit.type
          : "Skill set",
      prerequisite: unit.prerequisite ?? null,
      position: index,
    })),
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function upsertAdminStudent(input: unknown) {
  const student = studentSchema.parse(input);
  const supabase = requireSupabase();
  const userKey = student.userKey || manualStudentKey(student.email);

  const { error: profileError } = await supabase.from("student_profiles").upsert(
    {
      user_key: userKey,
      first_name: student.firstName ?? null,
      last_name: student.lastName ?? null,
      email: student.email,
      phone: student.phone ?? null,
      batch_number: student.batchNumber,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_key" },
  );

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (student.courseSlug) {
    const { error: enrollmentError } = await supabase.from("course_enrollments").upsert(
      {
        user_key: userKey,
        course_slug: student.courseSlug,
        status: student.status,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_key,course_slug" },
    );

    if (enrollmentError) {
      throw new Error(enrollmentError.message);
    }
  }

  return { ...student, userKey };
}

export async function upsertAdminEnrollment(input: unknown) {
  const enrollment = enrollmentSchema.parse(input);
  const supabase = requireSupabase();
  const userKey =
    enrollment.userKey ||
    (enrollment.email ? manualStudentKey(enrollment.email) : null);

  if (!userKey) {
    throw new Error("Enrollment import needs userKey or email.");
  }

  if (enrollment.email) {
    const { error: profileError } = await supabase.from("student_profiles").upsert(
      {
        user_key: userKey,
        email: enrollment.email,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_key" },
    );

    if (profileError) {
      throw new Error(profileError.message);
    }
  }

  const { error } = await supabase.from("course_enrollments").upsert(
    {
      user_key: userKey,
      course_slug: enrollment.courseSlug,
      status: enrollment.status,
      amount_paid: enrollment.amountPaid ?? null,
      currency: enrollment.currency ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_key,course_slug" },
  );

  if (error) {
    throw new Error(error.message);
  }

  return { ...enrollment, userKey };
}

export async function upsertAdminLead(input: unknown) {
  const lead = leadSchema.parse(input);
  const supabase = requireSupabase();

  if (lead.type === "enrollment") {
    const values = {
      ...(lead.id ? { id: lead.id } : {}),
      first_name: lead.firstName,
      last_name: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      date_of_birth: "1900-01-01",
      usi: "UNKNOWN000",
      address: "Imported by SSTA admin",
      course_slug: lead.courseSlug,
      disability_status: lead.disabilityStatus,
      disability_details:
        lead.disabilityStatus === "yes" && lead.disabilityDetails
          ? lead.disabilityDetails
          : null,
      payment_status: lead.paymentStatus,
      email_status: lead.emailStatus,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("enrollment_leads").upsert(values);

    if (error) {
      throw new Error(error.message);
    }
  } else {
    const values = {
      ...(lead.id ? { id: lead.id } : {}),
      first_name: lead.firstName,
      last_name: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      course_slug: lead.courseSlug,
    };
    const { error } = await supabase.from("interest_leads").upsert(values);

    if (error) {
      throw new Error(error.message);
    }
  }

  return lead;
}

export async function reviewAdminAssignment(input: unknown, reviewedBy: string) {
  const parsed = z.object({
    submissionId: z.string().trim().min(1),
    status: z.enum(["satisfactory", "not_satisfactory"]),
    adminComment: z.string().trim().default(""),
  }).parse(input);

  await reviewAssignmentSubmission({
    submissionId: parsed.submissionId,
    status: parsed.status,
    adminComment: parsed.adminComment,
    reviewedBy,
  });
}

export async function updateAdminAssignmentAccess(input: unknown, adminEmail: string) {
  const parsed = z.object({
    userKey: z.string().trim().min(1),
    assignmentKey: z.string().trim().min(1),
    unlocked: z.coerce.boolean(),
  }).parse(input);

  await setStudentAssignmentAccess({
    userKey: parsed.userKey,
    assignmentKey: parsed.assignmentKey,
    unlocked: parsed.unlocked,
    adminEmail,
  });
}

export async function deleteAdminCourse(slug: string) {
  const supabase = requireSupabase();
  const { error } = await supabase
    .from("courses")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("slug", slug);

  if (error) {
    throw new Error(error.message);
  }
}

export async function seedCoursesToSupabase(courses: Course[]) {
  const supabase = requireSupabase();

  for (const course of courses) {
    const parsed = courseSchema.parse(course);
    const { error } = await supabase
      .from("courses")
      .upsert(toCourseRow(parsed), { onConflict: "slug" });

    if (error) {
      throw new Error(error.message);
    }

    if (course.units?.length) {
      await supabase.from("course_units").delete().eq("course_slug", course.slug);
      const { error: unitError } = await supabase.from("course_units").insert(
        course.units.map((unit, index) => ({
          course_slug: course.slug,
          code: unit.code,
          title: unit.title,
          type: unit.type,
          prerequisite: unit.prerequisite ?? null,
          position: index,
        })),
      );

      if (unitError) {
        throw new Error(unitError.message);
      }
    }

    if (course.lessons?.length) {
      await supabase.from("course_lessons").delete().eq("course_slug", course.slug);
      const { error: lessonError } = await supabase.from("course_lessons").insert(
        course.lessons.map((lesson, index) => ({
          course_slug: course.slug,
          lesson_key: lesson.id,
          title: lesson.title,
          duration: lesson.duration,
          video_provider: lesson.videoProvider,
          video_url: lesson.videoUrl,
          position: index,
          is_preview: lesson.isPreview,
        })),
      );

      if (lessonError) {
        throw new Error(lessonError.message);
      }
    }
  }
}

export function normalizeCoursePayload(form: Record<string, FormDataEntryValue>) {
  return {
    slug: String(form.slug ?? ""),
    code: String(form.code ?? "SSTA"),
    title: String(form.title ?? ""),
    category: String(form.category ?? "Other"),
    label: String(form.label ?? "Course"),
    priceAud: Number(form.priceAud ?? 0),
    enrolmentFee: form.enrolmentFee ? Number(form.enrolmentFee) : null,
    duration: String(form.duration ?? ""),
    description: String(form.description ?? ""),
    overview: String(form.overview ?? form.description ?? ""),
    image: String(form.image ?? ""),
    deliveryModes: listFromText(String(form.deliveryModes ?? "")),
    entryRequirements: listFromText(String(form.entryRequirements ?? "")),
    careerOutcomes: listFromText(String(form.careerOutcomes ?? "")),
    unitSummary: String(form.unitSummary ?? ""),
    availability: String(form.availability ?? "open"),
  };
}
