"use client";
import clsx from "clsx";
import jsPDF from "jspdf";
import React, { useMemo } from "react";
import type { DealData } from "@/types/deal";
import {
  Download,
  PenTool,
  Send,
  ShieldCheck,
  Landmark,
  Calendar,
} from "lucide-react";

interface DealDashboardProps {
  deal: DealData;
}

export const ContractPreview = ({ deal }: DealDashboardProps) => {
  const progress = useMemo(() => {
    const fields = [
      deal.address,
      deal.price,
      deal.buyer_name,
      deal.loan_type,
      deal.closing_date,
      deal.inspection_days,
    ];
    const filledFields = fields.filter(
      (field) => field !== undefined && field !== null && field !== "",
    ).length;
    return Math.round((filledFields / fields.length) * 100);
  }, [deal]);


  const handleExportPDF = () => {
    console.log("Hello World");
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const margin = 60;
    const pageW = doc.internal.pageSize.getWidth();
    let y = 60;

    const line = (text: string, size = 10, bold = false, color = "#000000") => {
      doc.setFontSize(size);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setTextColor(color);
      doc.text(text, margin, y);
      y += size * 1.6;
    };

    const divider = () => {
      doc.setDrawColor("#cccccc");
      doc.line(margin, y, pageW - margin, y);
      y += 12;
    };

    // Header
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("CALIFORNIA RESIDENTIAL PURCHASE AGREEMENT", pageW / 2, y, {
      align: "center",
    });
    y += 20;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("(C.A.R. FORM RPA)", pageW / 2, y, { align: "center" });
    y += 30;
    divider();

    line(`Date Prepared: ${new Date().toLocaleDateString()}`, 10);
    y += 8;

    line("1. OFFER:", 11, true);
    line(
      `   A. THIS IS AN OFFER FROM: ${deal.buyer_name || "________________________"} ("Buyer")`,
    );
    line(
      `   B. THE PROPERTY to be acquired is: ${deal.address || "________________________"}`,
    );
    y += 8;
    divider();

    line("2. FINANCIAL TERMS:", 11, true);
    line(`   Purchase Price: $${deal.price || "________________"}`);
    line(`   Loan Type: ${deal.loan_type || "________________"}`);
    line(`   Seller Concessions: $${deal.seller_concessions || "0.00"}`);
    y += 8;
    divider();

    line("3. DATES & CONTINGENCIES:", 11, true);
    line(
      `   Close of Escrow (COE): ${deal.closing_date || "________________"}`,
    );
    line(
      `   Inspection Period: ${deal.inspection_days || "10"} calendar days from acceptance`,
    );
    y += 8;
    divider();

    // Signature block
    y += 20;
    line("BUYER SIGNATURE:", 10, true);
    y += 30;
    doc.setDrawColor("#000000");
    doc.line(margin, y, margin + 200, y);
    doc.text("Buyer", margin, y + 14);
    doc.line(pageW - margin - 200, y, pageW - margin, y);
    doc.text("Date", pageW - margin - 200, y + 14);
    y += 40;
    line("SELLER SIGNATURE:", 10, true);
    y += 30;
    doc.line(margin, y, margin + 200, y);
    doc.text("Seller", margin, y + 14);
    doc.line(pageW - margin - 200, y, pageW - margin, y);
    doc.text("Date", pageW - margin - 200, y + 14);

    doc.save(`Purchase_Agreement_${deal.address || "Draft"}.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* 1. DOCUMENT TOP BAR */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.4em] text-secondary font-bold">
            Standard Real Estate Form
          </p>
          <h2 className="text-3xl font-light text-neutral tracking-tight">
            Residential{" "}
            <span className="font-semibold text-white">Purchase Agreement</span>
          </h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] text-white/20 uppercase tracking-widest">
              Completion
            </p>
            <p className="text-xl font-mono text-secondary">{progress}%</p>
          </div>
          <div className="h-12 w-[1px] bg-white/5" />
          <span
            className={clsx(
              "text-[9px] px-4 py-2 rounded-full border font-bold uppercase tracking-[0.2em]",
              progress === 100
                ? "bg-secondary/20 text-secondary border-secondary/30 shadow-[0_0_15px_rgba(var(--secondary-rgb),0.1)]"
                : "bg-white/5 text-white/30 border-white/10",
            )}
          >
            {progress === 100 ? "Execution Ready" : "Drafting Mode"}
          </span>
        </div>
      </div>

      {/* 2. MAIN CONTRACT BODY */}
      <div className="bg-primary-dark/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-12 shadow-2xl relative overflow-hidden">
        {/* Subtle Legal Watermark */}
        <div className="absolute top-20 right-10 opacity-[0.02] pointer-events-none select-none">
          <div className="text-[140px] font-black leading-none rotate-12">
            OFFER
          </div>
        </div>

        <div className="relative z-10 space-y-12">
          {/* SECTION 1: PARTIES & PROPERTY */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-4 w-[2px] bg-secondary" />
              <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-neutral">
                Section I: Parties & Property
              </h4>
            </div>

            <p className="text-neutral/70 leading-[1.8] text-justify font-light">
              This agreement is entered into this date of
              <span className="text-neutral font-semibold mx-1 border-b border-white/20 px-2 italic">
                {new Date().toLocaleDateString()}
              </span>
              by and between
              <span
                className={clsx(
                  "mx-1 border-b px-3 font-medium",
                  deal.buyer_name
                    ? "text-white border-secondary/40"
                    : "text-white/20 border-white/5 italic",
                )}
              >
                {deal.buyer_name || "[Buyer Name Pending]"}
              </span>
              (hereinafter &quot;Buyer&quot;) and the Seller of record. The
              Buyer agrees to purchase and the Seller agrees to sell the real
              property situated in the county of
              <span className="text-neutral font-medium mx-1 italic">
                Lake, California
              </span>
              , commonly known as:
            </p>

            <div className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl group hover:border-secondary/20 transition-all">
              <p
                className={clsx(
                  "text-xl tracking-tight transition-all",
                  deal.address
                    ? "text-neutral"
                    : "text-white/10 italic font-light",
                )}
              >
                {deal.address ||
                  "Please provide property address to finalize fragment..."}
              </p>
            </div>
          </section>

          {/* SECTION 2: FINANCIAL TERMS */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-4 w-[2px] bg-accent" />
              <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-neutral">
                Section II: Financial Considerations
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-neutral/70 leading-relaxed font-light">
                  The total purchase price for the property shall be the sum of:
                </p>
                <div className="text-4xl font-light tracking-tighter text-accent">
                  {deal.price ? `$ ${deal.price}` : "$ — — — , — — —"}
                </div>
                <p className="text-[10px] text-white/30 uppercase tracking-widest">
                  Payable in U.S. Dollars at Closing
                </p>
              </div>

              <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-3.5 h-3.5 text-secondary-light/40" />
                    <span className="text-[11px] text-secondary-light/60 uppercase">
                      Financing Type
                    </span>
                  </div>
                  <span className="text-sm text-neutral font-medium">
                    {deal.loan_type || "TBD"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-secondary-light/40" />
                    <span className="text-[11px] text-secondary-light/60 uppercase">
                      Seller Concessions
                    </span>
                  </div>
                  <span className="text-sm text-accent font-medium">
                    {deal.seller_concessions
                      ? `$ ${deal.seller_concessions}`
                      : "$ 0.00"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: CONTINGENCIES & CLOSING */}
          <section className="space-y-6 pt-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-4 w-[2px] bg-secondary" />
              <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-neutral">
                Section III: Dates & Contingencies
              </h4>
            </div>

            <p className="text-neutral/70 leading-[1.8] font-light">
              This offer is contingent upon a satisfactory home inspection to be
              completed within
              <span className="text-neutral font-bold mx-1 border-b border-white/10 px-2 italic">
                {deal.inspection_days || "10"} calendar days
              </span>
              of acceptance. Furthermore, the parties agree that the close of
              escrow (Closing Date) shall occur on or before:
            </p>

            <div className="flex items-center gap-4 bg-secondary/5 border border-secondary/10 p-5 rounded-2xl w-fit">
              <Calendar className="w-5 h-5 text-secondary" />
              <div>
                <p className="text-[10px] text-secondary/60 uppercase font-bold tracking-widest">
                  Closing Schedule
                </p>
                <p className="text-lg text-neutral font-medium">
                  {deal.closing_date || "Pending Approval"}
                </p>
              </div>
            </div>
          </section>

          {/* SIGNATURE AREA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-16 border-t border-white/5">
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-widest text-white/50">
                Buyer Signature
              </p>
              <div className="h-16 border-b border-dashed border-white/10 flex items-center px-4">
                {deal.buyer_name && (
                  <span className="font-serif text-2xl text-secondary/60 italic opacity-50 select-none">
                    {deal.buyer_name}
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] uppercase tracking-widest text-white/50">
                Seller Signature
              </p>
              <div className="h-16 border-b border-dashed border-white/30" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. ACTION CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-secondary/10 hover:border-secondary/40 text-neutral py-5 rounded-[1.5rem] transition-all group overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <PenTool className="w-4 h-4 text-secondary" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
            Sign Document
          </span>
        </button>

        <button
          onClick={handleExportPDF}
          className="flex items-center justify-center gap-3 bg-white/5 ..."
        >
          <Download className="w-4 h-4 text-white/60" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
            Export PDF
          </span>
        </button>

        <button
          disabled={progress < 100}
          className="flex items-center justify-center gap-3 bg-secondary/20 border border-secondary/30 hover:bg-secondary/30 text-white py-5 rounded-[1.5rem] transition-all disabled:opacity-10"
        >
          <Send className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
            Send to Parties
          </span>
        </button>
      </div>

      {/* STATUS INDICATOR */}
      <div className="p-8 rounded-[2rem] bg-gradient-to-tr from-secondary/5 via-transparent to-transparent border border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
          <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">
            AI Suggession
          </p>
        </div>
        <p className="text-sm text-neutral/40 leading-relaxed font-light italic">
          &quot;The contract logic has identified **{progress}%** of the
          required transaction artifacts.
          {progress < 100
            ? " Please provide the missing fields to enable digital execution."
            : " All compliance checks passed. Document is ready for legal binding."}
          &quot;
        </p>
      </div>
    </div>
  );
};
