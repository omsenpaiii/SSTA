import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isEnrollmentDocument } from "../src/lib/enrollment-document.ts";

const template = readFileSync(
  new URL("../public/forms/security-enrollment.docx", import.meta.url),
);
test("accepts the downloadable Word enrollment template", () =>
  assert.equal(isEnrollmentDocument(template), true));
test("rejects empty, truncated, and disguised uploads", () => {
  for (const bytes of [
    Buffer.alloc(0),
    Buffer.from("fake.docx"),
    Buffer.from("PK\x03\x04word/document.xml"),
    template.subarray(0, template.length - 30),
  ])
    assert.equal(isEnrollmentDocument(bytes), false);
});
test("rejects documents whose declared expanded size exceeds the limit", () => {
  const bytes = Buffer.from(template);
  const directory = bytes.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]));
  bytes.writeUInt32LE(40 * 1024 * 1024, directory + 24);
  assert.equal(isEnrollmentDocument(bytes), false);
});
test("rejects encrypted Word containers", () => {
  const bytes = Buffer.from(template);
  const directory = bytes.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]));
  bytes.writeUInt16LE(1, directory + 8);
  assert.equal(isEnrollmentDocument(bytes), false);
});
