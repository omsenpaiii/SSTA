"use client";
import { useEffect, useRef } from "react";

export function SecurityFlowDialog({
  titleId,
  onClose,
  children,
}: {
  titleId: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={onClose}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2.5rem)] max-w-lg overflow-auto rounded-2xl bg-white p-8 shadow-xl backdrop:bg-slate-950/60"
    >
      {children}
    </dialog>
  );
}
