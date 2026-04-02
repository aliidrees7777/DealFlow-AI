"use client";

import { FileSignature, Mail, Send } from "lucide-react";

type ActionButtonsProps = { onAction: (label: string) => void };

export function ActionButtons({ onAction }: ActionButtonsProps) {
  const actions = [
    { label: "Create Contract", icon: FileSignature },
    { label: "Send for Signature", icon: Send },
    { label: "Email Client", icon: Mail },
  ] as const;

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map(({ label, icon: Icon }) => (
        <button
          key={label}
          type="button"
          onClick={() => onAction(label)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        >
          <Icon className="h-4 w-4 text-slate-500" />
          {label}
        </button>
      ))}
    </div>
  );
}
