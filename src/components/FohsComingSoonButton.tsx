"use client";

import { useId, useState } from "react";
import { Clock3 } from "lucide-react";
import { SecurityFlowDialog } from "@/components/SecurityFlowDialog";

export function FohsComingSoonButton({
  className,
  children = "Enquire about FOHS",
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  return (
    <>
      <button type="button" aria-haspopup="dialog" onClick={() => setOpen(true)} className={className ?? "inline-flex rounded-full bg-[#0067b1] px-7 py-4 font-black text-white hover:bg-[#123e95]"}>
        {children}
      </button>
      {open ? (
        <SecurityFlowDialog titleId={titleId} onClose={() => setOpen(false)}>
          <Clock3 aria-hidden="true" className="mb-5 text-[#0067b1]" size={36} />
          <h2 id={titleId} className="text-3xl font-black text-[#020d24]">FOHS website coming soon</h2>
          <p className="mt-4 text-base font-semibold leading-7 text-[#53647c]">The dedicated FOHS website is not live yet. Further course and website details will be shared here when available.</p>
          <button type="button" onClick={() => setOpen(false)} className="mt-7 rounded-full bg-[#0067b1] px-6 py-3 font-black text-white hover:bg-[#123e95]">Close</button>
        </SecurityFlowDialog>
      ) : null}
    </>
  );
}
