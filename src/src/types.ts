export enum AppView {
  WELCOME = 'WELCOME',
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  JOURNAL = 'JOURNAL',
  SLEEP = 'SLEEP',
  MUSIC = 'MUSIC',
  ACTIVITY = 'ACTIVITY',
  PLANETARY = 'PLANETARY'
}

export interface UserProfile {
  name: string;
  stressLevel: number; // 1-10
  waterGoal: number; // liters
  stepGoal: number;
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

export interface SleepData {
  date: string;
  hours: number;
  quality: number; // 1-10
  score?: number;
  label?: string;
  insights?: string;
  healthPredictions?: string[];
}

export interface ActivityData {
  steps: number;
  waterIntake: number; // glasses
}

export interface TutorialStep {
  title: string;
  description: string;
  targetView: AppView;
  highlightIcon?: any;
}

export interface TranscriptionMessage {
  role: 'user' | 'model';
  text: string;
}
