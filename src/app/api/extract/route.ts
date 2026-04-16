// import { NextResponse } from "next/server";
// import OpenAI from "openai";
// import { mockExtractDeal } from "@/lib/mock-extract";
// import { normalizeDeal } from "@/lib/normalize-deal";

// const EXTRACTION_PROMPT = `Extract structured real estate deal data from the input.

// Return ONLY valid JSON with:
// - address (string)
// - price (number)
// - loan_type (string)
// - closing_date (string EXACTLY as mentioned, DO NOT modify or infer year)
// - buyer_name (string or null)
// - seller_concessions (number if mentioned, else null)
// - inspection_days (number if mentioned, else null)

// IMPORTANT RULES:
// - DO NOT change dates
// - DO NOT assume missing values
// - If not provided, return null
// - Extract seller concessions from phrases like:
//   'seller pays', 'seller to cover', 'credit', 'closing cost help'

// Input:`;

// export async function POST(req: Request) {
//   let input = "";
//   try {
//     const body = (await req.json()) as { input?: string };
//     input = typeof body.input === "string" ? body.input : "";
//     if (!input.trim()) {
//       return NextResponse.json({ error: "Missing input" }, { status: 400 });
//     }

//     const key = process.env.OPENAI_API_KEY;
//     if (!key) {
//       return NextResponse.json({ deal: mockExtractDeal(input) });
//     }

//     const openai = new OpenAI({ apiKey: key });
//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         { role: "system", content: EXTRACTION_PROMPT },
//         { role: "user", content: input },
//       ],
//       response_format: { type: "json_object" },
//       temperature: 0.1,
//     });

//     const raw = completion.choices[0]?.message?.content;
//     if (!raw) {
//       return NextResponse.json({ deal: mockExtractDeal(input) });
//     }

//     const parsed = JSON.parse(raw) as Partial<Record<string, unknown>>;
//     // const deal = normalizeDeal(parsed);
//     // return NextResponse.json({ deal });
//     const deal = normalizeDeal(parsed);

// const missingFields = [];
// if (!deal.address) missingFields.push("address");
// if (!deal.price) missingFields.push("price");
// if (!deal.loan_type) missingFields.push("loan_type");
// if (!deal.buyer_name) missingFields.push("buyer_name");
// if (!deal.closing_date) missingFields.push("closing_date");

// if (missingFields.length > 0) {
//   return NextResponse.json({
//     status: "pending",
//     field: missingFields[0],
//     question: `Please provide ${missingFields[0]}`
//   });
// }

// return NextResponse.json({
//   status: "complete",
//   deal
// });
//   } catch {
//     return NextResponse.json({ deal: mockExtractDeal(input) });
//   }
// }





// import { NextResponse } from "next/server";
// import OpenAI from "openai";
// import { mockExtractDeal } from "@/lib/mock-extract";
// import { normalizeDeal } from "@/lib/normalize-deal";

// const EXTRACTION_PROMPT = `
// You are a real estate extraction system. 
// Extract data into JSON. 

// CRITICAL RULES:
// 1. Compare "input" with "existingDeal".
// 2. If the user provides NEW info, update the field.
// 3. If information is missing, set the field to null.
// 4. If the user is answering a previous question (e.g., just providing a name or price), map it to the correct field.
// 5. NEVER return "TBD" or "Pending" in JSON, use null.

// FIELDS:
// - address
// - price
// - loan_type
// - closing_date
// - buyer_name
// - seller_concessions
// - inspection_days
// `;

// export async function POST(req: Request) {
//   try {
//     const body = await req.json() as {
//       input?: string;
//       existingDeal?: any;
//     };

//     const input = body.input || "";
//     const existingDeal = body.existingDeal || {};

//     if (!input.trim()) {
//       return NextResponse.json({ error: "Missing input" }, { status: 400 });
//     }

//     const key = process.env.OPENAI_API_KEY;

//     if (!key) {
//       const mock = mockExtractDeal(input);
//       return NextResponse.json({ status: "complete", deal: mock });
//     }

//     const openai = new OpenAI({ apiKey: key });

//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         { role: "system", content: EXTRACTION_PROMPT },
//         {
//           role: "user",
//           content: `existingDeal: ${JSON.stringify(existingDeal)}\n\ninput: ${input}`
//         }
//       ],
//       response_format: { type: "json_object" },
//       temperature: 0.1,
//     });

//     const raw = completion.choices[0]?.message?.content;
//     if (!raw) throw new Error("No AI response");

//     const parsed = JSON.parse(raw);
//     const newData = normalizeDeal(parsed);

//     // ✅ FIXED MERGE LOGIC: New data gets priority, but keeps old data if new is null
//     const deal = {
//       address: newData.address || existingDeal.address || null,
//       price: newData.price ?? existingDeal.price ?? null,
//       loan_type: newData.loan_type || existingDeal.loan_type || null,
//       closing_date: newData.closing_date || existingDeal.closing_date || null,
//       buyer_name: newData.buyer_name || existingDeal.buyer_name || null,
//       seller_concessions: newData.seller_concessions ?? existingDeal.seller_concessions ?? null,
//       inspection_days: newData.inspection_days ?? existingDeal.inspection_days ?? null,
//     };

//     // 🧠 Missing fields detection with better names
//     const missingFields: string[] = [];
//     if (!deal.address) missingFields.push("Property Address");
//     if (!deal.price) missingFields.push("Purchase Price");
//     if (!deal.buyer_name) missingFields.push("Buyer Name");
//     if (!deal.loan_type) missingFields.push("Loan Type (e.g. FHA, Conventional)");

//     // 🔁 If something missing → Ask clearly
//     if (missingFields.length > 0) {
//       return NextResponse.json({
//         status: "pending",
//         deal,
//         question: `I've updated the deal, but I still need the ${missingFields[0]} to complete the contract.`
//       });
//     }

//     return NextResponse.json({
//       status: "complete",
//       deal
//     });

//   } catch (error) {
//     console.error("Extraction error:", error);
//     return NextResponse.json({ status: "error", message: "Something went wrong" });
//   }
// }


import { NextResponse } from "next/server";
import OpenAI from "openai";
import { mockExtractDeal } from "@/lib/mock-extract";
import { normalizeDeal } from "@/lib/normalize-deal";

const EXTRACTION_PROMPT = `
You are a real estate contract extraction AI.

Your job is to extract structured deal information and return a CLEAN REPORT FORMAT.

RULES:
- Extract all available fields from input
- If field exists → show value
- If missing → write "MISSING"
- Do NOT return JSON
- Return HUMAN READABLE structured text only

FIELDS:
- address
- price
- loan_type
- closing_date
- buyer_name
- seller_concessions
- inspection_days

OUTPUT FORMAT EXAMPLE:

address: 123 New York  
price: 45000  
loan_type: VA  
closing_date: MISSING  
buyer_name: Aslan  
seller_concessions: 5000  
inspection_days: 15

STRICT RULES:
- Always follow same format
- Never explain anything
- Never add extra text
`;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      input?: string;
      existingDeal?: any;
    };

    const input = body.input || "";
    const existingDeal = body.existingDeal || {};

    if (!input.trim()) {
      return NextResponse.json(
        { error: "Missing input" },
        { status: 400 }
      );
    }

    const key = process.env.GROQ_API_KEY;

    if (!key) {
      const mock = mockExtractDeal(input);
      return NextResponse.json({
        status: "complete",
        deal: mock,
      });
    }

    // ✅ GROQ CLIENT
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
          content: `
        Existing Deal:
       ${JSON.stringify(existingDeal, null, 2)}

       User Input:
       ${input}
          `,
        },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("No AI response");

    const parsed = JSON.parse(raw);
    const newData = normalizeDeal(parsed);

    // ✅ SAFE MERGE (IMPORTANT FIX)
    const deal = {
      address:
        newData.address !== undefined && newData.address !== ""
          ? newData.address
          : existingDeal.address ?? null,

      price:
        newData.price !== undefined && newData.price !== null
          ? newData.price
          : existingDeal.price ?? null,

      loan_type:
        newData.loan_type !== undefined && newData.loan_type !== ""
          ? newData.loan_type
          : existingDeal.loan_type ?? null,

      closing_date:
        newData.closing_date !== undefined && newData.closing_date !== ""
          ? newData.closing_date
          : existingDeal.closing_date ?? null,

      buyer_name:
        newData.buyer_name !== undefined && newData.buyer_name !== ""
          ? newData.buyer_name
          : existingDeal.buyer_name ?? null,

      seller_concessions:
        newData.seller_concessions !== undefined &&
        newData.seller_concessions !== null
          ? newData.seller_concessions
          : existingDeal.seller_concessions ?? null,

      inspection_days:
        newData.inspection_days !== undefined &&
        newData.inspection_days !== null
          ? newData.inspection_days
          : existingDeal.inspection_days ?? null,
    };

    return NextResponse.json({
      status: "success",
      deal,
    });

  } catch (error) {
    console.error("Extraction error:", error);

    return NextResponse.json({
      status: "error",
      message: "Something went wrong while extracting deal data.",
    });
  }
}