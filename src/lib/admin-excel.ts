import ExcelJS from "exceljs";
import {
  upsertAdminCourse,
  upsertAdminEnrollment,
  upsertAdminLead,
  upsertAdminLesson,
  upsertAdminStudent,
  replaceAdminCourseUnits,
} from "@/lib/admin-data";
import { type AdminSnapshot } from "@/lib/admin-data";

export type ExcelEntity = "courses" | "students" | "enrollments" | "leads";

type ImportResult = {
  entity: ExcelEntity;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
};

const entities = new Set(["courses", "students", "enrollments", "leads"]);

export function parseExcelEntity(value: string | null): ExcelEntity {
  if (!value || !entities.has(value)) {
    throw new Error("Invalid Excel entity.");
  }

  return value as ExcelEntity;
}

function addSheet<T extends Record<string, unknown>>(
  workbook: ExcelJS.Workbook,
  name: string,
  rows: T[],
) {
  const sheet = workbook.addWorksheet(name);
  const headers = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row).forEach((key) => set.add(key));
      return set;
    }, new Set<string>()),
  );

  sheet.columns = headers.map((header) => ({
    header,
    key: header,
    width: Math.min(Math.max(header.length + 8, 16), 42),
  }));
  rows.forEach((row) => sheet.addRow(row));
  sheet.getRow(1).font = { bold: true };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
}

function joinList(value: unknown) {
  return Array.isArray(value) ? value.join("\n") : "";
}

function splitList(value: unknown) {
  return String(value ?? "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function buildExportWorkbook(entity: ExcelEntity, snapshot: AdminSnapshot) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "SSTA Admin Portal";
  workbook.created = new Date();

  if (entity === "courses") {
    addSheet(
      workbook,
      "Courses",
      snapshot.courses.map((course) => ({
        slug: course.slug,
        code: course.code,
        title: course.title,
        category: course.category,
        label: course.label,
        priceAud: course.priceAud,
        enrolmentFee: course.enrolmentFee ?? "",
        duration: course.duration,
        description: course.description,
        overview: course.overview,
        image: course.image,
        availability: course.availability ?? "open",
        priceLabel: course.priceLabel ?? "",
        detailVariant: course.detailVariant ?? "standard",
        deliveryModes: joinList(course.deliveryModes),
        entryRequirements: joinList(course.entryRequirements),
        careerOutcomes: joinList(course.careerOutcomes),
        unitSummary: course.unitSummary,
      })),
    );
    addSheet(
      workbook,
      "Lessons",
      snapshot.courses.flatMap((course) =>
        course.lessons.map((lesson, index) => ({
          courseSlug: course.slug,
          lessonKey: lesson.id,
          title: lesson.title,
          duration: lesson.duration,
          videoProvider: lesson.videoProvider,
          videoUrl: lesson.videoUrl,
          isPreview: lesson.isPreview,
          position: index,
        })),
      ),
    );
    addSheet(
      workbook,
      "Units",
      snapshot.courses.flatMap((course) =>
        course.units.map((unit, index) => ({
          courseSlug: course.slug,
          code: unit.code,
          title: unit.title,
          type: unit.type,
          prerequisite: unit.prerequisite ?? "",
          position: index,
        })),
      ),
    );
  }

  if (entity === "students") {
    const studentsByKey = new Map(snapshot.students.map((student) => [student.user_key, student]));
    addSheet(workbook, "Students", snapshot.students);
    addSheet(
      workbook,
      "StudentCourseAccess",
      snapshot.enrollments.map((enrollment) => ({
        userKey: enrollment.user_key,
        email: studentsByKey.get(enrollment.user_key)?.email ?? "",
        courseSlug: enrollment.course_slug,
        status: enrollment.status,
        amountPaid: enrollment.amount_paid ?? "",
        currency: enrollment.currency ?? "",
      })),
    );
  }

  if (entity === "enrollments") {
    addSheet(workbook, "Enrollments", snapshot.enrollments);
  }

  if (entity === "leads") {
    addSheet(workbook, "Leads", snapshot.leads);
  }

  return workbook;
}

function rowsFromSheet(workbook: ExcelJS.Workbook, sheetName: string) {
  const sheet = workbook.getWorksheet(sheetName);

  if (!sheet || sheet.rowCount < 2) {
    return [];
  }

  const headers = (sheet.getRow(1).values as ExcelJS.CellValue[])
    .slice(1)
    .map((value) => String(value ?? "").trim());
  const rows: Record<string, unknown>[] = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      return;
    }

    const values = row.values as ExcelJS.CellValue[];
    const item: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      item[header] = values[index + 1] ?? "";
    });

    if (Object.values(item).some((value) => String(value ?? "").trim())) {
      rows.push(item);
    }
  });

  return rows;
}

export async function importWorkbook(entity: ExcelEntity, buffer: ArrayBuffer): Promise<ImportResult> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const result: ImportResult = {
    entity,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  if (entity === "courses") {
    const courseRows = rowsFromSheet(workbook, "Courses");
    const lessonRows = rowsFromSheet(workbook, "Lessons");
    const unitRows = rowsFromSheet(workbook, "Units");

    const prepared = courseRows.map((row, index) => {
      const course = {
        slug: String(row.slug ?? "").trim(),
        code: String(row.code ?? "SSTA"),
        title: String(row.title ?? ""),
        category: String(row.category ?? "Other"),
        label: String(row.label ?? "Course"),
        priceAud: Number(row.priceAud ?? 0),
        enrolmentFee: row.enrolmentFee ? Number(row.enrolmentFee) : null,
        duration: String(row.duration ?? ""),
        description: String(row.description ?? ""),
        overview: String(row.overview ?? row.description ?? ""),
        image: String(row.image ?? ""),
        availability: String(row.availability ?? "open"),
        detailVariant: String(row.detailVariant ?? "standard"),
        deliveryModes: splitList(row.deliveryModes),
        entryRequirements: splitList(row.entryRequirements),
        careerOutcomes: splitList(row.careerOutcomes),
        unitSummary: String(row.unitSummary ?? ""),
        lessons: lessonRows
          .filter((lesson) => String(lesson.courseSlug ?? "") === String(row.slug ?? ""))
          .map((lesson) => ({
            id: String(lesson.lessonKey ?? ""),
            title: String(lesson.title ?? ""),
            duration: String(lesson.duration ?? ""),
            videoProvider:
              String(lesson.videoProvider ?? "youtube") === "google-drive"
                ? "google-drive"
                : "youtube",
            videoUrl: String(lesson.videoUrl ?? ""),
            isPreview: String(lesson.isPreview ?? "").toLowerCase() === "true",
          })),
        units: unitRows
          .filter((unit) => String(unit.courseSlug ?? "") === String(row.slug ?? ""))
          .map((unit) => ({
            code: String(unit.code ?? ""),
            title: String(unit.title ?? ""),
            type: String(unit.type ?? "Skill set"),
            prerequisite: String(unit.prerequisite ?? ""),
          }))
          .filter((unit) => unit.code && unit.title),
      };

      if (!course.slug || !course.title || !course.description) {
        result.errors.push(`Courses row ${index + 2}: slug, title, and description are required.`);
      }

      return course;
    });

    if (result.errors.length) {
      return result;
    }

    for (const course of prepared) {
      await upsertAdminCourse(course);
      for (const lesson of course.lessons) {
        if (lesson.title && lesson.videoUrl) {
          await upsertAdminLesson({
            courseSlug: course.slug,
            lessonKey: lesson.id,
            title: lesson.title,
            duration: lesson.duration,
            videoProvider: lesson.videoProvider,
            videoUrl: lesson.videoUrl,
            isPreview: lesson.isPreview,
          });
        }
      }
      await replaceAdminCourseUnits(course.slug, course.units);
      result.updated += 1;
    }

    return result;
  }

  if (entity === "students") {
    const studentRows = rowsFromSheet(workbook, "Students");
    const accessRows = rowsFromSheet(workbook, "StudentCourseAccess");
    const prepared = studentRows.map((row, index) => {
      const email = String(row.email ?? "").trim();

      if (!email.includes("@")) {
        result.errors.push(`Students row ${index + 2}: valid email is required.`);
      }

      return {
        firstName: String(row.first_name ?? row.firstName ?? ""),
        lastName: String(row.last_name ?? row.lastName ?? ""),
        email,
        phone: String(row.phone ?? ""),
        userKey: String(row.user_key ?? row.userKey ?? ""),
      };
    });
    const preparedAccess = accessRows.map((row, index) => {
      const courseSlug = String(row.courseSlug ?? row.course_slug ?? "").trim();
      const email = String(row.email ?? "").trim();
      const userKey = String(row.userKey ?? row.user_key ?? "").trim();

      if (!courseSlug) {
        result.errors.push(`StudentCourseAccess row ${index + 2}: course slug is required.`);
      }

      if (!userKey && !email) {
        result.errors.push(`StudentCourseAccess row ${index + 2}: userKey or email is required.`);
      }

      return {
        userKey,
        email,
        courseSlug,
        status: String(row.status ?? "active"),
        amountPaid: row.amountPaid ?? row.amount_paid ? Number(row.amountPaid ?? row.amount_paid) : null,
        currency: String(row.currency ?? "aud"),
      };
    });

    if (result.errors.length) {
      return result;
    }

    for (const student of prepared) {
      await upsertAdminStudent(student);
      result.updated += 1;
    }

    for (const access of preparedAccess) {
      await upsertAdminEnrollment(access);
      result.updated += 1;
    }

    return result;
  }

  if (entity === "enrollments") {
    const enrollmentRows = rowsFromSheet(workbook, "Enrollments");
    const prepared = enrollmentRows.map((row, index) => {
      if (!row.course_slug && !row.courseSlug) {
        result.errors.push(`Enrollments row ${index + 2}: course slug is required.`);
      }

      return {
        userKey: String(row.user_key ?? row.userKey ?? ""),
        email: String(row.email ?? ""),
        courseSlug: String(row.course_slug ?? row.courseSlug ?? ""),
        status: String(row.status ?? "active"),
        amountPaid: row.amount_paid ?? row.amountPaid ? Number(row.amount_paid ?? row.amountPaid) : null,
        currency: String(row.currency ?? "aud"),
      };
    });

    if (result.errors.length) {
      return result;
    }

    for (const enrollment of prepared) {
      await upsertAdminEnrollment(enrollment);
      result.updated += 1;
    }

    return result;
  }

  if (entity === "leads") {
    const leadRows = rowsFromSheet(workbook, "Leads");
    const prepared = leadRows.map((row, index) => {
      const email = String(row.email ?? "").trim();

      if (!email.includes("@")) {
        result.errors.push(`Leads row ${index + 2}: valid email is required.`);
      }

      return {
        id: String(row.id ?? ""),
        type: String(row.type ?? "interest"),
        firstName: String(row.first_name ?? row.firstName ?? ""),
        lastName: String(row.last_name ?? row.lastName ?? ""),
        email,
        phone: String(row.phone ?? ""),
        courseSlug: String(row.course_slug ?? row.courseSlug ?? ""),
        paymentStatus: String(row.payment_status ?? row.paymentStatus ?? "pending"),
        emailStatus: String(row.email_status ?? row.emailStatus ?? "pending"),
      };
    });

    if (result.errors.length) {
      return result;
    }

    for (const lead of prepared) {
      await upsertAdminLead(lead);
      result.updated += 1;
    }

    return result;
  }

  return result;
}
