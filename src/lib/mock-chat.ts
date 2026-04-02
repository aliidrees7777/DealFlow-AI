import type { DealData } from "@/types/deal";
import {
  formatBuyerName,
  formatDisplayDate,
  formatPrice,
  formatSellerConcessions,
  getMissingCriticalFields,
} from "@/lib/deal-helpers";

export function mockAssistantReply(question: string, deal: DealData | null): string {
  const q = question.toLowerCase();
  const missing = deal ? getMissingCriticalFields(deal) : [];

  if (!deal) {
    return "Start by describing your deal in the box at the top and hit Generate Deal. Once it’s loaded, I’ll stay in sync with whatever’s on your dashboard—ask about gaps, next steps, or a draft email.";
  }

  if (q.includes("missing") || q.includes("incomplete") || q.includes("what am i")) {
    const gaps: string[] = [];
    if (missing.includes("buyer_name")) gaps.push("buyer name");
    if (missing.includes("closing_date")) gaps.push("closing date");
    if (!deal.address) gaps.push("property address");
    if (deal.price == null) gaps.push("purchase price");
    if (!deal.loan_type) gaps.push("loan type");

    if (gaps.length === 0) {
      return "Everything looks good so far on the basics. You may still want to confirm lender conditions, title, and any HOA docs before closing—happy to help you think through that.";
    }
    return `Here’s what I’d still want pinned down: ${gaps.join(", ")}. If you fill those in on the deal, I can get more specific.`;
  }

  if (q.includes("summarize") || q.includes("summary") || q.includes("overview")) {
    return [
      "Quick snapshot of what I’m seeing:",
      `• Property: ${deal.address ?? "TBD"}`,
      `• Price: ${formatPrice(deal.price)}`,
      `• Closing: ${formatDisplayDate(deal.closing_date)}`,
      `• Buyer: ${formatBuyerName(deal.buyer_name)}`,
      `• Loan: ${deal.loan_type ?? "TBD"}`,
      deal.inspection_days != null
        ? `• Inspection window: ${deal.inspection_days} days`
        : null,
      `• Seller concessions: ${formatSellerConcessions(deal.seller_concessions)}`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (q.includes("email") || q.includes("lender") || q.includes("write")) {
    const buyerLabel =
      formatBuyerName(deal.buyer_name) === "TBD"
        ? "the buyer"
        : formatBuyerName(deal.buyer_name);
    return `Subject: Financing update — ${deal.address ?? "your property"}

Hi,

Following up on ${buyerLabel}’s purchase at ${deal.address ?? "[address]"}. We’re working toward closing on ${formatDisplayDate(deal.closing_date)} at ${formatPrice(deal.price)}. Can you confirm status on the loan and any outstanding conditions?

Thanks, and let me know if you need anything else from our side.`;
  }

  return `I’m working off this deal: ${deal.address ?? "address TBD"}, ${formatPrice(deal.price)}, closing ${formatDisplayDate(deal.closing_date)}. Tell me what you need—summary, what’s missing, or a draft note—and I’ll tailor it.`;
}
