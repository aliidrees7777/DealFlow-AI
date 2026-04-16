"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ChatMessage, DealData } from "@/types/deal";
import { normalizeClosingInput } from "@/lib/closing-input";
import {
  getMissingCriticalFields,
  titleCasePersonName,
} from "@/lib/deal-helpers";
import { ActionButtons } from "./ActionButtons";
import { AssistantChat } from "./AssistantChat";
import { ContractPreview } from "./ContractPreview";
import { DealDashboard } from "./DealDashboard";
import { DealInput } from "./DealInput";
import { DealTimeline } from "./DealTimeline";
import { FollowUpQuestions } from "./FollowUpQuestions";
import Header from "../layout/Header";

const CHAT_INITIAL_AFTER_DEAL = (): ChatMessage[] => [
  {
    id: `welcome-${Date.now()}`,
    role: "assistant",
    content:
      "Your deal is ready. Let me know if you want to check anything, draft an email, or review next steps.",
  },
];

export function DealflowApp() {
  const [dealInput, setDealInput] = useState("");
  const [dealData, setDealData] = useState<DealData | null>(null);
  const dealDataRef = useRef<DealData | null>(null);
  dealDataRef.current = dealData;

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [followDraft, setFollowDraft] = useState<
    Partial<Pick<DealData, "buyer_name" | "closing_date">>
  >({});
  const [toast, setToast] = useState<string | null>(null);
  const stepTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [stepQuestion, setStepQuestion] = useState<string | null>(null);
const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!loading) {
      setLoadingStep(0);
      if (stepTimer.current) {
        clearInterval(stepTimer.current);
        stepTimer.current = null;
      }
      return;
    }
    stepTimer.current = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, 2));
    }, 550);
    return () => {
      if (stepTimer.current) clearInterval(stepTimer.current);
    };
  }, [loading]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const generateDeal = useCallback(async () => {
    if (!dealInput.trim()) return;
    setLoading(true);
    setLoadingStep(0);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: dealInput }),
      });
      const data = await res.json();
      if (data.deal) {
        const next = data.deal as DealData;
        setDealData(next);
        dealDataRef.current = next;
        setFollowDraft({});
        setChatMessages(CHAT_INITIAL_AFTER_DEAL());
        setChatInput("");
      }
    } finally {
      setLoading(false);
    }
  }, [dealInput]);

  const missing = useMemo(
    () => (dealData ? getMissingCriticalFields(dealData) : []),
    [dealData]
  );

  const applyFollowUp = useCallback(() => {
    if (!dealData) return;
    const next = { ...dealData };
    if (missing.includes("buyer_name") && followDraft.buyer_name?.trim()) {
      next.buyer_name = titleCasePersonName(followDraft.buyer_name.trim());
    }
    if (missing.includes("closing_date") && followDraft.closing_date) {
      const parsed = normalizeClosingInput(followDraft.closing_date);
      if (parsed) next.closing_date = parsed;
    }
    setDealData(next);
    dealDataRef.current = next;
    setFollowDraft({});
  }, [dealData, missing, followDraft]);

  const sendChat = useCallback(async () => {
    const q = chatInput.trim();
    if (!q || chatLoading) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: q,
    };
    setChatMessages((m) => [...m, userMsg]);
    setChatInput("");
    setChatLoading(true);
    const snapshot = dealDataRef.current;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, deal: snapshot }),
      });
      const data = await res.json();
      const reply =
        typeof data.reply === "string"
          ? data.reply
          : "Sorry, something went wrong.";
      setChatMessages((m) => [
        ...m,
        { id: `a-${Date.now()}`, role: "assistant", content: reply },
      ]);
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatLoading]);

  const onMockAction = useCallback((label: string) => {
    setToast(`Action completed (mock): ${label}`);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/90">
    <Header/>

      <div className="mx-auto flex max-w-[1400px] flex-col gap-6 px-4 py-6 lg:flex-row lg:items-start lg:gap-8 lg:px-6">
        <main className="min-w-0 flex-1 space-y-6 transition-all duration-300">
          <DealInput
            value={dealInput}
            onChange={setDealInput}
            onSubmit={generateDeal}
            loading={loading}
            loadingStep={loadingStep}
          />

          {dealData && (
            <>
              <FollowUpQuestions
                missing={missing}
                draft={followDraft}
                onDraftChange={(field, value) =>
                  setFollowDraft((d) => ({ ...d, [field]: value }))
                }
                onApply={applyFollowUp}
              />
              <div className="space-y-6 transition-opacity duration-500">
                <DealDashboard deal={dealData} />
                <DealTimeline deal={dealData} />
                <ContractPreview deal={dealData} />
                <ActionButtons onAction={onMockAction} />
              </div>
            </>
          )}
        </main>

        <div className="w-full shrink-0 lg:w-[380px] lg:sticky lg:top-6">
          <AssistantChat
            messages={chatMessages}
            input={chatInput}
            onInputChange={setChatInput}
            onSend={sendChat}
            loading={chatLoading}
            hasDeal={!!dealData}
          />
        </div>
      </div>

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-slate-200 bg-slate-900 px-4 py-3 text-sm text-white shadow-lg transition-opacity duration-200"
          role="status"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

export default DealflowApp;
