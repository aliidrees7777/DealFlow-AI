import { NextResponse } from "next/server";
import OpenAI from "openai";
import { mockAssistantReply } from "@/lib/mock-chat";
import type { DealData } from "@/types/deal";

const COORDINATOR_SYSTEM = `You are a professional real estate transaction coordinator.

Answer clearly, naturally, and conversationally—like an experienced human coordinator, not a checklist or form. Be helpful and proactive.

Never reference transactions other than the current deal JSON provided in the user message. Do not invent facts; use only what is in that deal data. If something is unknown, say so briefly.

Avoid stiff or robotic phrases (for example, do not say "core fields are present"). Prefer warm, practical language—e.g. "Everything looks good so far," "You may want to confirm lender details next," or "Let me know if you'd like me to draft an email."`;

export async function POST(req: Request) {
  let question = "";
  let deal: DealData | null = null;
  try {
    const body = (await req.json()) as {
      question?: string;
      deal?: DealData | null;
    };
    question = typeof body.question === "string" ? body.question : "";
    deal = body.deal ?? null;
    if (!question.trim()) {
      return NextResponse.json({ error: "Missing question" }, { status: 400 });
    }

    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return NextResponse.json({
        reply: mockAssistantReply(question, deal),
      });
    }

    const userPayload = `Here is the current deal:
${JSON.stringify(deal, null, 2)}

Answer the user's question clearly, naturally, and like a human coordinator.

Rules:
- Use correct property details from the deal above
- Never reference old deals or data not shown here
- Be helpful and proactive
- Avoid robotic phrases like "core fields are present"

User question: ${question}`;

    const openai = new OpenAI({ apiKey: key });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: COORDINATOR_SYSTEM },
        { role: "user", content: userPayload },
      ],
      temperature: 0.45,
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    if (!reply) {
      return NextResponse.json({ reply: mockAssistantReply(question, deal) });
    }
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ reply: mockAssistantReply(question, deal) });
  }
}
