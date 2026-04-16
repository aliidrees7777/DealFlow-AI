import { NextResponse } from "next/server";
import OpenAI from "openai";
import { mockExtractDeal } from "@/lib/mock-extract";
import { normalizeDeal } from "@/lib/normalize-deal";
import type { DealData } from "@/types/deal";

// ─── Extraction System Prompt ──────────────────────────────────────────────
const EXTRACTION_PROMPT = `
You are a real estate data extraction engine.

Your ONLY job is to extract structured deal fields from a user's message and return them as JSON.

FIELDS TO EXTRACT:
- address        (string: full property address)
- price          (number: purchase price in USD, no $ sign or commas)
- loan_type      (string: e.g. "FHA", "Conventional", "VA", "Cash")
- closing_date   (string: EXACTLY as said by user, e.g. "April 28", "May 15 2025")
- buyer_name     (string: full name of buyer)
- seller_concessions (number: seller credit amount in USD, e.g. 5000)
- inspection_days    (number: inspection period in calendar days, e.g. 10)

STRICT RULES:
1. If a field is mentioned -> extract it exactly
2. If a field is NOT mentioned -> return null for that field
3. NEVER invent or assume values
4. Return ONLY valid JSON, no extra text
5. If user is answering a follow-up (e.g. just "John Smith" or "April 28") -> map to the correct missing field based on existingDeal context
`;

// ─── Required fields before contract generation ─────────────────────────────
const REQUIRED_FIELDS: (keyof DealData)[] = [
  "address",
  "price",
  "loan_type",
  "buyer_name",
  "closing_date",
];

// ─── Natural clarifying questions per field ────────────────────────────────
const FIELD_QUESTIONS: Record<string, string> = {
  address: "What's the property address? (include city, state, and zip if possible)",
  price: "What's the purchase price?",
  loan_type: "What type of financing is the buyer using? (e.g. FHA, Conventional, VA, or Cash)",
  buyer_name: "What's the buyer's full name?",
  closing_date: "What's the target closing date?",
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      input?: string;
      existingDeal?: Partial<DealData>;
    };

    const input = body.input?.trim() || "";
    const existingDeal = body.existingDeal || {};

    if (!input) {
      return NextResponse.json({ error: "Missing input" }, { status: 400 });
    }

    const key = process.env.GROQ_API_KEY;


    // Dev fallback
    if (!key) {
      const mock = mockExtractDeal(input);
      return NextResponse.json({ status: "complete", deal: mock });
    }

    const client = new OpenAI({
      apiKey: key,
      baseURL: "https://api.groq.com/openai/v1",
    });

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: EXTRACTION_PROMPT },
        {
          role: "user",
          content: `Existing deal data so far:\n${JSON.stringify(existingDeal, null, 2)}\n\nUser message: "${input}"\n\nExtract any new information. Return JSON with all 7 fields (null for anything not mentioned).`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("No AI response");

    const parsed = JSON.parse(raw);
    const freshData = normalizeDeal(parsed);

    // Merge: fresh extraction wins, fallback to existing deal
    const deal: DealData = {
      address: freshData.address ?? (existingDeal.address as string | null) ?? null,
      price: freshData.price ?? (existingDeal.price as number | null) ?? null,
      loan_type: freshData.loan_type ?? (existingDeal.loan_type as string | null) ?? null,
      closing_date: freshData.closing_date ?? (existingDeal.closing_date as string | null) ?? null,
      buyer_name: freshData.buyer_name ?? (existingDeal.buyer_name as string | null) ?? null,
      seller_concessions: freshData.seller_concessions ?? (existingDeal.seller_concessions as number | null) ?? null,
      inspection_days: freshData.inspection_days ?? (existingDeal.inspection_days as number | null) ?? null,
    };

    // Check which required fields are still missing
    const missingFields = REQUIRED_FIELDS.filter((field) => {
      const val = deal[field];
      return val === null || val === undefined || val === "";
    });

    // If something required is still missing -> ask first missing question
    if (missingFields.length > 0) {
      const nextField = missingFields[0];
      const question = FIELD_QUESTIONS[nextField] ?? `Can you provide the ${nextField}?`;

      return NextResponse.json({
        status: "incomplete",
        deal,
        missingField: nextField,
        question,
        remainingCount: missingFields.length,
      });
    }

    // All required fields present -> contract is ready
    return NextResponse.json({
      status: "complete",
      deal,
    });

  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json({
      status: "error",
      message: "Something went wrong while extracting deal data. Please try again.",
    });
  }
}
