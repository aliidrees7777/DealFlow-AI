"use client";
import React from 'react';
import { Home, User, Landmark, CalendarDays, Hourglass, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DealData } from "@/types/deal";
import MasterDashboard from './MasterDashboard';

interface DealDashboardProps {
  deal: DealData;
}

const DealDashboard = ({ deal }: DealDashboardProps) => {
	console.log("------------>>>",deal.buyer_name)
  return (
    <section className="mt-12 space-y-6">
      {/* Updated Title */}
      <motion.h2 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-light tracking-tight text-neutral"
      >
        Current <span className="text-secondary font-medium">Transaction</span>
      </motion.h2>

      {/* Grid Container adjusted for 4 cards in a row on large screens */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        
        {/* 1. PROPERTY CARD */}
        <div className="bg-primary-dark/60 backdrop-blur-2xl border border-white/5 rounded-[1.5rem] p-6 shadow-2xl space-y-5 transition-all hover:border-secondary/20 group">
          <div className="flex items-center gap-3 text-secondary-light/60 uppercase text-[10px] font-bold tracking-[0.2em]">
            <Home className="w-4 h-4 text-secondary opacity-70 group-hover:opacity-100 transition-opacity" />
            Property
          </div>
          <div className="space-y-1">
            <p className="text-xl font-semibold text-neutral group-hover:text-white transition-colors truncate">
              {deal.address || "Pending Address"}
            </p>
            <p className="text-sm text-secondary-light/40 italic">Primary Residence</p>
          </div>
          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-secondary-light/60">Buyer</span>
            <div className="flex items-center gap-1.5 bg-primary px-2 py-0.5 rounded-full text-[11px] border border-white/5">
                <User className="w-3 h-3 text-secondary-light" />
                <span className="text-neutral truncate max-w-[80px]">{deal.buyer_name || "TBD"}</span>
            </div>
          </div>
        </div>

        {/* 2. FINANCIAL CARD */}
        <div className="bg-primary-dark/60 backdrop-blur-2xl border border-white/5 rounded-[1.5rem] p-6 shadow-2xl space-y-5 transition-all hover:border-accent/20 group">
          <div className="flex items-center gap-3 text-secondary-light/60 uppercase text-[10px] font-bold tracking-[0.2em]">
            <Landmark className="w-4 h-4 text-accent opacity-70 group-hover:opacity-100 transition-opacity" />
            Financial
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-accent group-hover:text-accent/80 transition-colors">
              {deal.price || "$0.00"}
            </p>
            <p className="text-sm text-secondary-light/40 italic">Purchase Price</p>
          </div>
          <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px]">
            <span className="text-secondary-light/60">Loan: {deal.loan_type || "N/A"}</span>
            <span className="font-semibold text-neutral">{deal.seller_concessions || "$0"}</span>
          </div>
        </div>

        {/* 3. KEY DATES CARD */}
        <div className="bg-primary-dark/60 backdrop-blur-2xl border border-white/5 rounded-[1.5rem] p-6 shadow-2xl space-y-5 transition-all hover:border-secondary/20 group">
          <div className="flex items-center gap-3 text-secondary-light/60 uppercase text-[10px] font-bold tracking-[0.2em]">
            <CalendarDays className="w-4 h-4 text-secondary opacity-70 group-hover:opacity-100 transition-opacity" />
            Key Dates
          </div>
          <div className="space-y-1">
            <p className="text-xl font-semibold text-neutral group-hover:text-white transition-colors">
              {deal.closing_date || "To be set"}
            </p>
            <p className="text-sm text-secondary-light/40 italic">Closing Date</p>
          </div>
          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-secondary-light/60">Inspection</span>
            <div className="flex items-center gap-1.5 bg-secondary/10 border border-secondary/20 px-2 py-0.5 rounded-full text-[11px] text-secondary font-medium">
                <Hourglass className="w-3 h-3" />
                <span>{deal.inspection_days || "10"} days</span>
            </div>
          </div>
        </div>

        {/* 4. STATUS CARD */}
        <div className={`backdrop-blur-2xl border rounded-[1.5rem] p-6 shadow-2xl space-y-5 transition-all group relative overflow-hidden ${
          deal.status === 'expired' 
            ? 'bg-red-950/20 border-red-500/30' 
            : 'bg-primary-dark/60 border-white/5 hover:border-secondary/20'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-secondary-light/60 uppercase text-[10px] font-bold tracking-[0.2em]">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                deal.status === 'expired' ? 'bg-red-500' : 'bg-secondary'
              }`} />
              Status
            </div>
            <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${
              deal.status === 'expired' 
                ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                : 'bg-secondary/10 text-secondary border-secondary/20'
            }`}>
              {deal.status === 'expired' ? 'Alert' : 'On Track'}
            </span>
          </div>

          <div className="space-y-1">
            <p className={`text-xl font-semibold transition-colors ${
              deal.status === 'expired' ? 'text-red-200' : 'text-neutral group-hover:text-white'
            }`}>
              {deal.status === 'expired' ? 'Action Needed' : 'Compliance'}
            </p>
            <p className="text-[11px] text-secondary-light/40 italic">System Check</p>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-secondary-light/60">Phase</span>
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium transition-all ${
              deal.status === 'expired' 
                ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                : 'bg-secondary/10 text-secondary border border-secondary/20'
            }`}>
                {deal.status === 'expired' ? <AlertCircle className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                <span className="truncate max-w-[70px]">{deal.status === 'expired' ? 'Alert' : 'Underwriting'}</span>
            </div>
          </div>
        </div>

      </motion.div>
	<MasterDashboard/>
    </section>
  );
};

export default DealDashboard;