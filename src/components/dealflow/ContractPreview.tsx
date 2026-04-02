"use client";

import { FileText } from "lucide-react";
import type { DealData } from "@/types/deal";
import {
  formatBuyerName,
  formatDisplayDate,
  formatPrice,
  formatSellerConcessions,
} from "@/lib/deal-helpers";

type ContractPreviewProps = { deal: DealData };

export function ContractPreview({ deal }: ContractPreviewProps) {
  const inspection =
    deal.inspection_days != null ? `${deal.inspection_days} days` : "—";

  const body = `Residential Purchase Agreement

Property: ${deal.address ?? "—"}
Purchase Price: ${formatPrice(deal.price)}
Closing Date: ${formatDisplayDate(deal.closing_date)}

Buyer: ${formatBuyerName(deal.buyer_name)}

Additional Terms:
- Inspection period: ${inspection}
- Seller concessions: ${formatSellerConcessions(deal.seller_concessions)}`;

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60">
      <div className="mb-4 flex items-center gap-2">
        <FileText className="h-4 w-4 text-slate-600" />
        <h3 className="text-sm font-semibold text-slate-900">Contract preview</h3>
      </div>
      <div className="rounded-xl border border-slate-200 bg-[#fafaf9] p-6 shadow-inner">
        <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-slate-800">
          {body}
        </pre>
      </div>
    </section>
  );
}
