
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { SleepData } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Helper to wait for a specific duration
 */
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generic retry wrapper with exponential backoff for Gemini API calls
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = error?.message?.includes("429") || error?.status === 429 || error?.message?.includes("RESOURCE_EXHAUSTED");
    const isServerError = error?.status >= 500;
    
    if ((isRateLimit || isServerError) && retries > 0) {
      console.warn(`Gemini API error (Status: ${error?.status || 'Unknown'}). Retrying in ${delay}ms... (${retries} attempts left)`);
      await wait(delay);
      return withRetry(fn, retries - 1, delay * 2.5);
    }
    throw error;
  }
}

export const analyzeGratitudeJournal = async (transcript: string) => {
  const ai = getAI();
  try {
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an empathetic, kind, and supportive friend. My user just recorded a gratitude journal entry: "${transcript}". 
      Respond as a friend would—validating their feelings, celebrating their small wins, and offering a gentle, calming closing statement. Keep it brief (2-3 sentences).`,
      config: {
        temperature: 0.7,
        topP: 0.9,
      },
    }));
    return response.text || "I'm glad you shared that with me. It sounds like a meaningful reflection.";
  } catch (error) {
    console.error("Gratitude analysis failed permanently:", error);
    return "Thank you for sharing your thoughts in your sanctuary today. Your reflection is safe here.";
  }
};

export const analyzeSleepAndHealth = async (sleepHistory: SleepData[], journalHistory: string[]) => {
  const ai = getAI();
  const sleepContext = JSON.stringify(sleepHistory.slice(-7)); 
  const journalContext = journalHistory.slice(0, 5).join(" | ");

  try {
    // Switched to gemini-3-flash-preview for higher throughput and better quota management
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this user's sleep data and gratitude journal snippets to provide a health insight report.
      Sleep Data: ${sleepContext}
      Journal Mood Snippets: ${journalContext}
      
      Task: 
      1. Calculate an overall Sleep Score (0-100).
      2. Identify potential patterns suggesting health concerns (e.g., Burnout, Anxiety, Restlessness).
      3. Provide actionable advice for a corporate tech professional.
      
      Format the response in JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            label: { type: Type.STRING },
            predictions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            advice: { type: Type.STRING }
          },
          required: ["score", "label", "predictions", "advice"]
        }
      }
    }));

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Health Analysis failed permanently:", error);
    
    if (error?.message?.includes("quota") || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      console.warn("API Quota exceeded. Using local calculation heuristics.");
    }

    const avgSleep = sleepHistory.length > 0 
      ? sleepHistory.reduce((acc, s) => acc + s.hours, 0) / sleepHistory.length 
      : 7;
    const baseScore = Math.min(Math.round((avgSleep / 8) * 100), 95);

    return {
      score: baseScore,
      label: baseScore > 80 ? "Restorative" : baseScore > 60 ? "Balanced" : "Fatigued",
      predictions: ["Continue logging for personalized AI insights"],
      advice: "Try to maintain a consistent sleep schedule while your AI companion recharges."
    };
  }
};
