import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

export async function generateReading(prompt: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 1024,
    },
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}
