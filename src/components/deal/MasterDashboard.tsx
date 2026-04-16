"use client";
import React from 'react';
import { 
  Sparkles, History, Zap, ShieldCheck 
} from 'lucide-react';
import { motion } from 'framer-motion';

const MasterDashboard = () => {
  return (
    <div className="bg-primary-dark text-neutral font-sans selection:bg-secondary/30">
      
      {/* 1. HERO SECTION */}
      <section className="pt-12  px-6 text-center relative overflow-hidden">
        {/* Background Glow using Secondary (Moss) color */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px]  bg-secondary/10 blur-[120px] rounded-full" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative z-10 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-[10px] font-bold uppercase tracking-widest text-secondary">
            <Sparkles className="w-3 h-3" /> Introducing AI Transaction Intelligence
          </div>
        </motion.div>
      </section>

      {/* 3. AI CAPABILITIES */}
      <section className="max-w-7xl mx-auto px-6 py-12 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Column 1: Recents */}
          <div className="space-y-6">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-secondary-light/60">
                <History className="w-4 h-4 text-secondary" /> Recents
            </h3>
            <div className="space-y-3">
              <CapabilityCard title="Offer for 789 Oak" desc="Drafted 2 hours ago" />
              <CapabilityCard title="Escrow Deposit" desc="Verified via SkySlope" />
            </div>
          </div>

          {/* Column 2: Workflow Commands */}
          <div className="space-y-6">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-secondary-light/60">
                <Zap className="w-4 h-4 text-accent" /> Action Center
            </h3>
            <div className="space-y-3">
              <CapabilityCard title="Draft New Addendum" desc="AI-generated legal forms" active />
              <CapabilityCard title="Title Search Request" desc="Automated email to partner" />
            </div>
          </div>

          {/* Column 3: Compliance */}
          <div className="space-y-6">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-secondary-light/60">
                <ShieldCheck className="w-4 h-4 text-secondary" /> Recommended
            </h3>
            <div className="space-y-3">
              <CapabilityCard title="Review Disclosure" desc="Flagging potential risks" />
              <CapabilityCard title="Closing Checklist" desc="Next steps for agent" />
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

// Sub-component for Luxury Cards with Brand Colors
const CapabilityCard = ({ title, desc, active = false }: any) => (
    <div className={`p-5 rounded-2xl border transition-all cursor-pointer group ${
        active 
          ? 'bg-secondary/10 border-secondary/30' 
          : 'bg-primary/20 border-white/5 hover:bg-white/5'
    }`}>
        <div className={`text-sm font-semibold mb-1 ${active ? 'text-secondary' : 'text-neutral'}`}>{title}</div>
        <div className="text-xs text-secondary-light/40 group-hover:text-secondary-light/60 transition-colors">{desc}</div>
    </div>
);

export default MasterDashboard;