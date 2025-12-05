// app/api/explain-reading/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { reference } = await req.json();

    console.log("Received reference:", reference);

    // Check if API key exists
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.error("GOOGLE_GEMINI_API_KEY is not set");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    if (!reference) {
      return NextResponse.json(
        { error: "Reference is required" },
        { status: 400 }
      );
    }

    console.log("Initializing Gemini with API key:", process.env.GOOGLE_GEMINI_API_KEY.substring(0, 10) + "...");

    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Provide a succinct, mobile-friendly devotional explanation of ${reference} for the lay Christian reader.

Include:
1. Historical/literary context (1-2 sentences)
2. Key themes and spiritual significance (2-3 sentences)
3. How this passage speaks to daily Christian life (1-2 sentences)

Keep the total response under 200 words and write in a warm, accessible tone suitable for morning or evening prayer reflection.

Do not include markdown formatting or headers - just clear paragraphs.`;

    console.log("Sending request to Gemini...");
    const result = await model.generateContent(prompt);
    const explanation = result.response.text();
    
    console.log("Got response from Gemini");

    return NextResponse.json({ explanation });
  } catch (error) {
    console.error("Detailed error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate explanation" },
      { status: 500 }
    );
  }
}