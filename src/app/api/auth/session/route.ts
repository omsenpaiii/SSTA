import { NextResponse } from "next/server";
import { getCurrentUser, isAdminEmail } from "@/lib/auth";
export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({
    user: user ? { name: user.name, email: user.email, phone: user.phone, initials: user.initials, dashboardHref: isAdminEmail(user.email) ? "/admin" : "/dashboard" } : null,
  });
}
