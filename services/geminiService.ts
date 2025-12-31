
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
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 3000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = error?.message?.includes("429") || error?.status === 429 || error?.message?.includes("RESOURCE_EXHAUSTED");
    const isServerError = error?.status >= 500;
    
    if ((isRateLimit || isServerError) && retries > 0) {
      console.warn(`Gemini API rate limit or server error. Retrying in ${delay}ms... (${retries} attempts left)`);
      await wait(delay);
      // Exponential backoff with a bit of jitter
      return withRetry(fn, retries - 1, delay * 2 + Math.random() * 1000);
    }
    throw error;
  }
}

// Updated to return an object with success status and message
export const analyzeGratitudeJournal = async (transcript: string): Promise<{ success: boolean, message: string }> => {
  const ai = getAI();
  try {
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an empathetic, wise, and grounded mindfulness companion. 
      My user is a tech professional working in a high-stress corporate environment. 
      They just recorded a gratitude reflection: "${transcript}". 
      
      Respond as a calm mentor would—validating their professional resilience, helping them find peace outside of their "logic-brain", and offering a poetic, grounding closing statement. 
      Avoid corporate jargon. Keep it warm, brief (2-3 sentences), and deeply human.`,
      config: {
        temperature: 0.8,
        topP: 0.95,
      },
    }));
    return { success: true, message: response.text || "I'm glad you shared that with me. It sounds like a meaningful reflection." };
  } catch (error: any) {
    console.error("Gratitude analysis failed permanently:", error);
    return { success: false, message: "Sanctuary's AI companion is currently resting. Your reflection is safely stored." };
  }
};

export const analyzeSleepAndHealth = async (sleepHistory: SleepData[], journalHistory: string[], user: UserProfile | null) => {
  const ai = getAI();
  const sleepContext = JSON.stringify(sleepHistory.slice(-7)); 
  const journalContext = journalHistory.slice(0, 5).join(" | ");
  const userContext = user ? `User Profile: Stress Level ${user.stressLevel}/10, Goals: ${user.goals?.join(', ')}` : "User Profile: Not available";

  try {
    // Switched to gemini-3-flash-preview to avoid 429 quota exhaustion of Pro models
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a holistic wellness consultant for corporate tech professionals. 
      Analyze the following biometric and qualitative data to provide a health insight report.
      
      ${userContext}
      Sleep Data (last 7 days): ${sleepContext}
      Journal Mood Snippets: ${journalContext}
      
      Task: 
      1. Calculate an overall Sleep/Wellness Score (0-100) based on consistency, quality, and duration.
      2. Identify 3 potential health concerns/patterns (e.g., Cognitive Fatigue, Social Burnout, Circadian Misalignment).
      3. Provide 1 piece of high-impact, actionable advice for a high-stress professional.
      4. Generate a brief, powerful mindfulness affirmation (mantra) under 12 words that specifically addresses their current state.
      
      Return ONLY valid JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "A number between 0-100" },
            label: { type: Type.STRING, description: "One word summary: Optimal, Restorative, Fair, or Fatigued" },
            predictions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of 3 specific patterns or health risks detected"
            },
            advice: { type: Type.STRING, description: "One concise sentence of professional advice" },
            affirmation: { type: Type.STRING, description: "A poetic, grounding mantra under 12 words." }
          },
          required: ["score", "label", "predictions", "advice", "affirmation"]
        }
      }
    }));

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Health Analysis failed permanently:", error);
    
    // Heuristic fallback for quota issues
    const avgSleep = sleepHistory.length > 0 
      ? sleepHistory.reduce((acc, s) => acc + s.hours, 0) / sleepHistory.length 
      : 7;
    const baseScore = Math.min(Math.round((avgSleep / 8) * 100), 95);

    return {
      score: baseScore,
      label: baseScore > 80 ? "Restorative" : baseScore > 60 ? "Balanced" : "Fatigued",
      predictions: ["Focusing on consistency", "Pattern analysis in progress", "Personalized insights pending"],
      advice: "Try a 5-minute breathing exercise before your next meeting to lower cortisol.",
      affirmation: "I am the steady silence beneath the noise of logic."
    };
  }
};
