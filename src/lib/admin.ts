import { currentUser } from "@clerk/nextjs/server";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  initials: string;
};

export function getAdminEmails() {
  return (process.env.SSTA_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function getInitials(name: string, email: string) {
  const source = name.trim() || email.split("@")[0] || "Admin";
  const parts = source.split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : source.slice(0, 2)).toUpperCase();
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const email = user.primaryEmailAddress?.emailAddress?.toLowerCase();
  const allowedEmails = getAdminEmails();

  if (!email || !allowedEmails.includes(email)) {
    return null;
  }

  const name = user.fullName ?? user.firstName ?? "SSTA Admin";

  return {
    id: user.id,
    name,
    email,
    initials: getInitials(name, email),
  };
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    throw new Error("Unauthorized admin request.");
  }

  return admin;
}

export function manualStudentKey(email: string) {
  return `manual:${email.trim().toLowerCase()}`;
}
