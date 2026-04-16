"use client";
import React from "react";
import { Bell, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import logo from "@/app/logo.png"
import Link from 'next/link'; // Ye import lazmi hai
const Header = () => {
  const pathname = usePathname();
  
  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 md:px-12  bg-primary-dark/80 backdrop-blur-3xl border-b border-white/5 shadow-2xl">
      <div className="tracking-tighter text-neutral flex items-center">
        {/* DealFlow <span className="text-secondary">AI</span> */}
        <img src={logo.src} className="w-20 2-10" alt="logo" />
        {/* <p className="text-md">SanSone <br /> <span className="text-[14px]">Res,Dential Collective</span></p> */}
      </div>

  <nav className="hidden md:flex items-center gap-10 tracking-tight font-light">
  <Link href="/" className="text-secondary-light/60 hover:text-neutral transition-colors text-sm uppercase tracking-widest">
    Assistant
  </Link>
  <Link href="/dealspage" className="text-secondary-light/60 hover:text-neutral transition-colors text-sm uppercase tracking-widest">
   Transaction
  </Link>
</nav>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-white/5 text-secondary transition-all">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-full hover:bg-white/5 text-secondary transition-all">
          <Settings className="w-5 h-5" />
        </button>
        {/* Profile Border using Stone (Neutral) */}
        <div className="w-10 h-10 rounded-full border border-neutral/20 overflow-hidden shadow-lg shadow-black/40">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Tokeer"
            alt="User"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;