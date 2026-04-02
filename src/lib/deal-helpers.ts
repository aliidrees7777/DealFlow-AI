import type { DealData } from "@/types/deal";

export function formatPrice(n: number | null): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

/** Display seller concessions as currency or "None". */
export function formatSellerConcessions(n: number | null): string {
  if (n == null) return "None";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

/**
 * Display closing date without UTC day-shift bugs.
 * YYYY-MM-DD uses local calendar; otherwise returns the string as stored.
 */
export function formatDisplayDate(raw: string | null): string {
  if (!raw) return "—";
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const y = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10) - 1;
    const d = parseInt(m[3], 10);
    const dt = new Date(y, mo, d);
    if (Number.isNaN(dt.getTime())) return raw;
    return dt.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
  return raw;
}

/** Add calendar days to a YYYY-MM-DD string (local date, no UTC shift). */
export function addDaysCalendar(ymd: string, deltaDays: number): string | null {
  const m = ymd.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10) - 1;
  const d = parseInt(m[3], 10);
  const dt = new Date(y, mo, d);
  if (Number.isNaN(dt.getTime())) return null;
  dt.setDate(dt.getDate() + deltaDays);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export type TimelineItem = {
  id: string;
  label: string;
  date: string;
  note?: string;
};

/**
 * Only derives inspection deadline when inspection_days is set and closing is YYYY-MM-DD.
 * No financing guess rows.
 */
function isYmd(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export function buildTimeline(deal: DealData): TimelineItem[] {
  const items: TimelineItem[] = [];
  const closing = deal.closing_date;
  if (!closing) return items;

  if (
    deal.inspection_days != null &&
    deal.inspection_days > 0 &&
    isYmd(closing)
  ) {
    const inspectionEnd = addDaysCalendar(closing, -deal.inspection_days);
    if (inspectionEnd) {
      items.push({
        id: "inspection",
        label: "Inspection deadline",
        date: inspectionEnd,
        note: `${deal.inspection_days} days before closing`,
      });
    }
  }

  items.push({
    id: "closing",
    label: "Closing",
    date: closing,
  });

  return items.sort((a, b) => {
    const ta = isYmd(a.date) ? new Date(a.date + "T12:00:00").getTime() : 0;
    const tb = isYmd(b.date) ? new Date(b.date + "T12:00:00").getTime() : 0;
    if (ta && tb) return ta - tb;
    return 0;
  });
}

export function getMissingCriticalFields(deal: DealData): ("buyer_name" | "closing_date")[] {
  const m: ("buyer_name" | "closing_date")[] = [];
  if (!deal.buyer_name?.trim()) m.push("buyer_name");
  if (!deal.closing_date?.trim()) m.push("closing_date");
  return m.slice(0, 2);
}

/** Title-case for user-entered names (non-empty). */
export function titleCasePersonName(raw: string): string {
  return raw
    .split(/\s+/)
    .map((w) => {
      if (w.includes("-")) {
        return w
          .split("-")
          .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
          .join("-");
      }
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");
}

/** Title-case words for display; null/empty → TBD */
export function formatBuyerName(name: string | null): string {
  if (!name?.trim()) return "TBD";
  return titleCasePersonName(name.trim());
}
