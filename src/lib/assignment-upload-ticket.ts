import { createHmac, timingSafeEqual } from "node:crypto";

export const MAX_ASSESSMENT_BYTES = 50 * 1024 * 1024;
export type AssignmentUploadTicket = {
  userKey: string;
  assignmentKey: string;
  path: string;
  fileName: string;
  size: number;
  mimeType: string;
  actor: string;
  expires: number;
};
export function signUploadTicket(ticket: AssignmentUploadTicket, secret: string) {
  const body = Buffer.from(JSON.stringify(ticket)).toString("base64url");
  return `${body}.${createHmac("sha256", secret).update(body).digest("base64url")}`;
}
export function verifyUploadTicket(value: string, secret: string, userKey: string, assignmentKey: string, actor: string): AssignmentUploadTicket {
  const [body, signature, extra] = value.split(".");
  if (!body || !signature || extra) throw new Error("Invalid upload receipt. Choose the file and try again.");
  const expected = createHmac("sha256", secret).update(body).digest();
  const actual = Buffer.from(signature, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new Error("Invalid upload receipt.");
  const ticket = JSON.parse(Buffer.from(body, "base64url").toString()) as AssignmentUploadTicket;
  if (ticket.userKey !== userKey || ticket.assignmentKey !== assignmentKey || ticket.actor !== actor || ticket.expires < Date.now()) throw new Error("Upload receipt expired or does not belong to this assessment. Please retry.");
  return ticket;
}
