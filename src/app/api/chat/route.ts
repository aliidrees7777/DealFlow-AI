// import { NextResponse } from "next/server";
// import OpenAI from "openai";
// import { mockAssistantReply } from "@/lib/mock-chat";
// import type { DealData } from "@/types/deal";

// const COORDINATOR_SYSTEM = `You are a professional real estate transaction coordinator.

// Answer clearly, naturally, and conversationally—like an experienced human coordinator, not a checklist or form. Be helpful and proactive.

// Never reference transactions other than the current deal JSON provided in the user message. Do not invent facts; use only what is in that deal data. If something is unknown, say so briefly.

// Avoid stiff or robotic phrases (for example, do not say "core fields are present"). Prefer warm, practical language—e.g. "Everything looks good so far," "You may want to confirm lender details next," or "Let me know if you'd like me to draft an email."`;

// export async function POST(req: Request) {
//   let question = "";
//   let deal: DealData | null = null;
//   try {
//     const body = (await req.json()) as {
//       question?: string;
//       deal?: DealData | null;
//     };
//     question = typeof body.question === "string" ? body.question : "";
//     deal = body.deal ?? null;
//     if (!question.trim()) {
//       return NextResponse.json({ error: "Missing question" }, { status: 400 });
//     }

//     const key = process.env.OPENAI_API_KEY;
//     if (!key) {
//       return NextResponse.json({
//         reply: mockAssistantReply(question, deal),
//       });
//     }

//     const userPayload = `Here is the current deal:
// ${JSON.stringify(deal, null, 2)}

// Answer the user's question clearly, naturally, and like a human coordinator.

// Rules:
// - Use correct property details from the deal above
// - Never reference old deals or data not shown here
// - Be helpful and proactive
// - Avoid robotic phrases like "core fields are present"

// User question: ${question}`;

//     const openai = new OpenAI({ apiKey: key });
//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         { role: "system", content: COORDINATOR_SYSTEM },
//         { role: "user", content: userPayload },
//       ],
//       temperature: 0.45,
//     });

//     const reply = completion.choices[0]?.message?.content?.trim();
//     if (!reply) {
//       return NextResponse.json({ reply: mockAssistantReply(question, deal) });
//     }
//     return NextResponse.json({ reply });
//   } catch {
//     return NextResponse.json({ reply: mockAssistantReply(question, deal) });
//   }
// }

// import { NextResponse } from "next/server";
// import OpenAI from "openai";
// import { mockAssistantReply } from "@/lib/mock-chat";
// import type { DealData } from "@/types/deal";

// const COORDINATOR_SYSTEM = `
// You are a professional real estate transaction coordinator AI.
// Your job is to help agents complete deals and answer questions naturally.

// CORE RULES:
// - Use the provided deal data to answer.
// - If the user asks for a summary, email, or next steps, provide them based on current data.
// - If the user asks a general question, answer it helpfully.
// - If critical data is missing (address, price, buyer), and the user ISN'T asking for something specific like a summary, then gently remind them what's missing.

// TONE:
// Friendly, professional, and efficient.
// `;

// export async function POST(req: Request) {
//   try {
//     const body = (await req.json()) as {
//       question?: string;
//       deal?: DealData | null;
//     };

//     const question = body.question || "";
//     const deal = body.deal || null;
//     const lowerQuestion = question.toLowerCase();

//     if (!question.trim()) {
//       return NextResponse.json({ error: "Missing question" }, { status: 400 });
//     }

//     const key = process.env.OPENAI_API_KEY;
//     if (!key) {
//       return NextResponse.json({ reply: mockAssistantReply(question, deal) });
//     }

//     const openai = new OpenAI({ apiKey: key });

//     // --- ❌ PURANA BLOCKING LOGIC REMOVED ---
//     // Hum har haal mein AI ko call karenge taake woh user ki "Intent" samajh sake.
//     // Agar user "Summary" mang raha hai toh AI summary dega, chahe address missing ho.

//     const userPayload = `
// Current deal state:
// ${JSON.stringify(deal, null, 2)}

// User's Question:
// "${question}"

// Instructions:
// 1. If the user wants a summary, tell them what we have so far.
// 2. If the user asks "what is missing", list the null fields from the JSON.
// 3. If they ask a general real estate question, answer it.
// 4. Keep it conversational.
// `;

//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         { role: "system", content: COORDINATOR_SYSTEM },
//         { role: "user", content: userPayload },
//       ],
//       temperature: 0.5, // Thora zyada temperature taake natural baat kare
//     });

//     const reply = completion.choices[0]?.message?.content?.trim() || "I'm here to help with your deal.";

//     return NextResponse.json({ reply });
//   } catch (error) {
//     console.error("Chat API Error:", error);
//     return NextResponse.json({
//       reply: "I'm sorry, I'm having trouble connecting right now. Please try again.",
//     });
//   }
// }

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { mockAssistantReply } from "@/lib/mock-chat";
import type { DealData } from "@/types/deal";

const COORDINATOR_SYSTEM = `
You are a highly intelligent, human-like AI assistant similar to ChatGPT.

Your job is to help users naturally in conversation and assist with real estate contracts.

BEHAVIOR RULES:

1. Always understand user intent first
2. If user greets → respond naturally (do NOT jump into contract immediately)
3. If user asks for help → guide them step-by-step
4. If user wants to create a contract → act like a professional advisor
5. If deal data exists:
   - Use it intelligently
   - Mention missing info naturally (NOT like a bot)
6. NEVER repeat the same sentence structure
7. NEVER say "I still need..."
8. Ask follow-up questions naturally
9. Be conversational, friendly, and human-like
10. Do NOT behave like a form or checklist system

STYLE:
- Talk like a smart human assistant
- Keep responses natural and flowing

⚠️ RESPONSE LENGTH RULE (IMPORTANT):
- Keep answers VERY SHORT (max 2–4 lines)
- Avoid long paragraphs
- Ask ONLY ONE question at a time
- Do NOT over-explain unless user asks for detail

⚠️ OUTPUT BEHAVIOR:
- Prefer concise reply over explanation
- If user message is clear → just confirm + next step
`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      question?: string;
      deal?: DealData | null;
    };

    const question = body.question || "";
    const deal = body.deal || null;

    // ✅ BASIC VALIDATION (allowed hardcode)
    if (!question.trim()) {
      return NextResponse.json(
        { error: "Missing question" },
        { status: 400 }
      );
    }

    const key = process.env.GROQ_API_KEY;

    // ✅ DEV FALLBACK
    if (!key) {
      return NextResponse.json({
        reply: mockAssistantReply(question, deal),
      });
    }

    // ✅ GROQ CLIENT
    const client = new OpenAI({
      apiKey: key,
      baseURL: "https://api.groq.com/openai/v1",
    });

    // ✅ SMART PAYLOAD (AI decides everything)
    const userPayload = `
Conversation Context:
- User message: ${question}
- Deal data: ${JSON.stringify(deal, null, 2)}

INSTRUCTIONS:
- First understand what the user wants
- If it's casual → respond naturally
- If it's contract-related → guide step-by-step
- If deal exists → use it intelligently
- Ask questions naturally where needed
- Do NOT repeat phrases
- Keep conversation human-like
`;

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: COORDINATOR_SYSTEM },
        { role: "user", content: userPayload },
      ],
      temperature: 0, // 🔥 more natural responses
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ||
      "I'm here to help with your deal. Could you tell me a bit more about what you need?";

    return NextResponse.json({ reply });

  } catch (error) {
    console.error("Chat API Error:", error);

    return NextResponse.json({
      reply:
        "I'm having a little trouble connecting right now. Please try again in a moment.",
    });
  }
}