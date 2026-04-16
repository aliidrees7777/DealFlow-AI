"use client";
import React, { useState, useCallback, useRef,useEffect } from 'react';

import Sidebar from "@/components/layout/Sidebar";
import { DealInput } from "@/components/deal/DealInput";
import { ContractPreview } from "@/components/deal/ContractPreview";
import DealDashboard from "@/components/deal/DealDashboard";
import MasterDashboard from '@/components/deal/MasterDashboard';
import { motion, AnimatePresence } from "framer-motion";
import type { ChatMessage, DealData } from "@/types/deal";
import { DealTimeline } from '@/components/deal/DealTimeline';

export default function Home() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [dealData, setDealData] = useState<DealData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const dealDataRef = useRef<DealData | null>(null);
  dealDataRef.current = dealData;

const handleGeneralChat = useCallback(async (text: string) => {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: text,
        deal: dealDataRef.current 
      }),
    });

    const data = await res.json();
    setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: "assistant", content: data.reply }]);
  } catch (e) {
    // Error handling...
  }
}, []); 

// Data save karne ke liye
useEffect(() => {
  if (dealData) {
    localStorage.setItem('currentDeal', JSON.stringify(dealData));
  }
}, [dealData]);

// Page load par data wapas lane ke liye
useEffect(() => {
  const saved = localStorage.getItem('currentDeal');
  if (saved) setDealData(JSON.parse(saved));
}, []);



const handleProcessDeal = useCallback(async (input: string) => {
  if (!input.trim()) return;

  const lowerInput = input.toLowerCase();

  // 1. SMART CHECK
  const isStatusQuery =
    lowerInput.includes("missing") ||
    lowerInput.includes("status") ||
    lowerInput.includes("what field");

  if (isStatusQuery) {
    await handleGeneralChat(input);
    return;
  }

  // 2. SHORTCUT CHECK
  if (
    lowerInput.includes("summary") ||
    lowerInput.includes("email")
  ) {
    await handleGeneralChat(input);
    return;
  }

  setLoading(true);

  try {
    const res = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input,
        existingDeal: dealDataRef.current
      })
    });

    const data = await res.json();

    // UPDATE STATE
    if (data.deal) {
      const merged = { ...dealDataRef.current, ...data.deal };
      setDealData(merged);
      dealDataRef.current = merged;
    }

    // 3. PENDING RESPONSE
    if (data.status === "pending" || data.question) {
      const raw = data.question || "I need more details to continue.";

      // 🔥 SPLIT LOGIC ADDED (SAFE)
      const lines = raw.split("\n").filter(Boolean);

      let mainText = "";
      let shortText = "";

      lines.forEach((line, i) => {
        if (i === lines.length - 1 || line.length < 40) {
          shortText = line;
        } else {
          mainText += line + "\n";
        }
      });

      setMessages(prev => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: mainText || shortText
        }
      ]);

      if (shortText && shortText !== mainText) {
        setMessages(prev => [
          ...prev,
          {
            id: `s-${Date.now()}`,
            role: "assistant",
            content: shortText
          }
        ]);
      }

      return;
    }

    // 4. COMPLETE RESPONSE
    if (data.status === "complete") {
      setActiveTab("Contracts");

      const rawMsg =
        `Got it! Offer details for ${
          data.deal?.address ||
          dealDataRef.current?.address ||
          "the property"
        } are updated.`;

      // 🔥 SPLIT LOGIC ADDED HERE ALSO (SAFE)
      const lines = rawMsg.split("\n").filter(Boolean);

      let mainText = "";
      let shortText = "";

      lines.forEach((line, i) => {
        if (i === lines.length - 1) {
          shortText = line;
        } else {
          mainText += line + "\n";
        }
      });

      setMessages(prev => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: mainText || shortText
        }
      ]);

      if (shortText && shortText !== mainText) {
        setMessages(prev => [
          ...prev,
          {
            id: `s-${Date.now()}`,
            role: "assistant",
            content: shortText
          }
        ]);
      }

      return;
    }

    // 5. FALLBACK
    await handleGeneralChat(input);

  } catch (error) {
    console.error("Error:", error);
  } finally {
    setLoading(false);
  }
}, [handleGeneralChat]);

useEffect(() => {
  dealDataRef.current = dealData;
}, [dealData]);
  const renderContent = () => {
    switch (activeTab) {
      case "Overview":
        return <DealDashboard deal={dealData || {}}/>;
      case "Contracts":
        return <ContractPreview deal={dealData ?? undefined} />
      case "Timeline":
        return <DealTimeline/>;
      default:
        return <MasterDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-primary-dark text-neutral selection:bg-secondary/30">
     
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="ml-80 pt-32 px-12 h-screen overflow-y-auto custom-scrollbar">
        <div className="max-w-5xl mx-auto min-h-[calc(100vh-200px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-6 pb-32">
                {renderContent()}

                {/* DYNAMIC CHAT HISTORY */}
                <div className="space-y-4 mt-10">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xl px-5 py-3 rounded-[1.5rem] text-sm shadow-xl transition-all ${
                          msg.role === "user"
                            ? "bg-accent text-primary-dark font-medium rounded-tr-none"
                            : "bg-primary/40 backdrop-blur-md text-neutral border border-white/5 rounded-tl-none"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                     <div className="flex justify-start">
                        <div className="bg-primary/20 px-5 py-3 rounded-[1.5rem] rounded-tl-none animate-pulse text-xs text-secondary">
                          AI is analyzing deal data...
                        </div>
                     </div>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <DealInput onSend={handleProcessDeal} />
    </div>
  );
}