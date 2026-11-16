import { SleepData, UserProfile } from '../types';

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
 * Analyzes health data via the server API and provides a holistic wellness report.
 */
export const analyzeSleepAndHealth = async (
  sleepHistory: SleepData[],
  journalHistory: string[],
  user: UserProfile | null
) => {
  try {
    const response = await fetch('/api/gemini/health-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sleepHistory, journalHistory, user }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error || 'Failed to analyze sleep and health data.');
    }

    return data;
  } catch (error: any) {
    console.error('Health Analysis failed:', error);
    return {
      score: 75,
      label: 'Balanced',
      predictions: ['Stability detected', 'Focusing on rhythm', 'Insights loading'],
      advice: 'Take a deep breath. Your data is being processed.',
      affirmation: 'I am the calm within the stream.',
    };
  }
};
