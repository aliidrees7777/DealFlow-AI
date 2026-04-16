"use client";

import { Building2, CalendarDays, DollarSign } from "lucide-react";
import type { DealData } from "@/types/deal";
import {
  formatBuyerName,
  formatDisplayDate,
  formatPrice,
  formatSellerConcessions,
} from "@/lib/deal-helpers";

type DealDashboardProps = { deal: DealData };

export function DealDashboard({ deal }: DealDashboardProps) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/60">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">Deal dashboard</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            <Building2 className="h-3.5 w-3.5" />
            Property
          </div>
          <p className="text-sm font-medium text-slate-900">
            {deal.address ?? "—"}
          </p>
          <p className="mt-2 text-xs text-slate-500">Buyer</p>
          <p className="text-sm font-medium text-slate-900">
            {formatBuyerName(deal.buyer_name)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            <DollarSign className="h-3.5 w-3.5" />
            Financial
          </div>
          <p className="text-sm font-medium text-slate-900">
            {formatPrice(deal.price)}
          </p>
          {deal.loan_type && (
            <p className="mt-1 text-xs text-slate-600">Loan: {deal.loan_type}</p>
          )}
          {/* <p className="mt-2 text-xs text-slate-500">Seller concessions</p> */}
          <p className="text-sm font-medium text-slate-900">
            {formatSellerConcessions(deal.seller_concessions)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            <CalendarDays className="h-3.5 w-3.5" />
            Key dates
          </div>
          <p className="text-sm font-medium text-slate-900">
            Closing: {formatDisplayDate(deal.closing_date)}
          </p>
          {deal.inspection_days != null && (
            <p className="mt-1 text-xs text-slate-600">
              Inspection period: {deal.inspection_days} days
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
