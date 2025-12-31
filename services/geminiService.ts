
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
      console.warn(`Gemini API error (Status: ${error?.status || 'Unknown'}). Retrying in ${delay}ms... (${retries} attempts left)`);
      await wait(delay);
      return withRetry(fn, retries - 1, delay * 2.5);
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
    if (error?.message?.includes("NOT_FOUND")) {
        return { success: false, message: "System Error: The AI service model was not found. Please contact support or try again later." };
    }
    return { success: false, message: "Sanctuary's AI companion is currently unavailable. Your reflection is safe, and I am still listening in spirit." };
  }
};

export const analyzeSleepAndHealth = async (sleepHistory: SleepData[], journalHistory: string[], user: UserProfile | null) => {
  const ai = getAI();
  const sleepContext = JSON.stringify(sleepHistory.slice(-7)); 
  const journalContext = journalHistory.slice(0, 5).join(" | ");
  const userContext = user ? `User Profile: Stress Level ${user.stressLevel}/10, Goals: ${user.goals?.join(', ')}` : "User Profile: Not available";

  try {
    const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-3-pro-preview",
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
        thinkingConfig: { thinkingBudget: 4000 },
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
    
    // Heuristic fallback for offline/quota issues
    const avgSleep = sleepHistory.length > 0 
      ? sleepHistory.reduce((acc, s) => acc + s.hours, 0) / sleepHistory.length 
      : 7;
    const baseScore = Math.min(Math.round((avgSleep / 8) * 100), 95);

    return {
      score: baseScore,
      label: baseScore > 80 ? "Restorative" : baseScore > 60 ? "Balanced" : "Fatigued",
      predictions: ["Establishing baseline patterns", "Data accumulation in progress", "Personalized insights pending"],
      advice: "Focus on maintaining a consistent 15-minute screen-free window before sleep tonight.",
      affirmation: "I am the steady silence beneath the noise of logic."
    };
  }
};
