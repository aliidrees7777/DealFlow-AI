"use client";
import React from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const MasterDashboard = () => {
  return (
    <div className="bg-primary-dark text-neutral font-sans selection:bg-secondary/30">
      {/* 1. HERO SECTION */}
      <section className="pt-12  px-6 text-center relative overflow-hidden">
        {/* Background Glow using Secondary (Moss) color */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px]  bg-secondary/10 blur-[120px] rounded-full" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-[10px] font-bold uppercase tracking-widest text-secondary">
            <Sparkles className="w-3 h-3" /> Introducing AI Transaction Intelligence
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default MasterDashboard;
