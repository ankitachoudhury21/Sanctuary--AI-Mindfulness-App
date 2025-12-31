
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { SleepData, UserProfile } from "../types";

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
      console.warn(`Gemini API busy. Retrying... (${retries} attempts left)`);
      await wait(delay);
      return withRetry(fn, retries - 1, delay * 1.5);
    }
    throw error;
  }
}

/**
 * Analyzes a gratitude reflection and provides an empathetic insight.
 */
export const analyzeGratitudeJournal = async (transcript: string): Promise<{ success: boolean, message: string }> => {
  const ai = getAI();
  try {
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a wise mindfulness mentor. A tech professional is reflecting on their day: "${transcript}".
      
      Provide a 2-sentence empathetic response that:
      1. Validates a specific emotion or detail mentioned.
      2. Offers a grounding perspective that moves them from "execution mode" to "peace mode."
      
      Tone: Warm, poetic, and concise. No hashtags or corporate speak.`,
      config: {
        temperature: 0.7,
        topP: 0.8,
      },
    }));
    
    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    return { success: true, message: text };
  } catch (error: any) {
    console.error("Gratitude analysis failed:", error);
    return { 
      success: false, 
      message: "Your reflection is saved. Even when the AI is quiet, your gratitude remains a powerful light." 
    };
  }
};

/**
 * Analyzes health data and provides a holistic wellness report.
 */
export const analyzeSleepAndHealth = async (sleepHistory: SleepData[], journalHistory: string[], user: UserProfile | null) => {
  const ai = getAI();
  const sleepContext = JSON.stringify(sleepHistory.slice(-7)); 
  const journalContext = journalHistory.slice(0, 5).join(" | ");
  const userContext = user ? `User Profile: Stress Level ${user.stressLevel}/10, Goals: ${user.goals?.join(', ')}` : "User Profile: Not available";

  try {
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a holistic wellness consultant for corporate tech professionals. 
      Analyze the following data:
      ${userContext}
      Sleep History: ${sleepContext}
      Recent Reflections: ${journalContext}
      
      Provide:
      1. A wellness score (0-100).
      2. A label (Optimal, Restorative, Fair, Fatigued).
      3. 3 pattern predictions.
      4. 1 actionable advice.
      5. A brief 8-10 word mantra.
      
      Return JSON only.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            label: { type: Type.STRING },
            predictions: { type: Type.ARRAY, items: { type: Type.STRING } },
            advice: { type: Type.STRING },
            affirmation: { type: Type.STRING }
          },
          required: ["score", "label", "predictions", "advice", "affirmation"]
        }
      }
    }));

    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    console.error("Health Analysis failed:", error);
    return {
      score: 75,
      label: "Balanced",
      predictions: ["Stability detected", "Focusing on rhythm", "Insights loading"],
      advice: "Take a deep breath. Your data is being processed.",
      affirmation: "I am the calm within the stream."
    };
  }
};
