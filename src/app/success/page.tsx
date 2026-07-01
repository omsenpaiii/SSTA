import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { fulfillPinchPayment } from "@/lib/payment-fulfillment";

type SuccessPageProps = {
  searchParams?: Promise<{
    paymentId?: string;
    paymentLinkId?: string;
    PaymentId?: string;
    PaymentLinkId?: string;
  }>;
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const paymentId = params?.paymentId ?? params?.PaymentId;
  const paymentLinkId = params?.paymentLinkId ?? params?.PaymentLinkId;
  let message =
    "Pinch will confirm the payment and unlock access in your student dashboard.";

  if (paymentId) {
    try {
      const result = await fulfillPinchPayment({ paymentId, paymentLinkId });
      message = result.fulfilled
        ? "Your Pinch payment has been confirmed and access has been updated."
        : "Your payment is being processed by Pinch. Access will update automatically after confirmation.";
    } catch {
      message =
        "Your payment was received by Pinch. Access will update once the webhook confirms it.";
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
