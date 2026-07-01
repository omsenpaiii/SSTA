"use client";

import { useState, type ReactNode } from "react";

type SignOutButtonProps = {
  children: ReactNode;
  className?: string;
};

export function SignOutButton({ children, className }: SignOutButtonProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut() {
    if (isSigningOut) return;

    setIsSigningOut(true);

    try {
      const response = await fetch("/auth/sign-out", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });
      const result = (await response.json().catch(() => null)) as {
        redirectUrl?: string;
      } | null;

      window.location.replace(result?.redirectUrl ?? "/sign-in?message=signed-out");
    } catch {
      window.location.replace("/sign-in?message=signed-out");
    }
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={isSigningOut}
      className={className}
    >
      {isSigningOut ? "Signing out..." : children}
    </button>
  );
}
