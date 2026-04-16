"use client";
import React from "react";
import {
  LayoutDashboard,
  FileText,
  Landmark,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const menuItems = [
    { icon: <LayoutDashboard className="w-4 h-4" />, label: "Overview" },
    { icon: <FileText className="w-4 h-4" />, label: "Contracts" },
    // { icon: <Landmark className="w-4 h-4" />, label: "Financials" },
    { icon: <RotateCcw className="w-4 h-4" />, label: "Timeline" },
    // { icon: <Sparkles className="w-4 h-4" />, label: "Insights" },
  ];

  return (
    // Background ko primary.dark (Slate) aur text ko neutral (Stone) kiya gaya hai
    <aside className="fixed left-6 top-32 bottom-8 w-72 rounded-[2rem] bg-primary-dark/80 backdrop-blur-2xl border border-white/5 flex flex-col p-6 shadow-2xl z-40">
      <div className="flex items-center gap-3 mb-8 px-2">
        {/* Logo Icon using Secondary (Moss) color */}
        <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center text-secondary">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-neutral font-bold text-sm tracking-tight">
          TransactionFlow AI
          </h3>
          <p className="text-[10px] text-secondary-light uppercase font-bold tracking-widest">
            Active Transaction
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-1.5 flex-grow">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => onTabChange(item.label)}
            className={`flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 group border ${
              activeTab === item.label
                ? "bg-secondary/10 text-secondary border-secondary/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                : "text-secondary-light/60 border-transparent hover:bg-white/5 hover:text-neutral"
            }`}
          >
            <span
              className={`${
                activeTab === item.label ? "text-secondary" : "group-hover:text-accent"
              }`}
            >
              {item.icon}
            </span>
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Button using Accent (Clay) and Primary Dark colors */}
      <button className="mt-auto py-4 px-6 bg-accent text-primary-dark text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-secondary transition-all active:scale-95 shadow-lg shadow-black/20">
        Download Contract
      </button>
    </aside>
  );
};

export default Sidebar;