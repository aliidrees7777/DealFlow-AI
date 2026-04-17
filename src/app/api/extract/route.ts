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
- address        (string: street address only — do NOT include zip code, just street + city + state)
- price          (number: purchase price in USD, no $ sign or commas)
- loan_type      (string: e.g. "FHA", "Conventional", "VA", "Cash")
- closing_date   (string: EXACTLY as said by user, e.g. "April 28", "May 15 2025")
- buyer_name     (string: full name of buyer)
- seller_name    (string: full name of seller)
- seller_concessions (number: seller credit amount in USD, e.g. 5000)
- inspection_days    (number: inspection period in calendar days, e.g. 10)

STRICT RULES:
1. If a field is mentioned -> extract it exactly
2. If a field is NOT mentioned -> return null for that field
3. NEVER invent or assume values
4. Return ONLY valid JSON, no extra text
5. If user is answering a follow-up (e.g. just "John Smith" or "April 28") -> map to the correct missing field based on existingDeal context
6. For address: strip zip codes. "123 Main St, Springfield, IL 62701" becomes "123 Main St, Springfield, IL"
`;

// ─── Validation System Prompt ────────────────────────────────────────────────
const VALIDATION_PROMPT = `
You are a real estate data validator. Given a field name and a value, determine if it is plausible and real.

Rules:
- address: Must look like a real street address with a street number and name. City must be a real or plausible US city/area. Return invalid if it looks made-up (e.g. "asdfgh city", random letters).
- buyer_name / seller_name: Must look like a real human name (first + last name). Not "test", "asdf", "123", etc.
- price: Must be a number between 10000 and 100000000.
- closing_date: Must be a plausible date string.
- loan_type: Must be one of FHA, Conventional, VA, USDA, Cash, Jumbo, or similar recognized mortgage type.
- inspection_days: Must be a number between 1 and 60.

Return JSON: { "valid": true } or { "valid": false, "reason": "brief human-readable reason" }
Return ONLY valid JSON, no extra text.
`;

// ─── Required fields ─────────────────────────────────────────────────────────
const REQUIRED_FIELDS: (keyof DealData)[] = [
  "address",
  "price",
  "loan_type",
  "buyer_name",
  "closing_date",
];

// ─── Conversational AI-agent style questions ──────────────────────────────────
const FIELD_QUESTIONS: Record<string, string> = {
  address: "What's the property address? (street, city, and state)?",
  price: "What's the purchase price for this property?",
  loan_type: "How is the buyer financing this? (e.g. FHA, Conventional, VA, or Cash)",
  buyer_name: "What's the buyer's full name?",
  closing_date: "What's the target closing date?",
};

// ─── Validation retry messages ─────────────────────────────────────────────
const VALIDATION_RETRY: Record<string, string> = {
  address: "That address doesn't look like a real location. Can you double-check it? (e.g. 123 Main St, Springfield, IL)",
  buyer_name: "That doesn't look like a real name. Can you provide the buyer's full legal name?",
  seller_name: "That doesn't look like a real name. Can you provide the seller's full legal name?",
  price: "That purchase price seems off. Please enter a valid amount (e.g. 450000).",
  closing_date: "I couldn't parse that as a date. When is the target closing date? (e.g. April 28, 2026)",
  loan_type: "I don't recognize that loan type. Please use FHA, Conventional, VA, USDA, Cash, or Jumbo.",
};

// ─── Validate a single field via AI ──────────────────────────────────────────
async function validateField(
  client: OpenAI,
  field: string,
  value: unknown
): Promise<{ valid: boolean; reason?: string }> {
  const validatableFields = ["address", "buyer_name", "seller_name", "price", "closing_date", "loan_type"];
  if (!validatableFields.includes(field)) return { valid: true };
  if (value === null || value === undefined || value === "") return { valid: true };

  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: VALIDATION_PROMPT },
        { role: "user", content: `Field: "${field}"\nValue: "${value}"\n\nIs this valid?` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return { valid: true };
    return JSON.parse(raw);
  } catch {
    return { valid: true }; // fail open
  }
}

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

    // ── Step 1: Extract ────────────────────────────────────────────────────
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: EXTRACTION_PROMPT },
        {
          role: "user",
          content: `Existing deal data so far:\n${JSON.stringify(existingDeal, null, 2)}\n\nUser message: "${input}"\n\nExtract any new information. Return JSON with all 8 fields (null for anything not mentioned).`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("No AI response");

    const parsed = JSON.parse(raw);
    const freshData = normalizeDeal(parsed);

    // ── Step 2: Validate newly extracted fields ────────────────────────────
    const fieldsToValidate: (keyof DealData)[] = ["address", "buyer_name", "price", "closing_date", "loan_type"];

    for (const field of fieldsToValidate) {
      const newValue = freshData[field];
      const existingValue = (existingDeal as Record<string, unknown>)[field];
      if (newValue !== null && newValue !== existingValue) {
        const result = await validateField(client, field, newValue);
        if (!result.valid) {
          // Build deal without the invalid field
          const safeVal = (f: keyof DealData) =>
            f === field
              ? (existingDeal[f] as never) ?? null
              : (freshData[f] ?? (existingDeal[f] as never) ?? null);

          const dealWithoutInvalid: DealData = {
            address: safeVal("address"),
            price: safeVal("price"),
            loan_type: safeVal("loan_type"),
            closing_date: safeVal("closing_date"),
            buyer_name: safeVal("buyer_name"),
            seller_name: safeVal("seller_name"),
            seller_concessions: safeVal("seller_concessions"),
            inspection_days: safeVal("inspection_days"),
          };

          return NextResponse.json({
            status: "invalid",
            deal: dealWithoutInvalid,
            invalidField: field,
            question: VALIDATION_RETRY[field] ?? `That ${field} doesn't look right. Could you double-check it?`,
          });
        }
      }
    }

    // ── Step 3: Merge ──────────────────────────────────────────────────────
    const deal: DealData = {
      address: freshData.address ?? (existingDeal.address as string | null) ?? null,
      price: freshData.price ?? (existingDeal.price as number | null) ?? null,
      loan_type: freshData.loan_type ?? (existingDeal.loan_type as string | null) ?? null,
      closing_date: freshData.closing_date ?? (existingDeal.closing_date as string | null) ?? null,
      buyer_name: freshData.buyer_name ?? (existingDeal.buyer_name as string | null) ?? null,
      seller_name: freshData.seller_name ?? (existingDeal.seller_name as string | null) ?? null,
      seller_concessions: freshData.seller_concessions ?? (existingDeal.seller_concessions as number | null) ?? null,
      inspection_days: freshData.inspection_days ?? (existingDeal.inspection_days as number | null) ?? null,
    };

    // ── Step 4: Check missing required fields ──────────────────────────────
    const missingFields = REQUIRED_FIELDS.filter((field) => {
      const val = deal[field];
      return val === null || val === undefined || val === "";
    });

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

    return NextResponse.json({ status: "complete", deal });

  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json({
      status: "error",
      message: "Something went wrong while extracting deal data. Please try again.",
    });
  }
}