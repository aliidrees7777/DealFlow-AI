import type { DealData } from "@/types/deal";

function coerceSellerConcessions(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[$,]/g, ""));
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function coercePrice(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[$,]/g, ""));
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function coerceInspectionDays(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseInt(v, 10);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/** Normalize API / JSON blobs into a strict DealData shape. */
export function normalizeDeal(raw: Partial<Record<keyof DealData, unknown>>): DealData {
  return {
    address: typeof raw.address === "string" ? raw.address : null,
    price: coercePrice(raw.price),
    loan_type: typeof raw.loan_type === "string" ? raw.loan_type : null,
    closing_date: typeof raw.closing_date === "string" ? raw.closing_date : null,
    buyer_name: typeof raw.buyer_name === "string" ? raw.buyer_name : null,
    seller_name: typeof raw.seller_name === "string" ? raw.seller_name : null,
    seller_concessions: coerceSellerConcessions(raw.seller_concessions),
    inspection_days: coerceInspectionDays(raw.inspection_days),
  };
}