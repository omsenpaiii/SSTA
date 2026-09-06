import nodemailer from "nodemailer";
import { getCourse } from "@/lib/courses";
import type { EnrollmentLead } from "@/lib/enrollment";
import type { InterestLead } from "@/lib/interests";

type StudentFeedbackEmail = {
  userName: string;
  userEmail: string;
  subject: string;
  category: string;
  message: string;
};

export function isSmtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD &&
      process.env.SMTP_FROM &&
      process.env.ENROLLMENT_TO_EMAIL,
  );
}

function getTransporter() {
  if (!isSmtpConfigured()) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE !== "false",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendEnrollmentEmail(lead: EnrollmentLead) {
  const transporter = getTransporter();

  if (!transporter) {
    throw new Error("SMTP is not configured yet.");
  }

  const course = getCourse(lead.course_slug);
  const fullName = `${lead.first_name} ${lead.last_name}`;
  const rows = [
    ["Student", fullName],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Date of birth", lead.date_of_birth ?? "Completed after payment"],
    ["USI", lead.usi ?? "Completed after payment"],
    ["Address", lead.address ?? "Completed after payment"],
    ["Course", course?.title ?? lead.course_slug],
    ["Payment status", lead.payment_status],
    ["Enrolment ID", lead.id],
  ];

  const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;font-weight:700;border-bottom:1px solid #e5e7eb;">${escapeHtml(label)}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.ENROLLMENT_TO_EMAIL,
    replyTo: lead.email,
    subject: `New SSTA enrollment: ${fullName}`,
    text,
    html: `
      <div style="font-family:Arial,sans-serif;color:#020d24;">
        <h1 style="margin:0 0 16px;">New SSTA enrollment</h1>
        <table style="border-collapse:collapse;width:100%;max-width:680px;">${htmlRows}</table>
      </div>
    `,
  });
}

export async function sendInterestEmail(lead: InterestLead) {
  const transporter = getTransporter();

  if (!transporter) {
    // Graceful fallback for local testing if SMTP is not configured
    console.log("SMTP not configured. Interest Lead email not sent:", lead);
    return;
  }

  const course = getCourse(lead.course_slug);
  const fullName = `${lead.first_name} ${lead.last_name}`;
  const rows = [
    ["Student", fullName],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Course of Interest", course?.title ?? lead.course_slug],
    ["Message", lead.message || "No message supplied"],
    ["Lead ID", lead.id],
    ["Type", lead.isMock ? "Mock Lead (Local Dev)" : "Official Lead"],
  ];

  const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;font-weight:700;border-bottom:1px solid #e5e7eb;">${escapeHtml(label)}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.ENROLLMENT_TO_EMAIL,
    replyTo: lead.email,
    subject: `New SSTA Course Interest Inquiry: ${fullName}`,
    text,
    html: `
      <div style="font-family:Arial,sans-serif;color:#020d24;">
        <h1 style="margin:0 0 16px;">New Course Interest Inquiry</h1>
        <p style="margin:0 0 16px;font-size:16px;">A user has submitted an interest enquiry from the homepage popup:</p>
        <table style="border-collapse:collapse;width:100%;max-width:680px;">${htmlRows}</table>
      </div>
    `,
  });
}

export async function sendStudentFeedbackEmail(feedback: StudentFeedbackEmail) {
  const transporter = getTransporter();

  if (!transporter || !process.env.ENROLLMENT_TO_EMAIL || !process.env.SMTP_FROM) {
    throw new Error("SMTP is not configured yet.");
  }

  const rows = [
    ["Student", feedback.userName],
    ["Email", feedback.userEmail],
    ["Category", feedback.category],
    ["Subject", feedback.subject],
  ];

  const text = `${rows.map(([label, value]) => `${label}: ${value}`).join("\n")}\n\nMessage:\n${feedback.message}`;
  const htmlRows = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;font-weight:700;border-bottom:1px solid #e5e7eb;">${escapeHtml(label)}</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.ENROLLMENT_TO_EMAIL,
    replyTo: feedback.userEmail,
    subject: `Student Portal Feedback: ${feedback.subject}`,
    text,
    html: `
      <div style="font-family:Arial,sans-serif;color:#020d24;">
        <h1 style="margin:0 0 16px;">Student portal feedback</h1>
        <table style="border-collapse:collapse;width:100%;max-width:680px;">${htmlRows}</table>
        <div style="margin-top:16px;padding:16px;border:1px solid #e5e7eb;border-radius:12px;background:#f8fafc;">
          <p style="margin:0;font-weight:700;">Message</p>
          <p style="margin:10px 0 0;white-space:pre-wrap;line-height:1.6;">${escapeHtml(feedback.message)}</p>
        </div>
      </div>
    `,
  });
}

export async function sendBalancePaymentEmail(input: {
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  courseFee: number;
  paidAmount: number;
  balance: number;
}) {
  const transporter = getTransporter();
  if (!transporter || !process.env.SMTP_FROM) throw new Error("SMTP is not configured yet.");
  const amount = (value: number) => new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(value);
  const text = `Hello ${input.studentName},\n\nYour SSTA initial payment has been received.\nCourse: ${input.courseTitle}\nCourse fee: ${amount(input.courseFee)}\nPaid: ${amount(input.paidAmount)}\nRemaining balance: ${amount(input.balance)}\n\nOur team will contact you about the next payment or you can call Joseph/SSTA on +61 431 696 558.\n\nSSTA`;
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: input.studentEmail,
    subject: `SSTA payment summary — ${input.courseTitle}`,
    text,
    html: `<div style="font-family:Arial,sans-serif;color:#020d24;max-width:680px"><h1>Payment summary</h1><p>Hello ${escapeHtml(input.studentName)},</p><p>Your initial payment has been received. The SSTA team will contact you about the next payment.</p><table style="border-collapse:collapse;width:100%"><tr><td style="padding:10px;border-bottom:1px solid #ddd;font-weight:700">Course</td><td style="padding:10px;border-bottom:1px solid #ddd">${escapeHtml(input.courseTitle)}</td></tr><tr><td style="padding:10px;border-bottom:1px solid #ddd;font-weight:700">Course fee</td><td style="padding:10px;border-bottom:1px solid #ddd">${amount(input.courseFee)}</td></tr><tr><td style="padding:10px;border-bottom:1px solid #ddd;font-weight:700">Paid</td><td style="padding:10px;border-bottom:1px solid #ddd">${amount(input.paidAmount)}</td></tr><tr><td style="padding:10px;font-weight:700">Remaining balance</td><td style="padding:10px;font-weight:700">${amount(input.balance)}</td></tr></table><p>Questions? Call Joseph/SSTA on <a href="tel:+61431696558">+61 431 696 558</a>.</p></div>`,
  });
}
