"use client";
import React from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { DealInput } from "@/components/deal/DealInput";

interface MasterDashboardProps {
  onSend?: (val: string) => Promise<void> | void;
}

const MasterDashboard = ({ onSend }: MasterDashboardProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6 relative">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 space-y-6 w-full max-w-2xl"
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-[10px] font-bold uppercase tracking-widest text-secondary">
          <Sparkles className="w-3 h-3" /> AI Transaction Intelligence
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-light text-neutral tracking-tight">
          What deal are we<br />
          <span className="font-semibold text-white">working on today?</span>
        </h1>

        <p className="text-sm text-white/30 font-light">
          Paste a deal summary or describe the property — I'll extract everything.
        </p>

        {/* Inline input — only shown on empty state */}
        {onSend && (
          <div className="w-full mt-4">
            <DealInput onSend={onSend} centered />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MasterDashboard;