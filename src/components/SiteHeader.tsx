"use client";

import { useEffect, useState } from "react";
import { SiteHeaderClient } from "@/components/SiteHeaderClient";

type HeaderUser = {
  name: string;
  email: string;
  phone: string | null;
  initials: string;
  dashboardHref: string;
};

export type EnrolmentFormAccess = {
  unlocked: boolean;
  amountCents: number;
  destinationHref: string;
  eligibleCourses: Array<{
    slug: string;
    title: string;
    applicationStatus: "draft" | "submitted" | "changes_requested" | "approved" | null;
  }>;
};

const lockedEnrolmentForm: EnrolmentFormAccess = {
  unlocked: false,
  amountCents: 15_000,
  destinationHref: "/enrolment-application",
  eligibleCourses: [],
};

export function SiteHeader() {
  const [user, setUser] = useState<HeaderUser | null>(null);
  const [enrolmentForm, setEnrolmentForm] = useState<EnrolmentFormAccess>(lockedEnrolmentForm);

  useEffect(() => {
    const readUser = async () => {
      const response = await fetch("/api/auth/session", {
        cache: "no-store",
      });

      if (!response.ok) {
        setUser(null);
        setEnrolmentForm(lockedEnrolmentForm);
        return;
      }

      const data = (await response.json()) as {
        user?: HeaderUser | null;
        enrolmentForm?: EnrolmentFormAccess;
      };
      setUser(data.user ?? null);
      setEnrolmentForm(data.enrolmentForm ?? lockedEnrolmentForm);
    };

    void readUser();
  }, []);

  return <SiteHeaderClient user={user} enrolmentForm={enrolmentForm} />;
}
