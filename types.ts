export enum AppView {
  WELCOME = 'WELCOME',
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  JOURNAL = 'JOURNAL',
  MUSIC = 'MUSIC',
  PLANETARY = 'PLANETARY',
}

export interface UserProfile {
  name: string;
  stressLevel: number; // 1-10
  goals?: string[];
}

export interface JournalEntry {
  id: string;
  date: string;
  type: 'text' | 'voice' | 'live';
  audioUrl?: string;
  transcript?: string;
  aiResponse?: string;
}

export interface MindfulnessInsights {
  score: number;
  label: string;
  predictions?: string[];
  advice: string;
  affirmation: string;
}

export interface DailyMantraItem {
  id: string;
  affirmation: string;
  theme: string;
  breathCue: string;
}

export interface LiveTranscriptTurn {
  id: string;
  speaker: 'user' | 'mentor';
  text: string;
  timestamp: string;
}
