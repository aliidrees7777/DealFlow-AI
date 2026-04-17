import type { DealData } from "@/types/deal";

const MONTHS: Record<string, number> = {
  january: 0,
  jan: 0,
  february: 1,
  feb: 1,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  may: 4,
  june: 5,
  jun: 5,
  july: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sep: 8,
  sept: 8,
  october: 9,
  oct: 9,
  november: 10,
  nov: 10,
  december: 11,
  dec: 11,
};

/** Local calendar YYYY-MM-DD — avoids UTC day-shift from toISOString(). */
function toYmdLocal(y: number, monthIndex0: number, day: number): string {
  const d = new Date(y, monthIndex0, day);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function parseMonthDay(text: string): string | null {
  const re =
    /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(\d{4}))?\b/i;
  const m = text.match(re);
  if (!m) return null;
  const mon = MONTHS[m[1].toLowerCase()];
  if (mon === undefined) return null;
  const day = parseInt(m[2], 10);
  const year = m[3] ? parseInt(m[3], 10) : new Date().getFullYear();
  return toYmdLocal(year, mon, day);
}

export function parseNumericDate(text: string): string | null {
  const m = text.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/);
  if (!m) return null;
  let y = parseInt(m[3], 10);
  if (y < 100) y += 2000;
  const month = parseInt(m[1], 10) - 1;
  const day = parseInt(m[2], 10);
  return toYmdLocal(y, month, day);
}

function parseSellerConcessionDollars(input: string): number | null {
  const patterns: RegExp[] = [
    /(?:seller\s*(?:pays|to\s*cover)|seller\s+credit|closing\s*cost\s*help)[^\d$]*\$?\s*([\d,]+(?:\.\d{2})?)/i,
    /\$\s*([\d,]+(?:\.\d{2})?)\s*(?:seller\s*)?(?:credit|concession)/i,
    /seller\s+concessions?\s*(?:of|:)?\s*\$?\s*([\d,]+)/i,
    /(?:toward|for)\s*closing[^\d$]*\$?\s*([\d,]+(?:\.\d{2})?)/i,
  ];
  for (const re of patterns) {
    const hit = input.match(re);
    if (hit) {
      const n = parseFloat(hit[1].replace(/,/g, ""));
      if (Number.isFinite(n)) return n;
    }
  }
  return null;
}

export function mockExtractDeal(input: string): DealData {
  const deal: DealData = {
    address: null,
    price: null,
    closing_date: null,
    loan_type: null,
    buyer_name: null,
    seller_concessions: null,
    inspection_days: null,
    seller_name: null
  };

  const addr = input.match(
    /\b(\d{1,6}\s+[\w\s.'-]+?(?:st|street|ave|avenue|rd|road|dr|drive|ln|lane|blvd|boulevard|way|ct|court|pl|place)\b\.?)/i
  );
  if (addr) deal.address = addr[1].replace(/\s+/g, " ").trim();

  const priceK = input.match(/\$\s*([\d,]+(?:\.\d+)?)\s*k\b/i);
  const priceFull = input.match(/\$\s*([\d,]+(?:\.\d{2})?)\b/);
  const pricePlain = input.match(/\bfor\s+\$?\s*([\d,]+)\b/i);
  if (priceK) {
    deal.price = Math.round(parseFloat(priceK[1].replace(/,/g, "")) * 1000);
  } else if (priceFull) {
    deal.price = parseFloat(priceFull[1].replace(/,/g, ""));
  } else if (pricePlain) {
    deal.price = parseFloat(pricePlain[1].replace(/,/g, ""));
  }

  const lower = input.toLowerCase();
  if (/\bfha\b/.test(lower)) deal.loan_type = "FHA";
  else if (/\bva\b/.test(lower)) deal.loan_type = "VA";
  else if (/\busda\b/.test(lower)) deal.loan_type = "USDA";
  else if (/conventional/.test(lower)) deal.loan_type = "Conventional";

  deal.closing_date =
    parseNumericDate(input) || parseMonthDay(input) || null;

  const buyer =
    input.match(/(?:buyer|purchaser)(?:\s+is|\s*:\s*)\s*([A-Za-z][A-Za-z\s.'-]+)/i) ||
    input.match(/(?:for|with)\s+buyer\s+([A-Za-z][A-Za-z\s.'-]+)/i);
  if (buyer) deal.buyer_name = buyer[1].trim().split(/\s{2,}/)[0];

  const insp = input.match(
    /(\d+)\s*(?:day|days)\s*(?:inspection|due diligence|contingency)/i
  );
  if (insp) deal.inspection_days = parseInt(insp[1], 10);

  const insp2 = input.match(
    /inspection\s*(?:period|contingency)?\s*(?:of|:)?\s*(\d+)\s*days?/i
  );
  if (insp2 && deal.inspection_days == null)
    deal.inspection_days = parseInt(insp2[1], 10);

  deal.seller_concessions = parseSellerConcessionDollars(input);

  return deal;
}
