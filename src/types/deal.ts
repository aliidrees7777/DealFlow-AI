export type DealData = {
  address: string | null;
  price: number | null;
  loan_type: string | null;
  /** Verbatim or YYYY-MM-DD — never auto-modified after extraction */
  closing_date: string | null;
  buyer_name: string | null;
  seller_name: string | null;
  seller_concessions: number | null;
  inspection_days: number | null;
  status?: string | null;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};