export function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? "";
}

export function getInitials(name: string, email: string) {
  const source = name.trim() || email.split("@")[0] || "SSTA";
  const parts = source.split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : source.slice(0, 2)).toUpperCase();
}

export function manualStudentKey(email: string) {
  return `manual:${normalizeEmail(email)}`;
}

export function getSafeRedirectPath(value: string | null | undefined, fallback = "/dashboard") {
  if (!value?.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }

  try {
    const url = new URL(value, "https://ssta.local");
    return url.origin === "https://ssta.local" ? `${url.pathname}${url.search}${url.hash}` : fallback;
  } catch {
    return fallback;
  }
}

export function getAdminEmails() {
  return (process.env["SSTA_ADMIN_EMAILS"] ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined, allowedEmails = getAdminEmails()) {
  const normalized = normalizeEmail(email);
  return Boolean(normalized && allowedEmails.includes(normalized));
}
