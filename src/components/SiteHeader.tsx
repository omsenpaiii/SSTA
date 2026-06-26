"use client";

import { useEffect, useState } from "react";
import { SiteHeaderClient } from "@/components/SiteHeaderClient";
import { getInitials, isAdminEmail, normalizeEmail } from "@/lib/auth-shared";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { isSupabaseAuthConfigured } from "@/lib/supabase-config";

type HeaderUser = {
  name: string;
  email: string;
  initials: string;
  dashboardHref: string;
};

export function SiteHeader() {
  const [user, setUser] = useState<HeaderUser | null>(null);

  useEffect(() => {
    if (!isSupabaseAuthConfigured()) {
      return;
    }

    const supabase = createBrowserSupabaseClient();

    const readUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser?.email) {
        setUser(null);
        return;
      }

      const email = normalizeEmail(authUser.email);
      const metadata = authUser.user_metadata ?? {};
      const firstName =
        typeof metadata.first_name === "string" ? metadata.first_name : "";
      const lastName =
        typeof metadata.last_name === "string" ? metadata.last_name : "";
      const fullName =
        typeof metadata.full_name === "string"
          ? metadata.full_name
          : [firstName, lastName].filter(Boolean).join(" ") || email.split("@")[0];

      setUser({
        name: fullName,
        email,
        initials: getInitials(fullName, email),
        dashboardHref: isAdminEmail(email) ? "/admin" : "/dashboard",
      });
    };

    void readUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void readUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  return <SiteHeaderClient user={user} />;
}
