"use client";

import clsx from "clsx";
import { Loader2, Sparkles } from "lucide-react";

const STEPS = [
  "Understanding request...",
  "Extracting deal details...",
  "Preparing deal...",
] as const;

type DealInputProps = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
  loadingStep: number;
};

export function DealInput({
  value,
  onChange,
  onSubmit,
  loading,
  loadingStep,
}: DealInputProps) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60 transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
          <Sparkles className="h-4 w-4" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Deal input</h2>
          <p className="text-xs text-slate-500">
            Natural language → structured deal data
          </p>
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        placeholder='Describe your deal... (e.g., Write a contract for 123 Main St for $450,000 closing April 28)'
        rows={4}
        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60"
      />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading || !value.trim()}
          className={clsx(
            "inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition",
            "hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          )}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Working...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Deal
            </>
          )}
        </button>
        {loading && (
          <p className="flex items-center gap-2 text-sm text-indigo-600 transition-opacity duration-300">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
            {STEPS[Math.min(loadingStep, STEPS.length - 1)]}
          </p>
        )}
      </div>
    </section>
  );
}
