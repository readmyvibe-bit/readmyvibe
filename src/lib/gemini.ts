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

export type GenerateReadingOptions = {
  maxOutputTokens?: number;
  temperature?: number;
};

export async function generateReading(prompt: string, opts?: GenerateReadingOptions): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const maxOutputTokens = opts?.maxOutputTokens ?? 4096;
  const temperature = opts?.temperature ?? 0.9;

  let lastError: unknown;
  for (const modelName of DEFAULT_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature,
          maxOutputTokens,
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

/** One punchy line for share graphics — must reflect this reading, not a generic opener. */
export async function generateShareCardQuote(fullResult: string, toolName: string): Promise<string> {
  const prompt = `You write short Instagram card text for ReadMyVibe.

Product: ${toolName}

Full reading:
${fullResult.slice(0, 6000)}

Output EXACTLY one line, max 130 characters, plain text only.
- Capture the funniest or most specific "mic drop" from THIS reading (habits, dynamics, in-jokes, names if natural).
- Do NOT use generic host / narrator openers ("Alright everyone", "Settle in", "Ladies and gentlemen", "We're here to celebrate").
- Prefer a punchline from the middle or later sections over the first sentence.
- No quotation marks around the line. No label like "Quote:".`;

  const raw = await generateReading(prompt, { maxOutputTokens: 256, temperature: 0.85 });
  const line =
    raw
      .split(/\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => l.replace(/^["'“”]+|["'“”]+$/g, "").trim())
      .find((l) => l.length > 0) || raw.trim();
  return line.slice(0, 200);
}
