#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = resolve(process.cwd());
const sourceRoot = join(root, "Cert2Security");
const outRoot = join(root, ".tmp", "cpp20218-converted");
const courseSlug = "certificate-ii-security-operations";
const bucket = "course-resources";
const soffice =
  process.env.SOFFICE_BIN ||
  "/Users/omtomar/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/soffice";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(join(root, ".env.production.local"));
loadEnvFile(join(root, ".env.local"));
loadEnvFile(join(root, ".env.cpp20218.tmp"));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

if (!existsSync(sourceRoot)) {
  console.error(`Missing source folder: ${sourceRoot}`);
  process.exit(1);
}

mkdirSync(outRoot, { recursive: true });

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const assignments = [
  {
    key: "assignment-1",
    dir: "CLUSTER 1 HLTAID011  PROVIDE FIRST AID",
    title: "Assignment 1",
    subtitle: "HLTAID011 Provide First Aid",
    slides: "LEARNER/PPP - HLTAID011.v2.pptx",
    learning: "LEARNER/HLTAID011- Learner Guide V1.0 (1).docx",
    assessments: ["LEARNER/HLTAID011 - Learner Assessment Workbook (2).docx"],
    assessor: ["TRAINER ASSESSOR/HLTAID011 - Assessor Guide (2).docx"],
  },
  {
    key: "assignment-2",
    dir: "CLUSTER 2 LAW & CLIENT SERVICES",
    title: "Assignment 2",
    subtitle: "Law & Client Services",
    slides: "LEARNER/Cluster 2 - Law and Client Services Ver. 1.0.pptx",
    learning: "LEARNER/Cluster 2 - Law and Client Services - Learner Guide v.1.2.docx",
    assessments: ["LEARNER/Cluster 2 - Law and Client Services - Learner Assessment Workbook v1.1 (1).docx"],
    assessor: ["ASSESSOR/Cluster 2 - Law and Client Services -  Assessor Instructions v1.1.docx"],
  },
  {
    key: "assignment-3",
    dir: "CLUSTER 3 ASSESS RISK AND MAINTAIN SAFETY",
    title: "Assignment 3",
    subtitle: "Assess Risk and Maintain Safety",
    slides: "ASSESSOR/Assess Risk and Maintain Safety.pptx",
    learning: "LEARNER/Assess Risk and Maintain Safety - Learner Guide.docx",
    assessments: [
      "LEARNER/CPPSEC2103, CPPSEC2104, CPPSEC2113 - Learner  Assessment Workbook.docx",
      "LEARNER/PA Student Copy - One Punch Assessment.docx",
    ],
    assessor: [
      "ASSESSOR/CPPSEC2103, CPPSEC2104, CPPSEC2113 - Assessor Guide and Instructions.docx",
      "ASSESSOR/PA Assessor Copy - One Punch Assessment.docx",
    ],
  },
  {
    key: "assignment-4",
    dir: "CLUSTER 4 SECURITY OPERATIONS",
    title: "Assignment 4",
    subtitle: "Security Operations",
    slides: "LEARNER/Cluster 4 Security Guarding Operations.pptx",
    learning: "LEARNER/Cluster 4 Security Guarding Operartions - Learner Guide.docx",
    assessments: ["LEARNER/Cluster 4 Security Guarding Opeartions - Learner  Assessment Workbook.docx"],
    assessor: ["ASSESSOR/Cluster 4 Security Guarding Operations - Assessor Guide and Instructions.docx"],
  },
  {
    key: "assignment-5",
    dir: "CLUSTER 5 OPERATIONAL SAFETY",
    title: "Assignment 5",
    subtitle: "Operational Safety",
    slides: "LEARNER/Cluster 5 Operational Safety.pptx",
    learning: "LEARNER/Cluster 5 Operational Safety - Learner Guide[v1.1].docx",
    assessments: ["LEARNER/Cluster 5 - Operational Safety - Learner  Assessment and Instructions.docx"],
    assessor: ["ASSESSOR/Cluster 5 Operational Safety - Assessor Instructions.docx"],
  },
  {
    key: "assignment-6",
    dir: "",
    title: "Assignment 6",
    subtitle: "Final Law Gap",
    assessments: ["Final Assessment- Law Gap Assessment Workbook.docx"],
    assessor: ["Final Assessment Law Gap Trainer Assessor Guide.docx"],
  },
];

function sourcePath(assignment, relativePath) {
  return join(sourceRoot, assignment.dir, relativePath);
}

function storagePath(assignmentKey, role, filePath) {
  const clean = basename(filePath).replace(/[^\w.\-()\s]/g, "_").replace(/\s+/g, "_");
  return `cpp20218/${assignmentKey}/${role}/${clean}`;
}

function mimeType(path) {
  const ext = extname(path).toLowerCase();
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (ext === ".pptx") return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  return "application/octet-stream";
}

function convertToPdf(inputPath, assignmentKey) {
  if (extname(inputPath).toLowerCase() === ".pdf") return inputPath;
  const outputDir = join(outRoot, assignmentKey);
  mkdirSync(outputDir, { recursive: true });
  const expected = join(outputDir, `${basename(inputPath, extname(inputPath))}.pdf`);
  if (existsSync(expected)) return expected;
  const result = spawnSync(soffice, [
    "--headless",
    "--convert-to",
    "pdf",
    "--outdir",
    outputDir,
    inputPath,
  ], {
    stdio: "inherit",
    timeout: 15 * 60 * 1000,
  });
  if (result.status !== 0 || !existsSync(expected)) {
    throw new Error(`Failed to convert ${inputPath}`);
  }
  return expected;
}

async function upload(localPath, path) {
  const bytes = readFileSync(localPath);
  const { error } = await supabase.storage.from(bucket).upload(path, bytes, {
    contentType: mimeType(localPath),
    upsert: true,
  });
  if (error) throw new Error(`${path}: ${error.message}`);
}

async function upsertResource(row) {
  const { error } = await supabase
    .from("course_assignment_resources")
    .upsert(row, { onConflict: "course_slug,assignment_key,resource_key" });
  if (error) throw new Error(error.message);
}

async function addResource({
  assignment,
  resourceKey,
  audience,
  kind,
  title,
  description,
  relativePath,
  downloadable,
  position,
  uploadOriginal = true,
}) {
  const original = sourcePath(assignment, relativePath);
  if (!existsSync(original)) {
    console.warn(`Skipping missing file: ${original}`);
    return;
  }
  const preview = convertToPdf(original, assignment.key);
  const originalPath = uploadOriginal ? storagePath(assignment.key, audience, original) : null;
  const previewPath = storagePath(assignment.key, `${audience}-preview`, preview);
  if (originalPath) {
    await upload(original, originalPath);
  }
  await upload(preview, previewPath);
  await upsertResource({
    course_slug: courseSlug,
    assignment_key: assignment.key,
    resource_key: resourceKey,
    audience,
    kind,
    title,
    description,
    original_bucket: bucket,
    original_path: originalPath,
    original_mime_type: originalPath ? mimeType(original) : null,
    preview_bucket: bucket,
    preview_path: previewPath,
    preview_mime_type: "application/pdf",
    downloadable,
    position,
    updated_at: new Date().toISOString(),
  });
}

for (const assignment of assignments) {
  console.log(`\nIngesting ${assignment.title}: ${assignment.subtitle}`);
  if (assignment.slides) {
    await addResource({
      assignment,
      resourceKey: "slides",
      audience: "student",
      kind: "slides",
      title: "Introductory slides",
      description: "Preview-only presentation. Download is disabled for this resource.",
      relativePath: assignment.slides,
      downloadable: false,
      position: 1,
      uploadOriginal: false,
    });
  }
  if (assignment.learning) {
    await addResource({
      assignment,
      resourceKey: "learning-resource",
      audience: "student",
      kind: "learning_resource",
      title: "Learning resource",
      description: "Preview the PDF version or download the learner guide.",
      relativePath: assignment.learning,
      downloadable: true,
      position: 2,
    });
  }
  for (const [index, assessment] of (assignment.assessments ?? []).entries()) {
    await addResource({
      assignment,
      resourceKey: index === 0 ? "assessment" : `assessment-${index + 1}`,
      audience: "student",
      kind: "assessment",
      title: index === 0 ? "Assessment workbook" : `Assessment support ${index + 1}`,
      description: "Complete this assessment document and upload your finished file.",
      relativePath: assessment,
      downloadable: true,
      position: 10 + index,
    });
  }
  for (const [index, assessor] of (assignment.assessor ?? []).entries()) {
    await addResource({
      assignment,
      resourceKey: index === 0 ? "assessor-key" : `assessor-key-${index + 1}`,
      audience: "admin",
      kind: "assessor_key",
      title: index === 0 ? "Assessor answer key" : `Assessor support ${index + 1}`,
      description: "Admin-only assessor guide and answer material.",
      relativePath: assessor,
      downloadable: true,
      position: 100 + index,
    });
  }
}

console.log("\nCPP20218 resource ingestion complete.");
