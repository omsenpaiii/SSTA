import Link from "next/link";
import {
  ArrowRight,
  Download,
  FileCheck2,
  FileText,
  Lock,
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

const statusStyles: Record<AssignmentStatus, string> = {
  locked: "bg-slate-100 text-slate-600",
  not_submitted: "bg-[#eef5ff] text-[#0f6eb8]",
  submitted: "bg-[#fff2e8] text-[#f97316]",
  satisfactory: "bg-emerald-50 text-emerald-700",
  not_satisfactory: "bg-rose-50 text-rose-700",
};

function resourceIcon(kind: CppAssignmentResource["kind"]) {
  if (kind === "slides") return MonitorPlay;
  if (kind === "assessment") return FileCheck2;
  return FileText;
}

function ResourceActions({ resource }: { resource: CppAssignmentResource }) {
  return (
    <div className="flex flex-wrap gap-2">
      {resource.preview_path ? (
        <Link
          href={`/api/student/resources/${resource.id}?mode=preview`}
          target="_blank"
          className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-[#0f6eb8] px-3 text-sm font-black text-white"
        >
          Preview
          <ArrowRight size={15} />
        </Link>
      ) : null}
      {resource.downloadable && resource.original_path ? (
        <Link
          href={`/api/student/resources/${resource.id}?mode=download`}
          className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-[#dbe3ec] bg-white px-3 text-sm font-black text-[#0f6eb8]"
        >
          <Download size={15} />
          Download
        </Link>
      ) : null}
    </div>
  );
}

function assignmentPaymentsEnabled() {
  const amount = Number(process.env.CPP20218_ASSIGNMENT_UNLOCK_AMOUNT_CENTS ?? 0);
  return Number.isFinite(amount) && amount > 0;
}

function LockedPanel({ assignment }: { assignment: StudentCppAssignment }) {
  return (
    <div className="rounded-[8px] border border-dashed border-[#cbd8e6] bg-[#fbfdff] p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-slate-100 text-slate-500">
          <Lock size={18} />
        </span>
        <div>
          <h4 className="text-base font-black text-[#081221]">Payment gateway integration coming soon</h4>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#5d7389]">
            {assignment.lockReason ??
              "This assignment is locked for now. SSTA will enable payment and unlock access shortly."}
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

function AssignmentCard({ assignment, mode }: { assignment: StudentCppAssignment; mode: "activities" | "resources" }) {
  const learningResources = assignment.resources.filter((resource) => resource.kind !== "assessment");
  const assessments = assignment.resources.filter((resource) => resource.kind === "assessment");

  return (
    <article className="rounded-[8px] border border-[#dbe3ec] bg-white shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-4 border-b border-[#e5edf5] px-5 py-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0f6eb8]">
            {assignment.title}
          </p>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-[#081221]">
            {assignment.subtitle}
          </h3>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[#5d7389]">
            {assignment.overview}
          </p>
        </div>
        <span className={`inline-flex w-fit rounded-[8px] px-3 py-2 text-xs font-black ${statusStyles[assignment.status]}`}>
          {formatAssignmentStatus(assignment.status)}
        </span>
      </div>

      <div className="space-y-4 p-5">
        {!assignment.unlocked ? (
          <LockedPanel assignment={assignment} />
        ) : mode === "resources" ? (
          <div className="grid gap-3">
            {learningResources.map((resource) => {
              const Icon = resourceIcon(resource.kind);
              return (
                <div
                  key={resource.id}
                  className="grid gap-4 rounded-[8px] border border-[#e5edf5] bg-[#fbfdff] p-4 lg:grid-cols-[44px_1fr_auto] lg:items-center"
                >
                  <span className="flex size-11 items-center justify-center rounded-[8px] bg-[#eef5ff] text-[#0f6eb8]">
                    <Icon size={20} />
                  </span>
                  <div>
                    <h4 className="text-base font-black text-[#081221]">{resource.title}</h4>
                    <p className="mt-1 text-sm font-semibold leading-6 text-[#5d7389]">
                      {resource.description || "Open this resource to support your assessment work."}
                    </p>
                  </div>
                  <ResourceActions resource={resource} />
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <div className="grid gap-3">
              {assessments.map((resource) => (
                <div
                  key={resource.id}
                  className="grid gap-4 rounded-[8px] border border-[#e5edf5] bg-[#fbfdff] p-4 lg:grid-cols-[44px_1fr_auto] lg:items-center"
                >
                  <span className="flex size-11 items-center justify-center rounded-[8px] bg-[#fff2e8] text-[#f97316]">
                    <FileCheck2 size={20} />
                  </span>
                  <div>
                    <h4 className="text-base font-black text-[#081221]">{resource.title}</h4>
                    <p className="mt-1 text-sm font-semibold leading-6 text-[#5d7389]">
                      Preview, download, complete, and upload your latest assessment workbook.
                    </p>
                  </div>
                  <ResourceActions resource={resource} />
                </div>
              ))}
            </div>

            {assignment.submission ? (
              <div className="rounded-[8px] border border-[#dbe3ec] bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-[#081221]">Latest submission</p>
                    <p className="mt-1 text-sm font-semibold text-[#5d7389]">
                      {assignment.submission.file_name}
                    </p>
                  </div>
                  <span className={`rounded-[8px] px-3 py-2 text-xs font-black ${statusStyles[assignment.status]}`}>
                    {formatAssignmentStatus(assignment.status)}
                  </span>
                </div>
                {assignment.submission.admin_comment ? (
                  <div className="mt-4 rounded-[8px] bg-[#eef5ff] p-4">
                    <p className="text-sm font-black text-[#081221]">Trainer comments</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-[#5d7389]">
                      {assignment.submission.admin_comment}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}

            <AssignmentUploadForm
              assignmentKey={assignment.assignmentKey}
              hasSubmission={Boolean(assignment.submission)}
            />
          </>
        )}
      </div>
    </article>
  );
}

export function Cpp20218AssignmentsView({
  assignments,
  mode,
}: Cpp20218AssignmentsViewProps) {
  const unlocked = assignments.filter((assignment) => assignment.unlocked).length;
  const satisfactory = assignments.filter((assignment) => assignment.status === "satisfactory").length;

  return (
    <div className="mt-6 space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Assignments", value: assignments.length },
          { label: "Unlocked", value: unlocked },
          { label: "Satisfactory", value: satisfactory },
        ].map((item) => (
          <div key={item.label} className="rounded-[8px] border border-[#dbe3ec] bg-white p-4">
            <p className="text-sm font-semibold text-[#5d7389]">{item.label}</p>
            <p className="mt-2 text-3xl font-black text-[#081221]">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {assignments.map((assignment) => (
          <AssignmentCard
            key={assignment.assignmentKey}
            assignment={assignment}
            mode={mode}
          />
        ))}
      </div>
    </div>
  );
}
