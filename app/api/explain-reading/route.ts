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
    const prompt = `Provide a concise, devotional explanation of ${reference} for a general Canadian Anglican reader.
Write 2–3 short paragraphs with no headers, bullets, or formatting.

Paragraph 1: Give a brief historical or literary context in one or two sentences. For Psalms, note the type of psalm or its place in Israel’s worship life. For any other reading, note the setting or purpose of the passage within its book.

Paragraph 2 (or 2–3): Explain the key spiritual themes and what the passage shows about God’s character, His work in the world, and His relationship with His people, using two or three sentences.

Final paragraph: Offer a gentle reflection on how this passage can guide or encourage a believer in their daily Christian life today, in one or two sentences using a warm, pastoral tone.

Keep the entire response under 200 words and use plain text only.`;

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