"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";

type AssignmentUnlockPaymentButtonProps = {
  assignmentKey: string;
  enabled: boolean;
};

export function AssignmentUnlockPaymentButton({
  assignmentKey,
  enabled,
}: AssignmentUnlockPaymentButtonProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function startPayment() {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/student/assignments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentKey }),
      });
      const result = (await response.json()) as { url?: string; error?: string; signInUrl?: string };

      if (response.status === 401 && result.signInUrl) {
        window.location.assign(result.signInUrl);
        return;
      }

      if (!response.ok || !result.url) {
        throw new Error(result.error ?? "Unable to start payment.");
      }

      window.location.assign(result.url);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to start payment.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!enabled) {
    return (
      <p className="mt-3 text-sm font-semibold leading-6 text-[#5d7389]">
        Payment gateway integration is almost ready. SSTA will publish access pricing shortly.
      </p>
    );
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={startPayment}
        disabled={isLoading}
        className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-[#0f6eb8] px-4 text-sm font-black text-white shadow-[0_8px_18px_rgba(15,110,184,0.18)] transition hover:bg-[#0b5f9f] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <CreditCard size={16} />
        {isLoading ? "Starting payment..." : "Unlock with Pinch"}
      </button>
      {message ? (
        <p className="mt-2 text-sm font-semibold text-rose-600">{message}</p>
      ) : null}
    </div>
  );
}
