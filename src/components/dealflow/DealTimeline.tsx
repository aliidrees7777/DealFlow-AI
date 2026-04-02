"use client";

import type { DealData } from "@/types/deal";
import { buildTimeline, formatDisplayDate } from "@/lib/deal-helpers";

type DealTimelineProps = { deal: DealData };

export function DealTimeline({ deal }: DealTimelineProps) {
  const items = buildTimeline(deal);
  if (items.length === 0) return null;

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">Timeline</h3>
      <ul className="relative ml-1 space-y-5 border-l-2 border-slate-200 pl-8">
        {items.map((item, i) => (
          <li key={item.id} className="relative">
            <span
              className={`absolute -left-[25px] top-1.5 block h-3 w-3 rounded-full border-2 border-white shadow-sm ${
                i === items.length - 1 ? "bg-indigo-600" : "bg-slate-300"
              }`}
            />
            <p className="text-sm font-medium text-slate-900">{item.label}</p>
            <p className="text-sm text-slate-600">
              {formatDisplayDate(item.date)}
            </p>
            {item.note && (
              <p className="mt-0.5 text-xs text-slate-500">{item.note}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
