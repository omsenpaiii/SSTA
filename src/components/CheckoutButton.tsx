"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

type CheckoutButtonProps = {
  courseSlug: string;
  className?: string;
  children?: React.ReactNode;
};

export function CheckoutButton({
  courseSlug,
  className,
  children = "Unlock course",
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (response.status === 401) {
        window.location.href = `/sign-in?redirect_url=${encodeURIComponent("/")}`;
        return;
      }

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Unable to start checkout.");
      }

      window.location.href = data.url;
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Unable to start checkout.",
      );
      setIsLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={startCheckout}
        disabled={isLoading}
        className={
          className ??
          "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0067b1] px-5 text-sm font-black text-white transition hover:bg-[#123e95] disabled:cursor-not-allowed disabled:opacity-70"
        }
      >
        {isLoading ? (
          <Loader2 size={17} className="animate-spin" />
        ) : (
          <ArrowRight size={18} />
        )}
        {children}
      </button>
      {error ? (
        <p className="mt-2 text-center text-xs font-bold text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
