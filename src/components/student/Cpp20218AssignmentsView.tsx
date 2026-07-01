"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Download,
  FileCheck2,
  FileText,
  Lock,
  MessageSquareText,
  MonitorPlay,
} from "lucide-react";
import {
  formatAssignmentStatus,
  type AssignmentStatus,
  type CppAssignmentResource,
  type StudentCppAssignment,
} from "@/lib/cpp20218";
import { AssignmentUnlockPaymentButton } from "@/components/student/AssignmentUnlockPaymentButton";
import { AssignmentUploadForm } from "@/components/student/AssignmentUploadForm";

type Cpp20218AssignmentsViewProps = {
  assignments: StudentCppAssignment[];
  mode: "activities" | "resources";
};

type SectionKey = "introduction" | "learning" | "assessment";

const statusStyles: Record<AssignmentStatus, string> = {
  locked: "bg-slate-100 text-slate-600",
  not_submitted: "bg-[#eef5ff] text-[#0f6eb8]",
  submitted: "bg-[#fff2e8] text-[#f97316]",
  satisfactory: "bg-emerald-50 text-emerald-700",
  not_satisfactory: "bg-rose-50 text-rose-700",
};

const sectionCopy: Record<SectionKey, { title: string; description: string; icon: typeof MonitorPlay }> = {
  introduction: {
    title: "Introduction",
    description: "Preview the cluster slide deck. This presentation is view-only.",
    icon: MonitorPlay,
  },
  learning: {
    title: "Learning Resource",
    description: "Read the learner guide online, or download the PDF or Word version.",
    icon: FileText,
  },
  assessment: {
    title: "Assessment",
    description: "Preview the assessment workbook, download it, then upload your completed work.",
    icon: FileCheck2,
  },
};

function clusterLabel(assignment: StudentCppAssignment) {
  return `Cluster ${assignment.position}`;
}

function assignmentPaymentsEnabled() {
  const amount = Number(process.env.CPP20218_ASSIGNMENT_UNLOCK_AMOUNT_CENTS ?? 0);
  return Number.isFinite(amount) && amount > 0;
}

function resourcesFor(assignment: StudentCppAssignment, key: SectionKey) {
  if (key === "introduction") {
    return assignment.resources.filter((resource) => resource.kind === "slides");
  }

  if (key === "learning") {
    return assignment.resources.filter((resource) => resource.kind === "learning_resource");
  }

  return assignment.resources.filter((resource) => resource.kind === "assessment");
}

function PreviewFrame({ resource }: { resource: CppAssignmentResource }) {
  if (!resource.preview_path) {
    return (
      <div className="rounded-xl border border-dashed border-[#cbd8e6] bg-[#fbfdff] p-5 text-sm font-semibold text-[#5d7389]">
        Preview is being prepared for this resource.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#dbe3ec] bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-[#edf3f8] px-4 py-3">
        <div>
          <h5 className="text-sm font-black text-[#081221]">{resource.title}</h5>
          <p className="mt-1 text-xs font-bold text-[#6b7f95]">
            {resource.kind === "slides" ? "Preview only" : "PDF preview"}
          </p>
        </div>
        <Link
          href={`/api/student/resources/${resource.id}?mode=preview`}
          target="_blank"
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#dbe3ec] bg-white px-3 text-xs font-black text-[#0f6eb8]"
        >
          Open
          <ArrowRight size={14} />
        </Link>
      </div>
      <iframe
        title={`${resource.title} preview`}
        src={`/api/student/resources/${resource.id}?mode=preview#toolbar=0&navpanes=0`}
        className="h-[520px] w-full bg-[#f8fbfe]"
      />
    </div>
  );
}

function DownloadButtons({ resource }: { resource: CppAssignmentResource }) {
  if (!resource.downloadable) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {resource.preview_path ? (
        <Link
          href={`/api/student/resources/${resource.id}?mode=download&format=pdf`}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0f6eb8] px-3 text-sm font-black text-white"
        >
          <Download size={15} />
          PDF
        </Link>
      ) : null}
      {resource.original_path ? (
        <Link
          href={`/api/student/resources/${resource.id}?mode=download&format=docx`}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#dbe3ec] bg-white px-3 text-sm font-black text-[#0f6eb8]"
        >
          <Download size={15} />
          Word
        </Link>
      ) : null}
    </div>
  );
}

function LockedPanel({ assignment }: { assignment: StudentCppAssignment }) {
  return (
    <div className="rounded-xl border border-dashed border-[#cbd8e6] bg-[#fbfdff] p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          <Lock size={18} />
        </span>
        <div>
          <h4 className="text-base font-black text-[#081221]">Payment gateway integration coming soon</h4>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#5d7389]">
            {assignment.lockReason ??
              "This cluster is locked for now. SSTA will enable payment and unlock access shortly."}
          </p>
          <AssignmentUnlockPaymentButton
            assignmentKey={assignment.assignmentKey}
            enabled={assignmentPaymentsEnabled()}
          />
        </div>
      </div>
    </div>
  );
}

function SubmissionPanel({ assignment }: { assignment: StudentCppAssignment }) {
  const submission = assignment.submission;

  return (
    <div className="space-y-4">
      {submission ? (
        <div className="rounded-xl border border-[#dbe3ec] bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-black text-[#081221]">Latest submission</p>
              <p className="mt-1 text-sm font-semibold text-[#5d7389]">{submission.file_name}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#8ca0b3]">
                {submission.resubmission_count ? `Resubmission ${submission.resubmission_count}` : "First submission"}
              </p>
            </div>
            <span className={`rounded-lg px-3 py-2 text-xs font-black ${statusStyles[assignment.status]}`}>
              {formatAssignmentStatus(assignment.status)}
            </span>
          </div>

          {submission.student_comment ? (
            <div className="mt-4 rounded-xl bg-[#fbfdff] p-4">
              <p className="inline-flex items-center gap-2 text-sm font-black text-[#081221]">
                <MessageSquareText size={16} />
                Your note
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#5d7389]">
                {submission.student_comment}
              </p>
            </div>
          ) : null}

          {submission.admin_comment ? (
            <div className="mt-4 rounded-xl bg-[#eef5ff] p-4">
              <p className="text-sm font-black text-[#081221]">Assessor comments</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#5d7389]">
                {submission.admin_comment}
              </p>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[#cbd8e6] bg-[#fbfdff] p-4 text-sm font-semibold text-[#5d7389]">
          No assessment has been submitted for this cluster yet.
        </div>
      )}

      <AssignmentUploadForm
        assignmentKey={assignment.assignmentKey}
        hasSubmission={Boolean(submission)}
      />
    </div>
  );
}

function ClusterSection({
  assignment,
  sectionKey,
  open,
  onToggle,
}: {
  assignment: StudentCppAssignment;
  sectionKey: SectionKey;
  open: boolean;
  onToggle: () => void;
}) {
  const copy = sectionCopy[sectionKey];
  const Icon = copy.icon;
  const resources = resourcesFor(assignment, sectionKey);

  return (
    <section className="overflow-hidden rounded-xl border border-[#dbe3ec] bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-[#fbfdff]"
      >
        <span className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#eef5ff] text-[#0f6eb8]">
            <Icon size={18} />
          </span>
          <span>
            <span className="block text-base font-black text-[#081221]">{copy.title}</span>
            <span className="mt-1 block text-sm font-semibold leading-6 text-[#5d7389]">
              {copy.description}
            </span>
          </span>
        </span>
        <ChevronDown
          size={20}
          className={`shrink-0 text-[#6b7f95] transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="space-y-5 border-t border-[#edf3f8] bg-[#fbfdff] p-5">
          {resources.length ? (
            resources.map((resource) => (
              <div key={resource.id} className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-black text-[#081221]">{resource.title}</h4>
                    <p className="mt-1 text-sm font-semibold leading-6 text-[#5d7389]">
                      {resource.description || "Open this resource to support your assessment work."}
                    </p>
                  </div>
                  <DownloadButtons resource={resource} />
                </div>
                <PreviewFrame resource={resource} />
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-[#cbd8e6] bg-white p-5 text-sm font-semibold text-[#5d7389]">
              This section is being prepared.
            </div>
          )}

          {sectionKey === "assessment" ? <SubmissionPanel assignment={assignment} /> : null}
        </div>
      ) : null}
    </section>
  );
}

export function Cpp20218AssignmentsView({
  assignments,
}: Cpp20218AssignmentsViewProps) {
  const initialAssignment = useMemo(
    () => assignments.find((assignment) => assignment.unlocked) ?? assignments[0],
    [assignments],
  );
  const [selectedKey, setSelectedKey] = useState(initialAssignment?.assignmentKey ?? "");
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    introduction: false,
    learning: false,
    assessment: false,
  });

  const selected =
    assignments.find((assignment) => assignment.assignmentKey === selectedKey) ??
    initialAssignment;
  const unlocked = assignments.filter((assignment) => assignment.unlocked).length;
  const satisfactory = assignments.filter((assignment) => assignment.status === "satisfactory").length;
  const submitted = assignments.filter((assignment) =>
    ["submitted", "satisfactory", "not_satisfactory"].includes(assignment.status),
  ).length;

  if (!selected) {
    return (
      <div className="mt-6 rounded-xl border border-dashed border-[#cbd8e6] bg-[#fbfdff] p-6 text-sm font-semibold text-[#5d7389]">
        CPP20218 cluster content is being prepared.
      </div>
    );
  }

  function toggleSection(sectionKey: SectionKey) {
    setOpenSections((current) => ({
      ...current,
      [sectionKey]: !current[sectionKey],
    }));
  }

  return (
    <div className="mt-6 space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Clusters", value: assignments.length },
          { label: "Unlocked", value: unlocked },
          { label: "Submitted", value: submitted },
          { label: "Satisfactory", value: satisfactory },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-[#dbe3ec] bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#6b7f95]">{item.label}</p>
            <p className="mt-2 text-3xl font-black text-[#081221]">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 2xl:grid-cols-[260px_1fr]">
        <aside className="rounded-xl border border-[#dbe3ec] bg-white p-3">
          <p className="px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#6b7f95]">
            CPP20218 clusters
          </p>
          <div className="mt-2 space-y-2">
            {assignments.map((assignment) => {
              const active = assignment.assignmentKey === selected.assignmentKey;
              return (
                <button
                  key={assignment.assignmentKey}
                  type="button"
                  onClick={() => setSelectedKey(assignment.assignmentKey)}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                    active
                      ? "border-[#0f6eb8] bg-[#eef5ff]"
                      : "border-transparent bg-white hover:border-[#dbe3ec] hover:bg-[#fbfdff]"
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-black text-[#081221]">{clusterLabel(assignment)}</span>
                    {assignment.unlocked ? (
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    ) : (
                      <Lock size={15} className="text-[#94a3b8]" />
                    )}
                  </span>
                  <span className="mt-1 line-clamp-2 block text-xs font-bold leading-5 text-[#5d7389]">
                    {assignment.subtitle}
                  </span>
                  <span className={`mt-3 inline-flex rounded-lg px-2 py-1 text-[11px] font-black ${statusStyles[assignment.status]}`}>
                    {formatAssignmentStatus(assignment.status)}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <article className="rounded-xl border border-[#dbe3ec] bg-white shadow-[0_10px_28px_rgba(15,23,42,0.04)]">
          <header className="border-b border-[#edf3f8] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0f6eb8]">
                  {clusterLabel(selected)}
                </p>
                <h3 className="mt-2 text-3xl font-black tracking-tight text-[#081221]">
                  {selected.subtitle}
                </h3>
                <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#5d7389]">
                  {selected.overview}
                </p>
              </div>
              <span className={`inline-flex rounded-lg px-3 py-2 text-xs font-black ${statusStyles[selected.status]}`}>
                {formatAssignmentStatus(selected.status)}
              </span>
            </div>
          </header>

          <div className="space-y-4 p-5">
            {!selected.unlocked ? (
              <LockedPanel assignment={selected} />
            ) : (
              <>
                {(["introduction", "learning", "assessment"] as SectionKey[]).map((sectionKey) => (
                  <ClusterSection
                    key={sectionKey}
                    assignment={selected}
                    sectionKey={sectionKey}
                    open={openSections[sectionKey]}
                    onToggle={() => toggleSection(sectionKey)}
                  />
                ))}
              </>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
