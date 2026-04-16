"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, PieChart, Activity, DollarSign } from 'lucide-react';
import { DealTimeLineFullView } from './DealTimeLineFullView';


export default function DealsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen bg-primary-dark text-neutral p-8 pt-32">
      {/* 1. Header Section */}
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-1">
          <h1 className="text-4xl font-light tracking-tight">
       Transaction <span className="text-secondary font-medium">Portfolio</span>
          </h1>
          <p className="text-secondary-light/40 text-sm uppercase tracking-widest">Manage and track your global transactions</p>
        </div>
        
        {/* <button className="flex items-center gap-2 bg-secondary hover:bg-secondary-light text-primary-dark px-6 py-3 rounded-2xl font-bold transition-all shadow-[0_10px_20px_rgba(134,141,120,0.2)]">
          <Plus className="w-5 h-5" />
          Create New Deal
        </button> */}
      </div>

      {/* 2. Quick Stats Section */}
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { label: "Active Pipeline", value: "$12.8M", icon: <DollarSign />, color: "text-accent" },
          { label: "Success Rate", value: "94%", icon: <PieChart />, color: "text-secondary" },
          { label: "Pending Actions", value: "07", icon: <Activity />, color: "text-amber-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-primary-dark/40 border border-white/5 p-6 rounded-[2rem] backdrop-blur-xl">
            <div className="flex justify-between items-center mb-4">
              <div className={`p-2 rounded-xl bg-white/5 ${stat.color}`}>{stat.icon}</div>
              <span className="text-[10px] text-white/20 font-bold">LIVE DATA</span>
            </div>
            <p className="text-3xl font-bold text-neutral">{stat.value}</p>
            <p className="text-xs text-secondary-light/40 uppercase tracking-wider mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* 3. Search & Table Section */}
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-3xl border border-white/5">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input 
              type="text" 
              placeholder="Search by address or buyer name..."
              className="outline-none w-full bg-transparent border-none pl-12 pr-4 text-sm focus:ring-0 text-neutral placeholder:text-white/10"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition-all">
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
          </div>
        </div>

        {/* Humari banayi hui Table yahan aaye gi */}
<DealTimeLineFullView/>
      </div>
    </div>
  );
}