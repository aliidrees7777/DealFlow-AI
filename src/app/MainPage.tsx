"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";

import Sidebar from "@/components/layout/Sidebar";
import { DealInput } from "@/components/deal/DealInput";
import { ContractPreview } from "@/components/deal/ContractPreview";
import DealDashboard from "@/components/deal/DealDashboard";
import MasterDashboard from "@/components/deal/MasterDashboard";
import { motion, AnimatePresence } from "framer-motion";
import type { ChatMessage, DealData } from "@/types/deal";
import { DealTimeline } from "@/components/deal/DealTimeline";

// ── Animated typing dots ─────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-primary/40 backdrop-blur-md border border-white/5 px-5 py-4 rounded-[1.5rem] rounded-tl-none flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 bg-secondary/60 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 150}ms`, animationDuration: "900ms" }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [dealData, setDealData] = useState<DealData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const dealDataRef = useRef<DealData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  dealDataRef.current = dealData;

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const addAssistantMessage = useCallback((content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `a-${Date.now()}-${Math.random()}`, role: "assistant", content },
    ]);
  }, []);

  const handleGeneralChat = useCallback(async (text: string) => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, deal: dealDataRef.current }),
      });
      const data = await res.json();
      addAssistantMessage(data.reply);
    } catch {
      addAssistantMessage("Sorry, I had trouble processing that. Please try again.");
    }
  }, [addAssistantMessage]);

  // Persist deal across refreshes
  useEffect(() => {
    if (dealData) localStorage.setItem("currentDeal", JSON.stringify(dealData));
  }, [dealData]);

  useEffect(() => {
    const saved = localStorage.getItem("currentDeal");
    if (saved) {
      try { setDealData(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const handleProcessDeal = useCallback(
    async (input: string) => {
      if (!input.trim()) return;

      // Add the user message immediately
      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, role: "user", content: input },
      ]);

      const lowerInput = input.toLowerCase();
      const isStatusQuery =
        lowerInput.includes("missing") ||
        lowerInput.includes("status") ||
        lowerInput.includes("what field");
      const isShortcutQuery =
        lowerInput.includes("summary") || lowerInput.includes("email");

      if (isStatusQuery || isShortcutQuery) {
        setLoading(true);
        await handleGeneralChat(input);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const res = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input, existingDeal: dealDataRef.current }),
        });

        const data = await res.json();

        // Merge deal data whenever we get it back
        if (data.deal) {
          const merged = { ...dealDataRef.current, ...data.deal };
          setDealData(merged);
          dealDataRef.current = merged;
        }

        // Validation failure — ask again
        if (data.status === "invalid" && data.question) {
          addAssistantMessage(data.question);
          return;
        }

        // Missing fields — ask next question
        if (data.question) {
          addAssistantMessage(data.question);
          return;
        }

        // All done
        if (data.status === "complete") {
          setActiveTab("Contracts");
          addAssistantMessage(
            `Got it! I've updated the contract for ${
              data.deal?.address || dealDataRef.current?.address || "the property"
            }. Check the Contracts tab to review and export.`
          );
          return;
        }

        // Fallback
        await handleGeneralChat(input);
      } catch {
        addAssistantMessage("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [handleGeneralChat, addAssistantMessage]
  );

  useEffect(() => {
    dealDataRef.current = dealData;
  }, [dealData]);

  // const renderContent = () => {
  //   switch (activeTab) {
  //     case "Timeline":
  //       return <DealTimeline />;
  //     default:
  //       return <MasterDashboard onSend={handleProcessDeal} />;
  //   }
  // };

  const isContractComplete = !!(
    dealData?.address && dealData?.price && dealData?.buyer_name &&
    dealData?.loan_type && dealData?.closing_date
  );

  return (
    <div className="min-h-screen bg-primary-dark text-neutral selection:bg-secondary/30">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="ml-80 flex h-screen">
        {/* Main content */}
        <main className="flex-1 pt-32 px-12 overflow-y-auto custom-scrollbar">
          <div className="max-w-3xl mx-auto min-h-[calc(100vh-200px)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-6 pb-32">
                  {messages.length === 0 && <MasterDashboard onSend={handleProcessDeal} />}

                  {/* Chat history */}
                  <div className="space-y-3 mt-10">
                    <AnimatePresence initial={false}>
                      {messages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          {msg.role === "assistant" && (
                            <div className="w-6 h-6 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                              <span className="text-[8px] text-secondary font-bold">AI</span>
                            </div>
                          )}
                          <div
                            className={`max-w-xl px-5 py-3 rounded-[1.5rem] text-sm shadow-xl ${
                              msg.role === "user"
                                ? "bg-accent text-primary-dark font-medium rounded-tr-none"
                                : "bg-primary/40 backdrop-blur-md text-neutral border border-white/5 rounded-tl-none"
                            }`}
                          >
                            {msg.content}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {loading && <TypingIndicator />}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Contract side panel — slides in when all required fields are filled */}
        <AnimatePresence>
          {isContractComplete && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 360, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="flex-shrink-0 border-l border-white/5 overflow-y-auto overflow-x-hidden pt-24 pb-32"
            >
              <div className="w-[360px] px-4">
                <ContractPreview deal={dealData ?? undefined} />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {messages.length > 0 && <DealInput onSend={handleProcessDeal} />}
    </div>
  );
}