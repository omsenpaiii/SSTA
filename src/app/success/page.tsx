import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { fulfillStripeCheckoutSessionId } from "@/lib/payment-fulfillment";

type SuccessPageProps = {
  searchParams?: Promise<{
    session_id?: string;
    course?: string;
  }>;
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const sessionId = params?.session_id;
  let message =
    "Stripe will confirm the payment and unlock access in your student dashboard.";

  if (sessionId) {
    try {
      const result = await fulfillStripeCheckoutSessionId(sessionId);
      message = result.fulfilled
        ? "Your Stripe payment has been confirmed and access has been updated."
        : "Your payment is being processed by Stripe. Access will update automatically after confirmation.";
    } catch {
      message =
        "Your payment was received by Stripe. Access will update once the webhook confirms it.";
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef8ff] px-5">
      <div className="max-w-xl rounded-[1.5rem] bg-white p-8 text-center shadow-[0_24px_70px_rgba(0,74,143,0.12)]">
        <CheckCircle2 className="mx-auto mb-4 text-emerald-600" size={42} />
        <h1 className="text-4xl font-black text-[#020d24]">Payment received</h1>
        <p className="mt-4 font-bold leading-7 text-[#53647c]">
          {message}
        </p>
        <Link
          href="/dashboard"
          className="mt-7 inline-flex rounded-full bg-[#0067b1] px-6 py-3 text-sm font-black text-white"
        >
          Go to dashboard
        </Link>
      </div>
    </main>
  );
}
