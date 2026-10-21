const MAX_BYTES = 50 * 1024 * 1024;
async function readResponse(response: Response) {
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error ?? (response.status === 413 ? "The upload service rejected the file size. Please retry or contact SSTA." : "Upload failed. Check your connection and try again."));
  if (!payload) throw new Error("The upload service returned an unexpected response. Please retry.");
  return payload;
}
export async function uploadAssessmentFile(endpoint: string, file: File, fields: Record<string, string> = {}) {
  if (!file.size || file.size > MAX_BYTES) throw new Error("Choose a non-empty assessment file, 50MB or smaller.");
  const prepare = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...fields, stage: "prepare", fileName: file.name, mimeType: file.type, size: file.size }) });
  const { uploadUrl, receipt } = await readResponse(prepare);
  const upload = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type || "application/octet-stream" }, body: file });
  if (!upload.ok) throw new Error("Your file could not be uploaded. Check your connection and try again.");
  const complete = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...fields, stage: "complete", receipt }) });
  return readResponse(complete);
}
