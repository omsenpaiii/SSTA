export function normalizeAustralianPhone(value: string | null | undefined) {
  const raw = (value ?? "").trim();
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("61") && digits.length === 11) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 10) return `+61${digits.slice(1)}`;
  if (digits.length === 9) return `+61${digits}`;
  return "";
}

export function manualPhoneStudentKey(phone: string) {
  return `manual:phone:${normalizeAustralianPhone(phone)}`;
}
