import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isClerkConfigured } from "@/lib/clerk";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!isClerkConfigured()) {
    redirect("/");
  }

  const user = await currentUser();

  if (!user) {
    redirect("/sign-in?redirect_url=/admin");
  }

  const allowedEmails = (process.env.SSTA_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const userEmail = user.primaryEmailAddress?.emailAddress?.toLowerCase();

  if (!userEmail || !allowedEmails.includes(userEmail)) {
    redirect("/");
  }

  return children;
}
