import { NextResponse } from "next/server";
import OpenAI from "openai";
import { mockExtractDeal } from "@/lib/mock-extract";
import { normalizeDeal } from "@/lib/normalize-deal";
import type { DealData } from "@/types/deal";

// ─────────────────────────────────────────────────────────────────────────────
// PROMPT 1 — EXTRACTION
// ─────────────────────────────────────────────────────────────────────────────
const EXTRACTION_PROMPT = `
You are a real estate data extraction engine for a luxury brokerage platform.

Your job: read the user's message + the existing deal context, then return a JSON object.

FIELDS TO RETURN (always return all of them):
- address            (string | null)  — Full street address: number + street + city + state. NO zip code.
- price              (number | null)  — Purchase price in USD. Digits only, no $ or commas.
- loan_type          (string | null)  — e.g. "FHA", "Conventional", "VA", "USDA", "Cash", "Jumbo"
- closing_date       (string | null)  — Exactly as the user said it, e.g. "April 28", "May 1, 2026"
- buyer_name         (string | null)  — Full name of the buyer
- seller_name        (string | null)  — Full name of the seller
- seller_concessions (number | null)  — Seller credit in USD, e.g. 5000
- inspection_days    (number | null)  — Inspection period in calendar days, e.g. 10
- address_ambiguous  (boolean)        — true if address is missing, incomplete, or unclear
- name_role_ambiguous (string | null) — if a name appears but role (buyer/seller) is unclear, put the name here

CRITICAL RULES:
1. If a field is clearly stated → extract it exactly
2. If NOT mentioned → return null (never invent values)
3. For address: ONLY extract if it has a real street number + street name + city/state.
   "Ali House 451" → address: null, address_ambiguous: true (no street number, no city/state)
   "House 451, Main Street, NY" → address: "House 451, Main Street, NY", address_ambiguous: false (has location info)
   "123 Main St, Springfield, IL" → address: "123 Main St, Springfield, IL", address_ambiguous: false
4. Names in ambiguous context: If "Ali House 451" → Ali could be a person's name.
   Set name_role_ambiguous: "Ali" ONLY when buyer_name and seller_name are BOTH null in existingDeal.
   If existingDeal already has buyer_name or seller_name filled → do NOT set name_role_ambiguous.
5. When user is answering a follow-up (e.g. just "FHA", "John Smith", "May 1"):
   Look at existingDeal nulls and map the answer to the correct missing field.
   Do NOT set name_role_ambiguous when user is clearly answering a direct question.
6. Return ONLY valid JSON. No markdown, no explanation.

MASTER PROMPT EXAMPLE:
"Write an offer for 123 Main St, FHA, $450,000, closing April 28, seller pays $5,000, inspection 10 days"
→ address: "123 Main St", price: 450000, loan_type: "FHA", closing_date: "April 28",
   seller_concessions: 5000, inspection_days: 10, buyer_name: null, seller_name: null,
   address_ambiguous: false, name_role_ambiguous: null
`;

// ─────────────────────────────────────────────────────────────────────────────
// PROMPT 2 — VALIDATION
// Lenient — only rejects obvious garbage. Accepts international formats.
// ─────────────────────────────────────────────────────────────────────────────
const VALIDATION_PROMPT = `
You are a real estate data validator for an AI transaction coordinator.

Given a field name and its extracted value, decide if it is plausible enough to use.

RULES PER FIELD:
- address: Accept ANY address from ANY country that has some location structure.
  "House 451, Main Street, NY" ✓  "478-F Block, Johar Town, Lahore" ✓  "123 Main St, IL" ✓
  Accept addresses even without traditional street numbers if they have a recognizable location name + city/state.
  ONLY reject: pure random letters like "asdfgh", "test address", zero location info.
  WHEN IN DOUBT → ACCEPT. It is better to accept a slightly odd address than frustrate the user.
- buyer_name / seller_name: Accept any human-sounding name from any culture worldwide.
  Reject only obvious garbage: "test", "asdf", "123", keyboard mashing.
- price: Accept any number between 10,000 and 100,000,000.
- closing_date: Accept any plausible date string. Only reject if completely unparseable.
- loan_type: Accept FHA, Conventional, VA, USDA, Cash, Jumbo, or any recognizable mortgage type.
- inspection_days: Accept any integer between 1 and 60.

Return ONLY this JSON — no extra text:
{ "valid": true }
OR
{ "valid": false, "reason": "one short sentence" }
`;

// ─────────────────────────────────────────────────────────────────────────────
// PROMPT 3 — QUESTION GENERATOR
// AI writes a fresh natural question every time — no hardcoded strings.
// ─────────────────────────────────────────────────────────────────────────────
const QUESTION_PROMPT = `
You are Alex — a sharp, warm, experienced AI real estate transaction coordinator at a luxury brokerage.

Your job: ask the user for ONE specific piece of information.
You have the deal context (what's already collected) and know which field is needed next.

STYLE RULES:
- Vary phrasing every time — never open the same way twice
- Reference deal details naturally when helpful (e.g. "For the Main St deal...")  
- Keep it to 1–2 sentences MAX
- Sound like a human TC who has done this hundreds of times
- Warm, confident, professional — like a text from a smart colleague
- ONE question only — never ask two things at once

NEVER SAY:
- "I need", "Please provide", "Required field", "Can you give me"
- Numbers, bullet points, or form-like language
- "I'm an AI" or anything that breaks the human-like feel

GOOD PHRASING EXAMPLES (vary these, don't copy exactly):
- address:        "Where's the property located? Street, city, and state works."
- price:          "And the purchase price on this one?"
- loan_type:      "How's the buyer financing — FHA, Conventional, VA, or cash?"
- buyer_name:     "Who's the buyer on this deal?"
- seller_name:    "Got it. And the seller's full name?"
- closing_date:   "What are we targeting for closing?"
- ambiguous name: "Quick one — is [NAME] the buyer or the seller here?"
- bad address:    "Hmm, that address didn't come through clearly — can you give me the full street, city, and state?"
- validation fail: Gently note the issue and ask again in 1 sentence.
`;

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const REQUIRED_FIELDS: (keyof DealData)[] = [
  "address",
  "price",
  "loan_type",
  "buyer_name",
  "seller_name",
  "closing_date",
];

const VALIDATABLE_FIELDS: (keyof DealData)[] = [
  "address",
  "buyer_name",
  "seller_name",
  "price",
  "closing_date",
  "loan_type",
];

const CONFIRMATION_PHRASES = [
  "correct", "move on", "that's right", "yes", "confirm", "is correct",
  "looks good", "proceed", "right", "yep", "yeah", "ok", "okay",
  "sure", "go ahead", "continue", "that is correct", "sounds good",
];

const FIELD_LABELS: Record<string, string> = {
  address:            "property address (street, city, state)",
  price:              "purchase price in USD",
  loan_type:          "financing type (FHA, Conventional, VA, USDA, Cash, or Jumbo)",
  buyer_name:         "buyer's full legal name",
  seller_name:        "seller's full legal name",
  closing_date:       "target closing date",
  seller_concessions: "seller concessions / closing cost credit in USD",
  inspection_days:    "inspection period in days",
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — Detect role assignment like "Ali is seller" or "buyer is John"
// Runs BEFORE extraction so we don't re-process confirmed data
// ─────────────────────────────────────────────────────────────────────────────
function detectRoleAssignment(
  input: string
): { name: string; role: "buyer" | "seller" } | null {
  const lower = input.toLowerCase().trim();

  const patterns = [
    /^(.+?)\s+is\s+(?:the\s+)?(buyer|seller)$/i,           // "Ali is seller"
    /^(.+?)\s+is\s+(?:the\s+)?(buyer|seller)\s*\.?$/i,     // "Ali is the seller."
    /^(buyer|seller)\s+is\s+(?:the\s+)?(.+)$/i,            // "seller is Ali"
    /^(.+?)\s*[=:]\s*(buyer|seller)$/i,                     // "Ali = seller"
    /^(?:the\s+)?(buyer|seller)\s*[=:]\s*(.+)$/i,          // "buyer: John Smith"
  ];

  for (const pattern of patterns) {
    const match = lower.match(pattern);
    if (match) {
      const isBuyerSellerFirst = ["buyer", "seller"].includes(match[1].trim());
      const rawName = isBuyerSellerFirst ? match[2].trim() : match[1].trim();
      const roleStr = isBuyerSellerFirst ? match[1].trim() : match[2].trim();

      // Capitalize each word of the name
      const formattedName = rawName
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      return {
        name: formattedName,
        role: roleStr === "buyer" ? "buyer" : "seller",
      };
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — Generate a natural AI question
// ─────────────────────────────────────────────────────────────────────────────
async function generateQuestion(
  client: OpenAI,
  scenario: {
    type: "missing_field" | "validation_retry" | "ambiguous_name" | "incomplete_address";
    field?: string;
    ambiguousName?: string;
    invalidReason?: string;
    dealSoFar: Partial<DealData>;
  }
): Promise<string> {
  const { type, field, ambiguousName, invalidReason, dealSoFar } = scenario;

  const knownParts = Object.entries(dealSoFar)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => `  ${k}: ${v}`);

  const context =
    knownParts.length > 0
      ? `Deal info collected so far:\n${knownParts.join("\n")}`
      : "No deal info collected yet.";

  let task = "";
  if (type === "missing_field" && field) {
    task = `Ask for: "${FIELD_LABELS[field] || field}". This is the next required field.`;
  } else if (type === "validation_retry" && field) {
    task = `The user gave an invalid value for "${FIELD_LABELS[field] || field}". Reason: "${invalidReason || "it didn't look right"}". Gently ask them to correct it.`;
  } else if (type === "ambiguous_name" && ambiguousName) {
    task = `The name "${ambiguousName}" was mentioned but it's unclear if they are the buyer or the seller. Ask which role they play in this deal.`;
  } else if (type === "incomplete_address") {
    task = `The user provided a partial or unclear address. Ask for the full property address with street, city, and state.`;
  }

  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: QUESTION_PROMPT },
        { role: "user", content: `${context}\n\nTask: ${task}` },
      ],
      temperature: 0.85,
      max_tokens: 80,
    });
    const reply = completion.choices[0]?.message?.content?.trim();
    return reply || `What's the ${FIELD_LABELS[field || ""] || field || "next detail"}?`;
  } catch {
    return `What's the ${FIELD_LABELS[field || ""] || field || "next detail"}?`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — Validate a single field value
// ─────────────────────────────────────────────────────────────────────────────
async function validateField(
  client: OpenAI,
  field: string,
  value: unknown
): Promise<{ valid: boolean; reason?: string }> {
  if (!VALIDATABLE_FIELDS.includes(field as keyof DealData)) return { valid: true };
  if (value === null || value === undefined || value === "") return { valid: true };

  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: VALIDATION_PROMPT },
        {
          role: "user",
          content: `Field: "${field}"\nValue: "${value}"\n\nIs this valid?`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0,
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return { valid: true };
    return JSON.parse(raw);
  } catch {
    return { valid: true }; // fail open
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — Merge fresh extraction with existing deal (fresh wins)
// ─────────────────────────────────────────────────────────────────────────────
function mergeDeal(fresh: DealData, existing: Partial<DealData>): DealData {
  return {
    address:            fresh.address            ?? existing.address            ?? null,
    price:              fresh.price              ?? existing.price              ?? null,
    loan_type:          fresh.loan_type          ?? existing.loan_type          ?? null,
    closing_date:       fresh.closing_date       ?? existing.closing_date       ?? null,
    buyer_name:         fresh.buyer_name         ?? existing.buyer_name         ?? null,
    seller_name:        fresh.seller_name        ?? existing.seller_name        ?? null,
    seller_concessions: fresh.seller_concessions ?? existing.seller_concessions ?? null,
    inspection_days:    fresh.inspection_days    ?? existing.inspection_days    ?? null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — Merge but exclude one invalid field (revert it to existing value)
// ─────────────────────────────────────────────────────────────────────────────
function mergeDealExcluding(
  fresh: DealData,
  existing: Partial<DealData>,
  excludeField: keyof DealData
): DealData {
  const merged = mergeDeal(fresh, existing);
  // Revert the invalid field back to whatever was in existing (or null)
  (merged[excludeField] as unknown) = existing[excludeField] ?? null;
  return merged;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────────────────────────────────────
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

    if (!key) {
      const mock = mockExtractDeal(input);
      return NextResponse.json({ status: "complete", deal: mock });
    }

    const client = new OpenAI({
      apiKey: key,
      baseURL: "https://api.groq.com/openai/v1",
    });

    // ── STEP 0A: Handle role assignment ("Ali is seller", "buyer is John") ──
    // Must run BEFORE everything else so we don't re-extract already-resolved info.
    const roleAssignment = detectRoleAssignment(input);
    if (roleAssignment) {
      // Build current deal from existing data
      const deal = normalizeDeal(existingDeal as Record<string, unknown>);

      // Assign the name to the correct role field
      if (roleAssignment.role === "buyer") {
        deal.buyer_name = roleAssignment.name;
      } else {
        deal.seller_name = roleAssignment.name;
      }

      // Check what's still missing
      const missingFields = REQUIRED_FIELDS.filter((f) => {
        const val = deal[f];
        return val === null || val === undefined || val === "";
      });

      if (missingFields.length > 0) {
        const nextField = missingFields[0];
        const question = await generateQuestion(client, {
          type: "missing_field",
          field: nextField,
          dealSoFar: deal,
        });
        return NextResponse.json({
          status: "incomplete",
          deal,
          missingField: nextField,
          question,
          remainingCount: missingFields.length,
        });
      }

      return NextResponse.json({ status: "complete", deal });
    }

    // ── STEP 0B: Handle simple confirmations ("yes", "correct", "move on") ──
    const isConfirmation =
      CONFIRMATION_PHRASES.some((p) => input.toLowerCase().includes(p)) &&
      Object.keys(existingDeal).length > 0;

    if (isConfirmation) {
      const deal = normalizeDeal(existingDeal as Record<string, unknown>);
      const missingFields = REQUIRED_FIELDS.filter((f) => {
        const val = deal[f];
        return val === null || val === undefined || val === "";
      });

      if (missingFields.length > 0) {
        const nextField = missingFields[0];
        const question = await generateQuestion(client, {
          type: "missing_field",
          field: nextField,
          dealSoFar: deal,
        });
        return NextResponse.json({
          status: "incomplete",
          deal,
          missingField: nextField,
          question,
          remainingCount: missingFields.length,
        });
      }

      return NextResponse.json({ status: "complete", deal });
    }

    // ── STEP 1: Extract fields from user message ───────────────────────────
    const extractCompletion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: EXTRACTION_PROMPT },
        {
          role: "user",
          content: `Existing deal data:\n${JSON.stringify(existingDeal, null, 2)}\n\nUser message: "${input}"\n\nExtract all fields. Return JSON with all 8 deal fields plus address_ambiguous and name_role_ambiguous.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const raw = extractCompletion.choices[0]?.message?.content;
    if (!raw) throw new Error("No extraction response from AI");

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const freshData = normalizeDeal(parsed);

    // Pull diagnostic flags
    const addressAmbiguous = parsed.address_ambiguous === true;

    // FIX: Only fire name_role_ambiguous if BOTH buyer and seller are still unknown
    // This prevents re-asking after one role has already been resolved
    const bothNamesMissing = !existingDeal.buyer_name && !existingDeal.seller_name;
    const nameRoleAmbiguous =
      bothNamesMissing &&
      typeof parsed.name_role_ambiguous === "string" &&
      parsed.name_role_ambiguous.trim()
        ? parsed.name_role_ambiguous.trim()
        : null;

    // ── STEP 2: Handle ambiguous name (fires only when both roles are unknown) ──
    if (nameRoleAmbiguous) {
      const partialDeal = mergeDeal(freshData, existingDeal);
      const question = await generateQuestion(client, {
        type: "ambiguous_name",
        ambiguousName: nameRoleAmbiguous,
        dealSoFar: partialDeal,
      });
      return NextResponse.json({
        status: "incomplete",
        deal: partialDeal,
        missingField: "buyer_name",
        question,
        remainingCount: REQUIRED_FIELDS.filter((f) => {
          const v = partialDeal[f];
          return v === null || v === undefined || v === "";
        }).length,
      });
    }

    // ── STEP 3: Handle incomplete / ambiguous address ──────────────────────
    // Only ask if address is genuinely missing (not already in existingDeal)
    if (addressAmbiguous && !existingDeal.address && !freshData.address) {
      const partialDeal = mergeDeal(freshData, existingDeal);
      const question = await generateQuestion(client, {
        type: "incomplete_address",
        dealSoFar: partialDeal,
      });
      return NextResponse.json({
        status: "incomplete",
        deal: partialDeal,
        missingField: "address",
        question,
        remainingCount: REQUIRED_FIELDS.filter((f) => {
          const v = partialDeal[f];
          return v === null || v === undefined || v === "";
        }).length,
      });
    }

    // ── STEP 4: Validate only newly extracted fields ───────────────────────
    for (const field of VALIDATABLE_FIELDS) {
      const newValue = freshData[field];
      const existingValue = (existingDeal as Record<string, unknown>)[field];

      // Skip if: not a new value, or same as what we already have
      const isNewValue =
        newValue !== null &&
        newValue !== undefined &&
        newValue !== "" &&
        newValue !== existingValue;

      if (isNewValue) {
        const result = await validateField(client, field, newValue);

        if (!result.valid) {
          const dealWithoutInvalid = mergeDealExcluding(
            freshData,
            existingDeal,
            field as keyof DealData
          );
          const question = await generateQuestion(client, {
            type: "validation_retry",
            field,
            invalidReason: result.reason,
            dealSoFar: dealWithoutInvalid,
          });

          return NextResponse.json({
            status: "invalid",
            deal: dealWithoutInvalid,
            invalidField: field,
            question,
          });
        }
      }
    }

    // ── STEP 5: Merge fresh + existing ────────────────────────────────────
    const deal = mergeDeal(freshData, existingDeal);

    // ── STEP 6: Check which required fields are still missing ──────────────
    const missingFields = REQUIRED_FIELDS.filter((field) => {
      const val = deal[field];
      return val === null || val === undefined || val === "";
    });

    if (missingFields.length > 0) {
      const nextField = missingFields[0];
      const question = await generateQuestion(client, {
        type: "missing_field",
        field: nextField,
        dealSoFar: deal,
      });

      return NextResponse.json({
        status: "incomplete",
        deal,
        missingField: nextField,
        question,
        remainingCount: missingFields.length,
      });
    }

    // ── STEP 7: All required fields present → contract ready ───────────────
    return NextResponse.json({ status: "complete", deal });

  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json({
      status: "error",
      message: "Something went wrong while processing your message. Please try again.",
    });
  }
}