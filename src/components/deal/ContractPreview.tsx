"use client";
import jsPDF from "jspdf";
import React, { useMemo } from "react";
import type { DealData } from "@/types/deal";
import { Download, PenTool, Send } from "lucide-react";

interface ContractPreviewProps {
  deal?: Partial<DealData>;
}

export const ContractPreview = ({ deal = {} }: ContractPreviewProps) => {
  const progress = useMemo(() => {
    const fields = [
      deal.address,
      deal.price,
      deal.buyer_name,
      deal.loan_type,
      deal.closing_date,
      deal.inspection_days,
    ];
    const filled = fields.filter((f) => f !== undefined && f !== null && f !== "").length;
    return Math.round((filled / fields.length) * 100);
  }, [deal]);

  // ─── PDF Export matching the screenshot style ────────────────────────────
  const handleExportPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 56;
    let y = 52;

    const setFont = (size: number, style: "normal" | "bold" | "italic" = "normal", color = "#111111") => {
      doc.setFontSize(size);
      doc.setFont("helvetica", style);
      doc.setTextColor(color);
    };

    const text = (t: string, x: number, opts?: { align?: "center" | "left" | "right" }) => {
      doc.text(t, x, y, opts);
    };

    const nl = (n = 1, size = 11) => { y += size * 1.5 * n; };

    const rule = (color = "#dddddd") => {
      doc.setDrawColor(color);
      doc.line(margin, y, pageW - margin, y);
      y += 14;
    };

    const field = (label: string, value: string | null | undefined) => {
      setFont(8, "normal", "#888888");
      text(label.toUpperCase(), margin);
      y += 13;
      setFont(10, "bold", "#111111");
      text(value || "________________________", margin);
      y += 18;
    };

    // ── Title block ────────────────────────────────────────────────────────
    setFont(16, "bold", "#111111");
    text("PURCHASE AGREEMENT", pageW / 2, { align: "center" });
    nl(0.5, 10);
    setFont(9, "normal", "#888888");
    text(`Prepared: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`, pageW / 2, { align: "center" });
    y += 24;
    rule("#111111");

    // ── Property & Parties ────────────────────────────────────────────────
    field("ADDRESS", deal.address);
    field("BUYER", deal.buyer_name);
    field("SELLER", deal.seller_name || "________________________");
    rule();

    // ── Financial ─────────────────────────────────────────────────────────
    setFont(8, "normal", "#888888");
    text("PRICE", margin);
    y += 13;
    setFont(13, "bold", "#111111");
    text(deal.price ? `$${Number(deal.price).toLocaleString()}` : "$ ________________________", margin);
    nl(0.5, 10);

    // Two columns
    const col2 = pageW / 2 + 8;
    const colY = y;
    setFont(8, "normal", "#888888");
    text("LOAN TYPE", margin);
    doc.text("SELLER CONCESSIONS", col2, colY);
    y += 13;
    setFont(10, "bold", "#111111");
    text(deal.loan_type || "________________________", margin);
    const concVal = deal.seller_concessions ? `$${Number(deal.seller_concessions).toLocaleString()}` : "$0.00";
    doc.text(concVal, col2, y);
    y += 24;
    rule();

    // ── Key Terms ─────────────────────────────────────────────────────────
    setFont(9, "bold", "#111111");
    text("KEY TERMS", margin);
    y += 16;

    const terms = [
      `1. Purchase: Buyer agrees to purchase and Seller agrees to sell under agreed terms.`,
      `2. Financing: Subject to Buyer securing ${deal.loan_type || "financing"} on time.`,
      `3. Inspection: Buyer may inspect and request repairs or cancel within ${deal.inspection_days || "10"} calendar days.`,
      `4. Closing: To be completed by ${deal.closing_date || "the agreed closing date"}.`,
      `5. Default: Failure to perform may lead to legal action.`,
    ];

    setFont(8.5, "normal", "#333333");
    for (const term of terms) {
      const lines = doc.splitTextToSize(term, pageW - margin * 2) as string[];
      for (const line of lines) {
        doc.text(line, margin, y);
        y += 13;
      }
      y += 3;
    }

    rule();

    // ── Signatures ────────────────────────────────────────────────────────
    y += 10;
    setFont(8, "normal", "#888888");
    text("SIGNATURE", margin);
    y += 20;
    doc.setDrawColor("#111111");
    doc.line(margin, y, margin + 200, y);
    doc.line(col2, y, col2 + 160, y);
    y += 14;
    setFont(8, "normal", "#888888");
    text("BUYER SIGNATURE", margin);
    doc.text("SELLER SIGNATURE", col2, y);
    y += 24;
    doc.line(margin, y, margin + 200, y);
    doc.line(col2, y, col2 + 160, y);
    y += 14;
    setFont(8, "normal", "#888888");
    text("DATE", margin);
    doc.text("DATE", col2, y);

    doc.save(`Purchase_Agreement_${deal.address || "Draft"}.pdf`);
  };

  // ── Render: white card matching screenshot ──────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">

      {/* Action buttons row — matches screenshot bottom buttons */}
      <div className="flex items-center justify-between border-b border-white/5 pb-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-secondary font-bold mb-1">
            Standard Real Estate Form
          </p>
          <h2 className="text-2xl font-light text-neutral">
            Residential{" "}
            <span className="font-semibold text-white">Purchase Agreement</span>
          </h2>
        </div>
        <span
          className={`text-[9px] px-4 py-2 rounded-full border font-bold uppercase tracking-[0.2em] ${
            progress === 100
              ? "bg-secondary/20 text-secondary border-secondary/30"
              : "bg-white/5 text-white/30 border-white/10"
          }`}
        >
          {progress === 100 ? "Execution Ready" : `${progress}% Complete`}
        </span>
      </div>

      {/* ── White contract card — matching screenshot ── */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-10 py-8">

          {/* Doc title */}
          <div className="text-center mb-6 pb-6 border-b border-gray-200">
            <h3 className="font-black text-gray-900 text-base tracking-widest uppercase">
              Purchase Agreement
            </h3>
          </div>

          {/* Address + Price row */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold mb-1">
                Address
              </p>
              <p className="text-sm font-bold text-gray-900">
                {deal.address || <span className="text-gray-300 font-normal italic">Not provided</span>}
              </p>
            </div>
            <div>
              <p className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold mb-1">
                Price
              </p>
              <p className="text-sm font-bold text-gray-900">
                {deal.price
                  ? `$${Number(deal.price).toLocaleString()}`
                  : <span className="text-gray-300 font-normal italic">Not provided</span>}
              </p>
            </div>
          </div>

          {/* Buyer + Seller */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold mb-1">
                Buyer
              </p>
              <p className="text-sm font-bold text-gray-900">
                {deal.buyer_name || <span className="text-gray-300 font-normal italic">Not provided</span>}
              </p>
            </div>
            <div>
              <p className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold mb-1">
                Seller
              </p>
              <p className="text-sm font-bold text-gray-900">
                {deal.seller_name || <span className="text-gray-300 font-normal italic">Not provided</span>}
              </p>
            </div>
          </div>

          {/* Loan + Closing */}
          <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-100">
            <div>
              <p className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold mb-1">
                Loan
              </p>
              <p className="text-sm font-bold text-gray-900">
                {deal.loan_type || <span className="text-gray-300 font-normal italic">Not provided</span>}
              </p>
            </div>
            <div>
              <p className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold mb-1">
                Closing
              </p>
              <p className="text-sm font-bold text-gray-900">
                {deal.closing_date || <span className="text-gray-300 font-normal italic">Not provided</span>}
              </p>
            </div>
          </div>

          {/* Key Terms */}
          <div className="mb-6 space-y-2">
            {[
              { n: "1", label: "Purchase:", body: "Buyer agrees to purchase and Seller agrees to sell under agreed terms." },
              { n: "2", label: "Financing:", body: `Subject to Buyer securing ${deal.loan_type || "financing"} on time.` },
              { n: "3", label: "Inspection:", body: `Buyer may inspect and request repairs or cancel within ${deal.inspection_days || "10"} days.` },
              { n: "4", label: "Closing:", body: `To be completed by ${deal.closing_date || "the agreed date"} unless extended.` },
              { n: "5", label: "Default:", body: "Failure to perform may lead to legal action." },
            ].map((t) => (
              <p key={t.n} className="text-[11px] text-gray-600 leading-relaxed">
                <span className="text-gray-400 mr-1">{t.n}.</span>
                <span className="font-semibold text-gray-800">{t.label}</span>{" "}
                {t.body}
              </p>
            ))}
          </div>

          {/* Signature lines */}
          <div className="pt-4 border-t border-gray-200 space-y-6">
            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold">
              Signature
            </p>
            <div className="grid grid-cols-2 gap-10">
              <div>
                <div className="border-b border-gray-300 h-8 mb-1" />
                <p className="text-[9px] text-gray-400 uppercase tracking-widest">
                  Buyer Signature
                </p>
              </div>
              <div>
                <div className="border-b border-gray-300 h-8 mb-1" />
                <p className="text-[9px] text-gray-400 uppercase tracking-widest">
                  Seller Signature
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom action strip — matches screenshot "Sign Doc / Export PDF / Send to Parties" */}
        <div className="grid grid-cols-3 border-t border-gray-200">
          <button className="flex items-center justify-center gap-2 py-4 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors border-r border-gray-200">
            <PenTool className="w-3.5 h-3.5" />
            Sign Doc
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center justify-center gap-2 py-4 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors border-r border-gray-200"
          >
            <Download className="w-3.5 h-3.5" />
            Export PDF
          </button>
          <button
            disabled={progress < 100}
            className="flex items-center justify-center gap-2 py-4 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-30"
          >
            <Send className="w-3.5 h-3.5" />
            Send to Parties
          </button>
        </div>
      </div>

      {/* AI status note */}
      <div className="p-6 rounded-2xl bg-gradient-to-tr from-secondary/5 via-transparent to-transparent border border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
          <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">
            AI Status
          </p>
        </div>
        <p className="text-xs text-neutral/40 font-light italic">
          {progress === 100
            ? "All fields collected. Contract is ready for review and signing."
            : `${progress}% complete — provide the remaining fields to finalize the contract.`}
        </p>
      </div>
    </div>
  );
};