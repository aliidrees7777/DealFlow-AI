"use client";

import { HelpCircle } from "lucide-react";
import type { DealData } from "@/types/deal";

type FollowUpQuestionsProps = {
  missing: ("buyer_name" | "closing_date")[];
  draft: Partial<Pick<DealData, "buyer_name" | "closing_date">>;
  onDraftChange: (field: "buyer_name" | "closing_date", value: string) => void;
  onApply: () => void;
};

const labels: Record<"buyer_name" | "closing_date", string> = {
  buyer_name: "Who is the buyer?",
  closing_date: "What is the closing date? (YYYY-MM-DD or e.g. May 15, 2026)",
};

export function FollowUpQuestions({
  missing,
  draft,
  onDraftChange,
  onApply,
}: FollowUpQuestionsProps) {
  if (missing.length === 0) return null;

  return (
    <section className="rounded-2xl border border-amber-200/90 bg-amber-50/80 p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-amber-900">
        <HelpCircle className="h-4 w-4 shrink-0" />
        <h3 className="text-sm font-semibold">A few quick details</h3>
      </div>
      <div className="space-y-3">
        {missing.map((field) => (
          <div key={field}>
            <label className="mb-1 block text-xs font-medium text-amber-900/80">
              {labels[field]}
            </label>
            <input
              type="text"
              value={draft[field] ?? ""}
              onChange={(e) => onDraftChange(field, e.target.value)}
              className="w-full rounded-lg border border-amber-200/90 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onApply}
        className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1"
      >
        Update deal
      </button>
    </section>
  );
}
