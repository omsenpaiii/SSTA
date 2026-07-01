import crypto from "node:crypto";
import { getAppUrl } from "@/lib/app-url";

const PINCH_VERSION = "2020.1";

type PinchToken = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

type PinchPayer = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  emailAddress?: string | null;
  email?: string | null;
};

type PinchPaymentLink = {
  id: string;
  url: string;
  amount?: number;
  amountInCents?: number;
  currency?: string;
};

export type PinchPayment = {
  id: string;
  amount: number;
  currency?: string | null;
  status?: string | null;
  description?: string | null;
  metadata?: string | null;
  payer?: {
    id?: string | null;
    email?: string | null;
    emailAddress?: string | null;
  } | null;
};

let cachedToken: { token: string; expiresAt: number } | null = null;

export function isPinchConfigured() {
  return Boolean(process.env.PINCH_CLIENT_ID && process.env.PINCH_SECRET_KEY);
}

export function getPinchApiBaseUrl() {
  const mode = process.env.PINCH_MODE === "live" ? "live" : "test";
  return `https://api.getpinch.com.au/${mode}`;
}

function getPinchCredentials() {
  const clientId = process.env.PINCH_CLIENT_ID;
  const secretKey = process.env.PINCH_SECRET_KEY;

  if (!clientId || !secretKey) {
    throw new Error("Pinch is not configured.");
  }

  return { clientId, secretKey };
}

async function getPinchAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  const { clientId, secretKey } = getPinchCredentials();
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: "api1",
  });

  const response = await fetch("https://auth.getpinch.com.au/connect/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secretKey}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Pinch authentication failed: ${text || response.statusText}`);
  }

  const token = (await response.json()) as PinchToken;
  cachedToken = {
    token: token.access_token,
    expiresAt: Date.now() + token.expires_in * 1000,
  };

  return token.access_token;
}

async function pinchRequest<T>(path: string, init: RequestInit = {}) {
  const token = await getPinchAccessToken();
  const response = await fetch(`${getPinchApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "pinch-version": PINCH_VERSION,
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Pinch API request failed: ${text || response.statusText}`);
  }

  return (await response.json()) as T;
}

function splitName(name: string | null | undefined, email: string) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { firstName: email.split("@")[0] || "Student", lastName: "" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export async function createPinchPayer(input: {
  userKey: string;
  email: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
}) {
  const fallback = splitName(input.name, input.email);
  const firstName = input.firstName || fallback.firstName;
  const lastName = input.lastName ?? fallback.lastName;

  return pinchRequest<PinchPayer>("/payers", {
    method: "POST",
    body: JSON.stringify({
      fullName: input.name || [firstName, lastName].filter(Boolean).join(" "),
      firstName,
      lastName,
      emailAddress: input.email,
      mobileNumber: input.phone ?? undefined,
      metadata: JSON.stringify({ userKey: input.userKey }),
    }),
  });
}

export async function createPinchPaymentLink(input: {
  amountCents: number;
  payerId: string;
  description: string;
  metadata: Record<string, string | number | null | undefined>;
  successPath?: string;
}) {
  const appUrl = getAppUrl();

  return pinchRequest<PinchPaymentLink>("/payment-links", {
    method: "POST",
    body: JSON.stringify({
      amount: input.amountCents,
      payerId: input.payerId,
      description: input.description,
      currency: "AUD",
      allowedPaymentMethods: ["credit-card", "bank-account"],
      returnUrl: `${appUrl}${input.successPath ?? "/success"}`,
      metadata: JSON.stringify(input.metadata),
    }),
  });
}

export async function getPinchPayment(paymentId: string) {
  return pinchRequest<PinchPayment>(`/payments/${encodeURIComponent(paymentId)}`);
}

export function verifyPinchWebhookSignature(input: {
  body: string;
  signature: string | null;
  secret: string | undefined;
  toleranceSeconds?: number;
}) {
  if (!input.signature || !input.secret) return false;

  const parts = input.signature.split(",");
  const timestampPart = parts.find((part) => part.startsWith("t="));
  const timestamp = timestampPart?.replace("t=", "");
  const signatures = parts
    .filter((part) => part.startsWith("v2="))
    .map((part) => part.replace("v2=", ""));

  if (!timestamp || signatures.length === 0) return false;

  const timestampNumber = Number(timestamp);
  const tolerance = input.toleranceSeconds ?? 300;
  const nowSeconds = Math.floor(Date.now() / 1000);

  if (!Number.isFinite(timestampNumber) || Math.abs(nowSeconds - timestampNumber) > tolerance) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", input.secret)
    .update(`${timestamp}.${input.body}`)
    .digest("hex");

  return signatures.some((signature) => {
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    return (
      signatureBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    );
  });
}

export function isPinchPaidStatus(status: string | null | undefined) {
  return ["approved", "settled", "cleared-settlements-disabled", "transferred"].includes(
    (status ?? "").toLowerCase(),
  );
}

export function isPinchFailedStatus(status: string | null | undefined) {
  return ["dishonoured", "cancelled", "returned-without-settlement"].includes(
    (status ?? "").toLowerCase(),
  );
}
