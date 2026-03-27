import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const DEFAULT_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-1.5-flash-latest",
].filter(Boolean) as string[];

function isModelUnavailableError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("not found for API version") ||
    message.includes("no longer available") ||
    message.includes("404 Not Found")
  );
}

export async function generateReading(prompt: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  let lastError: unknown;
  for (const modelName of DEFAULT_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 1024,
        },
      });

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      lastError = error;
      if (!isModelUnavailableError(error)) {
        throw error;
      }
    }
  }

  const message = lastError instanceof Error ? lastError.message : "Unable to generate reading";
  throw new Error(`All configured Gemini models failed. ${message}`);
}
