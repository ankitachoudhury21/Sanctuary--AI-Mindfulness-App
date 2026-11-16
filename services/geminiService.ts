import { DailyMantraItem, LiveTranscriptTurn, MindfulnessInsights, UserProfile } from '../types';

const FALLBACK_DAILY_MANTRAS: DailyMantraItem[] = [
  {
    id: 'fallback-1',
    affirmation: 'I am the calm center in the stream of daily work.',
    theme: 'Quiet Clarity',
    breathCue: 'Take three slow breaths before opening your next task.',
  },
  {
    id: 'fallback-2',
    affirmation: 'I release the urgency to solve everything in this hour.',
    theme: 'Unhurried Pace',
    breathCue: 'Drop your shoulders away from your ears as you exhale.',
  },
  {
    id: 'fallback-3',
    affirmation: 'My attention belongs to the quiet clarity of this moment.',
    theme: 'Steady Focus',
    breathCue: 'Inhale gently for four counts and rest on a single priority.',
  },
  {
    id: 'fallback-4',
    affirmation: 'Even brief stillness restores clarity to a crowded mind.',
    theme: 'Present Ease',
    breathCue: 'Unclench your jaw and let your gaze soften for ten seconds.',
  },
  {
    id: 'fallback-5',
    affirmation: 'I meet today with steady breath and unforced patience.',
    theme: 'Grounded Rhythm',
    breathCue: 'Feel both feet settle into the floor on your next exhale.',
  },
];

/**
 * Analyzes a gratitude reflection via the server API and provides an empathetic insight.
 */
export const analyzeGratitudeJournal = async (
  transcript: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch('/api/gemini/gratitude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript }),
    });

    const data = await response.json();
    if (!response.ok || !data?.message) {
      throw new Error(data?.error || 'Failed to analyze gratitude reflection.');
    }

    return { success: true, message: data.message };
  } catch (error: any) {
    console.error('Gratitude analysis failed:', error);
    return {
      success: false,
      message: 'Your reflection is saved. Even when the AI is quiet, your gratitude remains a powerful light.',
    };
  }
};

/**
 * Generates general mindfulness score, mantra, and guidance without sleep metrics.
 */
export const analyzeMindfulnessInsights = async (
  journalHistory: string[],
  user: UserProfile | null
): Promise<MindfulnessInsights> => {
  try {
    const response = await fetch('/api/gemini/mindfulness', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ journalHistory, user }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || 'Failed to generate mindfulness insights.');
    }

    return data;
  } catch (error: any) {
    console.error('Mindfulness analysis failed:', error);
    return {
      score: 78,
      label: 'Balanced',
      predictions: ['Steady reflective cadence', 'Acoustic focus active', 'Calm breathing rhythm'],
      advice: 'Take three slow breaths before transitioning into your next focus block.',
      affirmation: 'I am the calm center in the stream of daily work.',
    };
  }
};

/**
 * Generates a rotating set of AI mindfulness affirmations for the user's login session.
 */
export const generateDailyMantras = async (
  journalHistory: string[],
  user: UserProfile | null
): Promise<{ mantras: DailyMantraItem[]; isFallback: boolean; error?: string }> => {
  try {
    const dateLabel = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    const response = await fetch('/api/gemini/mantras', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ journalHistory, user, dateLabel }),
    });

    const data = await response.json();
    if (!response.ok || !Array.isArray(data?.mantras) || data.mantras.length === 0) {
      throw new Error(data?.error || 'Unable to generate daily affirmations.');
    }

    return { mantras: data.mantras, isFallback: false };
  } catch (error: any) {
    console.error('Daily mantra generation failed:', error);
    return {
      mantras: FALLBACK_DAILY_MANTRAS,
      isFallback: true,
      error: error?.message || 'Unable to reach AI affirmation service.',
    };
  }
};

/**
 * Distills a spoken two-way Gratitude Journal conversation into a concise archive summary.
 */
export const summarizeLiveJournal = async (
  turns: LiveTranscriptTurn[],
  user: UserProfile | null
): Promise<{ success: boolean; summary: string; mentorReflection: string }> => {
  const userUtterances = turns
    .filter((t) => t.speaker === 'user' && t.text.trim())
    .map((t) => t.text.trim());
  const mentorUtterances = turns
    .filter((t) => t.speaker === 'mentor' && t.text.trim())
    .map((t) => t.text.trim());

  const fallbackSummary =
    userUtterances.length > 0
      ? userUtterances.join(' ')
      : turns.map((t) => t.text.trim()).filter(Boolean).join(' ');
  const fallbackReflection =
    mentorUtterances[mentorUtterances.length - 1] ||
    'Your spoken reflection is archived. Taking time to voice what matters brings quiet clarity.';

  try {
    const response = await fetch('/api/gemini/journal-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        turns: turns.map((t) => ({ speaker: t.speaker, text: t.text })),
        user,
      }),
    });

    const data = await response.json();
    if (!response.ok || !data?.summary || !data?.mentorReflection) {
      throw new Error(data?.error || 'Failed to summarize conversation.');
    }

    return {
      success: true,
      summary: data.summary,
      mentorReflection: data.mentorReflection,
    };
  } catch (error) {
    console.error('Live journal summarization failed:', error);
    return {
      success: false,
      summary: fallbackSummary,
      mentorReflection: fallbackReflection,
    };
  }
};


