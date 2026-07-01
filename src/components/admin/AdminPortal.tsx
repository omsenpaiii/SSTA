"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  BookOpen,
  ChevronLeft,
  ClipboardCheck,
  Database,
  Download,
  FileSpreadsheet,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Upload,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { AdminUser } from "@/lib/admin";
import type { AdminSnapshot } from "@/lib/admin-data";
import { formatAssignmentStatus } from "@/lib/cpp20218";

type AdminPortalProps = {
  admin: AdminUser;
  snapshot: AdminSnapshot;
};

type Section = "dashboard" | "students" | "add-student" | "courses" | "lessons" | "assessments" | "leads" | "excel" | "settings";

const navItems: { id: Section; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: Users },
  { id: "add-student", label: "Add Student", icon: UserPlus },
  { id: "courses", label: "Courses", icon: GraduationCap },
  { id: "lessons", label: "Lessons", icon: BookOpen },
  { id: "assessments", label: "Assessments", icon: ClipboardCheck },
  { id: "leads", label: "Leads", icon: Database },
  { id: "excel", label: "Excel", icon: FileSpreadsheet },
  { id: "settings", label: "Settings", icon: Settings },
];

const exportEntities = ["courses", "students", "enrollments", "leads"] as const;

function money(centsOrDollars: number | null | undefined) {
  if (!centsOrDollars) return "$0";
  return `$${Number(centsOrDollars).toLocaleString("en-AU")}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AdminPortal({ admin, snapshot: initialSnapshot }: AdminPortalProps) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [active, setActive] = useState<Section>("dashboard");
  const [query, setQuery] = useState("");
  const [selectedCourseSlug, setSelectedCourseSlug] = useState(initialSnapshot.courses[0]?.slug ?? "");
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const courseBySlug = useMemo(
    () => new Map(snapshot.courses.map((course) => [course.slug, course])),
    [snapshot.courses],
  );
  const totalRevenue = snapshot.enrollments.reduce((sum, item) => sum + (item.amount_paid ?? 0), 0);
  const activeEnrollments = snapshot.enrollments.filter((item) => item.status === "active").length;
  const completedCount = snapshot.enrollments.filter((item) => item.status === "refunded").length;
  const filteredCourses = snapshot.courses.filter((course) => {
    const value = `${course.title} ${course.code} ${course.category}`.toLowerCase();
    return value.includes(query.toLowerCase());
  });
  const filteredStudents = snapshot.students.filter((student) => {
    const value = `${student.first_name ?? ""} ${student.last_name ?? ""} ${student.email ?? ""}`.toLowerCase();
    return value.includes(query.toLowerCase());
  });
  const courseBreakdown = snapshot.courses.slice(0, 9).map((course) => {
    const count = snapshot.enrollments.filter((item) => item.course_slug === course.slug).length;
    return { course, count };
  });
  const metricCards: { label: string; value: string; icon: LucideIcon }[] = [
    { label: "Total Students", value: String(snapshot.students.length), icon: Users },
    { label: "Active Enrolments", value: String(activeEnrollments), icon: GraduationCap },
    { label: "Completed", value: String(completedCount), icon: BookOpen },
    { label: "Revenue", value: money(totalRevenue), icon: Database },
  ];

  async function runAction(action: string, payload: unknown, success: string) {
    setNotice(null);
    const response = await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload }),
    });
    const json = await response.json();

    if (!response.ok) {
      setNotice({ type: "error", text: json.error ?? "Admin action failed." });
      return;
    }

    setSnapshot(json.snapshot);
    setNotice({ type: "success", text: success });
  }

  async function handleCourseSubmit(formData: FormData) {
    const title = String(formData.get("title") ?? "");
    await runAction(
      "upsert-course",
      {
        slug: String(formData.get("slug") || slugify(title)),
        code: String(formData.get("code") || "SSTA"),
        title,
        category: String(formData.get("category") || "Other"),
        label: String(formData.get("label") || "Course"),
        priceAud: Number(formData.get("priceAud") || 0),
        enrolmentFee: formData.get("enrolmentFee") ? Number(formData.get("enrolmentFee")) : null,
        duration: String(formData.get("duration") || ""),
        description: String(formData.get("description") || ""),
        overview: String(formData.get("overview") || formData.get("description") || ""),
        image: String(formData.get("image") || ""),
        availability: String(formData.get("availability") || "open"),
        deliveryModes: String(formData.get("deliveryModes") || "").split(/\r?\n|,/).filter(Boolean),
        entryRequirements: String(formData.get("entryRequirements") || "").split(/\r?\n|,/).filter(Boolean),
        careerOutcomes: String(formData.get("careerOutcomes") || "").split(/\r?\n|,/).filter(Boolean),
        unitSummary: String(formData.get("unitSummary") || ""),
      },
      "Course saved to Supabase.",
    );
  }

  async function handleStudentSubmit(formData: FormData) {
    await runAction(
      "upsert-student",
      {
        firstName: String(formData.get("firstName") || ""),
        lastName: String(formData.get("lastName") || ""),
        email: String(formData.get("email") || ""),
        phone: String(formData.get("phone") || ""),
        courseSlug: String(formData.get("courseSlug") || ""),
        status: "active",
      },
      "Student saved and access updated.",
    );
  }

  async function handleLessonSubmit(formData: FormData) {
    await runAction(
      "upsert-lesson",
      {
        courseSlug: String(formData.get("courseSlug") || ""),
        title: String(formData.get("title") || ""),
        duration: String(formData.get("duration") || ""),
        videoProvider: String(formData.get("videoProvider") || "youtube"),
        videoUrl: String(formData.get("videoUrl") || ""),
        isPreview: formData.get("isPreview") === "on",
      },
      "Lesson saved.",
    );
  }

  async function handleImport(entity: string) {
    const file = fileRef.current?.files?.[0];

    if (!file) {
      setNotice({ type: "error", text: "Choose an Excel file first." });
      return;
    }

    const formData = new FormData();
    formData.set("file", file);
    const response = await fetch(`/api/admin/import?entity=${entity}`, {
      method: "POST",
      body: formData,
    });
    const json = await response.json();

    if (!response.ok) {
      setNotice({ type: "error", text: json.errors?.join(" ") || json.error || "Import failed." });
      return;
    }

    const dataResponse = await fetch("/api/admin/data");
    setSnapshot(await dataResponse.json());
    setNotice({ type: "success", text: `Imported ${json.updated} ${entity} rows.` });
  }

  async function handleAssignmentReview(formData: FormData) {
    await runAction(
      "review-assignment",
      {
        submissionId: String(formData.get("submissionId") || ""),
        status: String(formData.get("status") || "not_satisfactory"),
        adminComment: String(formData.get("adminComment") || ""),
      },
      "Assessment review saved.",
    );
  }

  async function toggleAssignmentAccess(userKey: string, assignmentKey: string, unlocked: boolean) {
    await runAction(
      "update-assignment-access",
      { userKey, assignmentKey, unlocked },
      unlocked ? "Assignment unlocked." : "Assignment locked.",
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-[#101827]">
      {notice ? (
        <div
          className={`fixed right-6 top-6 z-50 rounded-xl px-5 py-4 text-sm font-black shadow-lg ${
            notice.type === "success" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
          }`}
        >
          {notice.text}
        </div>
      ) : null}

      <aside className="fixed inset-y-0 left-0 hidden w-[260px] flex-col bg-[#111c2b] text-white lg:flex">
        <div className="flex h-24 items-center gap-4 px-7">
          <span className="flex size-12 items-center justify-center rounded-xl bg-[#2e7af0]">
            <ShieldCheck size={26} />
          </span>
          <span>
            <span className="block text-xl font-black">SSTA</span>
            <span className="block text-sm font-bold text-white/52">Admin Portal</span>
          </span>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const selected = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`flex h-14 w-full items-center gap-4 rounded-xl px-5 text-left text-base font-black transition ${
                  selected ? "bg-[#2392ee] text-white shadow-lg shadow-blue-950/20" : "text-white/58 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon size={22} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button className="mb-3 flex h-12 w-full items-center gap-4 rounded-xl px-4 text-left font-bold text-white/52">
            <ChevronLeft size={20} /> Collapse
          </button>
          <form action="/auth/sign-out" method="post">
            <button className="flex h-12 w-full items-center gap-4 rounded-xl px-4 text-left font-bold text-white/52 hover:bg-white/8 hover:text-white">
              <LogOut size={20} /> Sign Out
            </button>
          </form>
        </div>
      </aside>

      <section className="lg:pl-[260px]">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/92 px-5 backdrop-blur lg:px-8">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search students, courses..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-base font-bold outline-none transition focus:border-[#2392ee] focus:bg-white"
            />
          </div>
          <div className="ml-4 flex items-center gap-4">
            <span className="relative flex size-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
              <Bell size={22} />
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[#f5b800] text-xs font-black text-[#101827]">
                {snapshot.leads.length}
              </span>
            </span>
            <span className="hidden items-center gap-3 sm:flex">
              <span className="flex size-12 items-center justify-center rounded-full bg-[#1f7ac1] text-sm font-black text-white">
                {admin.initials}
              </span>
              <span>
                <span className="block font-black">{admin.name}</span>
                <span className="block text-sm font-bold text-slate-500">{admin.email}</span>
              </span>
            </span>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
          {!snapshot.isSupabaseConfigured ? (
            <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
              Supabase is not configured, so the portal is showing fallback course data and mutations are disabled until environment keys are added.
            </div>
          ) : null}

          {active === "dashboard" ? (
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-black tracking-normal">Dashboard</h1>
                <p className="mt-2 text-lg font-bold text-slate-500">
                  Overview of SSTA student enrolment and operations.
                </p>
              </div>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {metricCards.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
                    <div className="flex items-start justify-between">
                      <span className="text-lg font-black text-slate-500">{label}</span>
                      <span className="flex size-12 items-center justify-center rounded-xl bg-[#eef4fb] text-[#1f7ac1]">
                        <Icon size={24} />
                      </span>
                    </div>
                    <div className="mt-5 text-4xl font-black">{value}</div>
                    <div className="mt-5 text-sm font-black text-slate-500">
                      <span className="mr-3 rounded-full bg-emerald-50 px-3 py-1 text-emerald-600">+ live</span>
                      from Supabase
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
                <section className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
                  <h2 className="text-2xl font-black">Enrollment Trends</h2>
                  <div className="mt-8 flex h-72 items-end gap-3 border-b border-l border-dashed border-slate-200 px-4">
                    {Array.from({ length: 12 }).map((_, index) => {
                      const monthCount = snapshot.enrollments.filter((item) => {
                        const date = new Date(item.created_at);
                        return date.getMonth() === index;
                      }).length;
                      return (
                        <div key={index} className="flex flex-1 flex-col items-center gap-2">
                          <div
                            className="w-full rounded-t-lg bg-[#1f7ac1]/80"
                            style={{ height: `${Math.max(monthCount * 28, 6)}px` }}
                          />
                          <span className="text-xs font-bold text-slate-500">
                            {new Date(2026, index, 1).toLocaleDateString("en-AU", { month: "short" })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>
                <section className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
                  <h2 className="text-2xl font-black">Course Breakdown</h2>
                  <div className="mt-7 space-y-5">
                    {courseBreakdown.map(({ course, count }) => (
                      <div key={course.slug}>
                        <div className="mb-2 flex justify-between gap-4 text-sm font-black">
                          <span>{course.title}</span>
                          <span className="text-slate-500">{count}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-[#2e7af0]"
                            style={{ width: `${Math.min(100, Math.max(8, count * 12))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          ) : null}

          {active === "students" ? (
            <TableSection
              title="Students"
              actionLabel="Add Student"
              onAction={() => setActive("add-student")}
              columns={["Name", "Email", "Phone", "Access Key", "Created"]}
              rows={filteredStudents.map((student) => [
                `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim() || "Unnamed",
                student.email ?? "",
                student.phone ?? "",
                student.user_key,
                new Date(student.created_at).toLocaleDateString("en-AU"),
              ])}
            />
          ) : null}

          {active === "add-student" ? (
            <FormSection title="Add Student" description="Create a student profile and optionally grant course access.">
              <form action={handleStudentSubmit} className="grid gap-5 md:grid-cols-2">
                <TextField name="firstName" label="First name" required />
                <TextField name="lastName" label="Last name" required />
                <TextField name="email" label="Email address" type="email" required />
                <TextField name="phone" label="Phone number" />
                <label className="grid gap-2 text-sm font-black text-slate-700 md:col-span-2">
                  Course access
                  <select name="courseSlug" className="h-12 rounded-xl border border-slate-200 px-4 font-bold">
                    <option value="">No course access yet</option>
                    {snapshot.courses.map((course) => (
                      <option key={course.slug} value={course.slug}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </label>
                <SubmitButton label="Save Student" />
              </form>
            </FormSection>
          ) : null}

          {active === "courses" ? (
            <div className="space-y-8">
              <TableSection
                title="Courses"
                actionLabel="New Course"
                columns={["Code", "Title", "Category", "Price", "Duration"]}
                rows={filteredCourses.map((course) => [
                  course.code,
                  course.title,
                  course.category,
                  money(course.priceAud),
                  course.duration,
                ])}
              />
              <FormSection title="Create or Update Course" description="Use an existing slug to update a course.">
                <form action={handleCourseSubmit} className="grid gap-5 md:grid-cols-2">
                  <TextField name="title" label="Course title" required />
                  <TextField name="slug" label="Slug" />
                  <TextField name="code" label="Code" defaultValue="SSTA" />
                  <TextField name="category" label="Category" defaultValue="Security" />
                  <TextField name="label" label="Label" defaultValue="Course" />
                  <TextField name="priceAud" label="Price AUD" type="number" defaultValue="100" />
                  <TextField name="enrolmentFee" label="Enrolment fee" type="number" />
                  <TextField name="duration" label="Duration" defaultValue="1 day" />
                  <TextField name="image" label="Image URL" />
                  <label className="grid gap-2 text-sm font-black text-slate-700">
                    Availability
                    <select name="availability" className="h-12 rounded-xl border border-slate-200 px-4 font-bold">
                      <option value="open">Open</option>
                      <option value="coming-soon">Coming soon</option>
                      <option value="details-to-follow">Details to follow</option>
                    </select>
                  </label>
                  <TextArea name="description" label="Description" required />
                  <TextArea name="overview" label="Overview" />
                  <TextArea name="deliveryModes" label="Delivery modes" placeholder="One per line or comma separated" />
                  <TextArea name="entryRequirements" label="Entry requirements" />
                  <TextArea name="careerOutcomes" label="Career outcomes" />
                  <TextArea name="unitSummary" label="Unit summary" />
                  <SubmitButton label="Save Course" />
                </form>
              </FormSection>
            </div>
          ) : null}

          {active === "lessons" ? (
            <FormSection title="Lessons" description="Add or update video lessons for a course.">
              <form action={handleLessonSubmit} className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-black text-slate-700 md:col-span-2">
                  Course
                  <select
                    name="courseSlug"
                    value={selectedCourseSlug}
                    onChange={(event) => setSelectedCourseSlug(event.target.value)}
                    className="h-12 rounded-xl border border-slate-200 px-4 font-bold"
                  >
                    {snapshot.courses.map((course) => (
                      <option key={course.slug} value={course.slug}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </label>
                <TextField name="title" label="Lesson title" required />
                <TextField name="duration" label="Duration" defaultValue="10:00" />
                <label className="grid gap-2 text-sm font-black text-slate-700">
                  Video provider
                  <select name="videoProvider" className="h-12 rounded-xl border border-slate-200 px-4 font-bold">
                    <option value="youtube">YouTube</option>
                    <option value="google-drive">Google Drive</option>
                  </select>
                </label>
                <TextField name="videoUrl" label="Video URL" type="url" required />
                <label className="flex items-center gap-3 text-sm font-black text-slate-700">
                  <input name="isPreview" type="checkbox" className="size-5" />
                  Free preview lesson
                </label>
                <SubmitButton label="Save Lesson" />
              </form>
              <div className="mt-8 divide-y divide-slate-100 rounded-xl border border-slate-200">
                {(courseBySlug.get(selectedCourseSlug)?.lessons ?? []).map((lesson, index) => (
                  <div key={lesson.id} className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <p className="font-black">{index + 1}. {lesson.title}</p>
                      <p className="text-sm font-bold text-slate-500">{lesson.duration} · {lesson.videoProvider}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                      {lesson.isPreview ? "Preview" : "Locked"}
                    </span>
                  </div>
                ))}
              </div>
            </FormSection>
          ) : null}

          {active === "leads" ? (
            <TableSection
              title="Enrollment & Interest Leads"
              columns={["Type", "Name", "Email", "Phone", "Course", "Created"]}
              rows={snapshot.leads.map((lead) => [
                lead.type,
                `${lead.first_name} ${lead.last_name}`,
                lead.email,
                lead.phone,
                courseBySlug.get(lead.course_slug)?.title ?? lead.course_slug,
                new Date(lead.created_at).toLocaleDateString("en-AU"),
              ])}
            />
          ) : null}

          {active === "assessments" ? (
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-black tracking-normal">CPP20218 Assessments</h1>
                <p className="mt-2 text-lg font-bold text-slate-500">
                  Review learner submissions, manage assignment access, and open assessor answer keys.
                </p>
              </div>

              <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-black">Assessor answer keys</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {snapshot.cpp20218.adminResources.length ? snapshot.cpp20218.adminResources.map((resource) => (
                    <a
                      key={resource.id}
                      href={`/api/admin/assignment-file?type=resource&id=${resource.id}`}
                      target="_blank"
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-[#1f7ac1]"
                    >
                      <p className="text-xs font-black uppercase tracking-[0.1em] text-[#1f7ac1]">
                        {resource.assignment_key.replace("-", " ")}
                      </p>
                      <h3 className="mt-2 text-base font-black text-slate-900">{resource.title}</h3>
                      <p className="mt-2 text-sm font-bold text-slate-500">Admin-only assessor resource</p>
                    </a>
                  )) : (
                    <p className="text-sm font-bold text-slate-500">No assessor keys uploaded yet.</p>
                  )}
                </div>
              </section>

              <div className="space-y-5">
                {snapshot.cpp20218.students.map((student) => {
                  const name = `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim() || student.email || student.userKey;
                  return (
                    <section key={student.userKey} className="rounded-xl border border-slate-200 bg-white shadow-sm">
                      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-6">
                        <div>
                          <h2 className="text-2xl font-black">{name}</h2>
                          <p className="mt-1 text-sm font-bold text-slate-500">
                            {student.email ?? "No email"} · {student.phone ?? "No phone"} · Source: {student.source ?? "Unknown"}
                          </p>
                        </div>
                        <span className="rounded-full bg-[#eef4fb] px-4 py-2 text-sm font-black text-[#1f7ac1]">
                          {student.assignments.filter((assignment) => assignment.unlocked).length}/{student.assignments.length} unlocked
                        </span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {student.assignments.map((assignment) => (
                          <div key={assignment.assignmentKey} className="grid gap-4 p-6 xl:grid-cols-[1fr_220px_1.1fr]">
                            <div>
                              <p className="text-xs font-black uppercase tracking-[0.1em] text-[#1f7ac1]">{assignment.title}</p>
                              <h3 className="mt-1 text-lg font-black text-slate-900">{assignment.subtitle}</h3>
                              <p className="mt-2 text-sm font-bold text-slate-500">{assignment.lockReason ?? "Access rule applied."}</p>
                            </div>

                            <div className="space-y-3">
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                                assignment.status === "satisfactory"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : assignment.status === "not_satisfactory"
                                    ? "bg-rose-50 text-rose-700"
                                    : assignment.status === "locked"
                                      ? "bg-slate-100 text-slate-600"
                                      : "bg-amber-50 text-amber-700"
                              }`}>
                                {formatAssignmentStatus(assignment.status)}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleAssignmentAccess(student.userKey, assignment.assignmentKey, !assignment.unlocked)}
                                className="block h-10 rounded-xl border border-slate-200 px-4 text-sm font-black text-[#1f7ac1]"
                              >
                                {assignment.unlocked ? "Lock assignment" : "Unlock assignment"}
                              </button>
                            </div>

                            <div>
                              {assignment.submission ? (
                                <form action={handleAssignmentReview} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                  <input type="hidden" name="submissionId" value={assignment.submission.id} />
                                  <div className="flex flex-wrap items-center justify-between gap-3">
                                    <a
                                      href={`/api/admin/assignment-file?type=submission&id=${assignment.submission.id}`}
                                      target="_blank"
                                      className="text-sm font-black text-[#1f7ac1] underline"
                                    >
                                      Open submission
                                    </a>
                                    <span className="text-xs font-bold text-slate-500">
                                      {new Date(assignment.submission.submitted_at).toLocaleString("en-AU")}
                                    </span>
                                  </div>
                                  <textarea
                                    name="adminComment"
                                    defaultValue={assignment.submission.admin_comment ?? ""}
                                    placeholder="Comments for the learner..."
                                    className="mt-3 min-h-24 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-bold outline-none focus:border-[#1f7ac1]"
                                  />
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    <button
                                      name="status"
                                      value="satisfactory"
                                      className="h-10 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white"
                                    >
                                      Satisfactory
                                    </button>
                                    <button
                                      name="status"
                                      value="not_satisfactory"
                                      className="h-10 rounded-xl bg-rose-600 px-4 text-sm font-black text-white"
                                    >
                                      Not satisfactory
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-500">
                                  No submission yet.
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          ) : null}

          {active === "excel" ? (
            <FormSection title="Excel Import / Export" description="Export clean templates or import populated .xlsx files.">
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {exportEntities.map((entity) => (
                  <div key={entity} className="rounded-xl border border-slate-200 p-5">
                    <h3 className="text-lg font-black capitalize">{entity}</h3>
                    <div className="mt-5 flex flex-col gap-3">
                      <a
                        href={`/api/admin/export?entity=${entity}`}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1f7ac1] px-4 text-sm font-black text-white"
                      >
                        <Download size={16} /> Export
                      </a>
                      <button
                        type="button"
                        onClick={() => handleImport(entity)}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-black text-[#1f7ac1]"
                      >
                        <Upload size={16} /> Import
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <input ref={fileRef} type="file" accept=".xlsx" className="mt-6 block w-full rounded-xl border border-slate-200 p-4 font-bold" />
            </FormSection>
          ) : null}

          {active === "settings" ? (
            <FormSection title="Settings" description="Seed Supabase with the bundled SSTA catalogue and refresh admin data.">
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => runAction("seed-defaults", {}, "Default courses seeded to Supabase.")}
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#111c2b] px-5 text-sm font-black text-white"
                >
                  <RefreshCw size={18} /> Seed Default Courses
                </button>
                <Link href="/" className="inline-flex h-12 items-center rounded-xl border border-slate-200 px-5 text-sm font-black text-[#1f7ac1]">
                  View Public Site
                </Link>
              </div>
              <p className="mt-5 text-sm font-bold text-slate-500">
                Google sign-in is controlled in Supabase Auth. Enable Google OAuth in the Supabase Auth dashboard for this app before launch.
              </p>
            </FormSection>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function TableSection({
  title,
  actionLabel,
  onAction,
  columns,
  rows,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  columns: string[];
  rows: string[][];
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-6">
        <h1 className="text-3xl font-black tracking-normal">{title}</h1>
        {actionLabel ? (
          <button onClick={onAction} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1f7ac1] px-4 text-sm font-black text-white">
            <Plus size={18} /> {actionLabel}
          </button>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
            <tr>{columns.map((column) => <th key={column} className="px-6 py-4">{column}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length ? rows.map((row, index) => (
              <tr key={index} className="text-sm font-bold text-slate-700">
                {row.map((cell, cellIndex) => (
                  <td key={`${index}-${cellIndex}`} className="max-w-[320px] truncate px-6 py-4">{cell}</td>
                ))}
              </tr>
            )) : (
              <tr>
                <td className="px-6 py-10 text-center text-sm font-bold text-slate-500" colSpan={columns.length}>
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
      <h1 className="text-3xl font-black tracking-normal">{title}</h1>
      <p className="mt-2 text-base font-bold text-slate-500">{description}</p>
      <div className="mt-7">{children}</div>
    </section>
  );
}

function TextField({
  name,
  label,
  type = "text",
  required,
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-slate-700">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="h-12 rounded-xl border border-slate-200 px-4 font-bold outline-none focus:border-[#1f7ac1]"
      />
    </label>
  );
}

function TextArea({
  name,
  label,
  required,
  placeholder,
}: {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-slate-700 md:col-span-2">
      {label}
      <textarea
        name={name}
        required={required}
        placeholder={placeholder}
        rows={4}
        className="rounded-xl border border-slate-200 px-4 py-3 font-bold outline-none focus:border-[#1f7ac1]"
      />
    </label>
  );
}

function SubmitButton({ label }: { label: string }) {
  return (
    <div className="md:col-span-2">
      <button className="inline-flex h-12 items-center rounded-xl bg-[#1f7ac1] px-6 text-sm font-black text-white">
        {label}
      </button>
    </div>
  );
}
