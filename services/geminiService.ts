import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

try {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} catch (error) {
    console.warn("API_KEY not found or invalid. AI features will be disabled.");
}

export const solveMathExpression = async (expression: string): Promise<string> => {
  if (!ai) {
    throw new Error("API Key is missing. Cannot call Gemini.");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a helpful math assistant. Solve the following math problem or expression: "${expression}".
      
      Rules:
      1. Return ONLY the numeric result or the final short answer.
      2. If it is a word problem, provide just the final number or short unit (e.g. "42 km").
      3. Do not show work.
      4. If the input is invalid or not math-related, return "Error".`,
    });

    return response.text?.trim() || "Error";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error";
  }
};