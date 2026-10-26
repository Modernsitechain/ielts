import type { TestStatus } from "@/core/models/test";

export function StatusBadge({ status }: { status: TestStatus }) {
  return status === "published" ? (
    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
      Published
    </span>
  ) : (
    <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700">
      Draft
    </span>
  );
}
