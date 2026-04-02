import { parseMonthDay, parseNumericDate } from "@/lib/mock-extract";

/** Parse follow-up closing input; preserves free text if not parseable as a date. */
export function normalizeClosingInput(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const parsed = parseNumericDate(t) || parseMonthDay(t);
  if (parsed) return parsed;
  const d = new Date(t);
  if (!Number.isNaN(d.getTime())) {
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
  }
  return t;
}
