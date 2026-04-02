import { NextResponse } from "next/server";
import OpenAI from "openai";
import { mockExtractDeal } from "@/lib/mock-extract";
import { normalizeDeal } from "@/lib/normalize-deal";

const EXTRACTION_PROMPT = `Extract structured real estate deal data from the input.

Return ONLY valid JSON with:
- address (string)
- price (number)
- loan_type (string)
- closing_date (string EXACTLY as mentioned, DO NOT modify or infer year)
- buyer_name (string or null)
- seller_concessions (number if mentioned, else null)
- inspection_days (number if mentioned, else null)

IMPORTANT RULES:
- DO NOT change dates
- DO NOT assume missing values
- If not provided, return null
- Extract seller concessions from phrases like:
  'seller pays', 'seller to cover', 'credit', 'closing cost help'

Input:`;

export async function POST(req: Request) {
  let input = "";
  try {
    const body = (await req.json()) as { input?: string };
    input = typeof body.input === "string" ? body.input : "";
    if (!input.trim()) {
      return NextResponse.json({ error: "Missing input" }, { status: 400 });
    }

    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return NextResponse.json({ deal: mockExtractDeal(input) });
    }

    const openai = new OpenAI({ apiKey: key });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: EXTRACTION_PROMPT },
        { role: "user", content: input },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json({ deal: mockExtractDeal(input) });
    }

    const parsed = JSON.parse(raw) as Partial<Record<string, unknown>>;
    const deal = normalizeDeal(parsed);
    return NextResponse.json({ deal });
  } catch {
    return NextResponse.json({ deal: mockExtractDeal(input) });
  }
}
