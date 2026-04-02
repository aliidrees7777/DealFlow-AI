"use client";

import clsx from "clsx";
import { Bot, Loader2, Send } from "lucide-react";
import type { ChatMessage } from "@/types/deal";

type AssistantChatProps = {
  messages: ChatMessage[];
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  loading: boolean;
  /** When false, chat is disabled until a deal exists. */
  hasDeal: boolean;
};

export function AssistantChat({
  messages,
  input,
  onInputChange,
  onSend,
  loading,
  hasDeal,
}: AssistantChatProps) {
  return (
    <aside className="flex h-full min-h-[420px] flex-col rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/60 lg:min-h-[calc(100vh-8rem)]">
      <div className="border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Assistant</h2>
            <p className="text-xs text-slate-500">Context-aware on this deal</p>
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
        {!hasDeal && messages.length === 0 && (
          <p className="mr-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-3 py-3 text-sm text-slate-600">
            Generate a deal above to chat with full context on that transaction.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={clsx(
              "rounded-xl px-3 py-2 text-sm leading-relaxed transition-opacity",
              m.role === "user"
                ? "ml-4 bg-indigo-600 text-white"
                : "mr-4 border border-slate-100 bg-slate-50 text-slate-800"
            )}
          >
            {m.role === "assistant" && (
              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Coordinator
              </span>
            )}
            <div className="whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="mr-4 flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Thinking...
          </div>
        )}
      </div>
      <div className="border-t border-slate-100 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !e.shiftKey && hasDeal && onSend()
            }
            disabled={!hasDeal || loading}
            placeholder="e.g. What am I missing?"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={!hasDeal || loading || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-700 disabled:bg-slate-300"
            aria-label="Send"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          Try: “Summarize this deal” · “Write email to lender”
        </p>
      </div>
    </aside>
  );
}
