"use client";

import { useEffect, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

type ReCaptchaFieldProps = {
  error?: string;
  onChange: (token: string) => void;
  resetKey?: number;
};

export function ReCaptchaField({
  error,
  onChange,
  resetKey = 0,
}: ReCaptchaFieldProps) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);
  const onChangeRef = useRef(onChange);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    recaptchaRef.current?.reset();
    onChangeRef.current("");
  }, [resetKey]);

  if (!siteKey) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
        Google reCAPTCHA is not configured yet. Add
        {" "}
        <code>NEXT_PUBLIC_RECAPTCHA_SITE_KEY</code>
        {" "}
        to enable this form.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="w-fit max-w-full rounded-2xl border border-slate-200 bg-white p-3">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={siteKey}
          size="compact"
          onChange={(value) => {
            setLoadError(false);
            onChangeRef.current(value ?? "");
          }}
          onExpired={() => onChangeRef.current("")}
          onErrored={() => {
            onChangeRef.current("");
            setLoadError(true);
          }}
        />
      </div>
      {loadError ? (
        <p role="alert" className="text-sm font-bold text-red-600">
          The security check could not load. Check your connection, then{" "}
          <button type="button" className="underline" onClick={() => {
            recaptchaRef.current?.reset();
            setLoadError(false);
          }}>try again</button>.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm font-bold text-red-500">{error}</p>
      ) : null}
    </div>
  );
}
