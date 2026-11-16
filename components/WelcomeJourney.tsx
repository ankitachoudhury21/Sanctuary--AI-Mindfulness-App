import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { ArrowRight, Headphones, Shield, Sparkles, BookHeart, Check } from 'lucide-react';

interface Props {
  onComplete: (profile: UserProfile) => void;
}

const GOAL_OPTIONS = [
  { id: 'focus', label: 'Restore uninterrupted focus', desc: 'Acoustic forest & binaural sessions', icon: Headphones },
  { id: 'stress', label: 'Quiet workday tension', desc: 'Grounding mindfulness & calm breathing', icon: Shield },
  { id: 'gratitude', label: 'Cultivate daily reflection', desc: 'Private voice & text journaling', icon: BookHeart },
  { id: 'cosmos', label: 'Explore spatial soundscapes', desc: 'Ambient planetary audio listening', icon: Sparkles },
];

const QUESTIONNAIRE = [
  {
    question: 'How does your mind feel after a demanding workday?',
    tip: 'Your cognitive baseline helps tailor your daily mantra and meditation recommendations.',
    options: ['Scattered & Overstimulated', 'Mentally Fatigued', 'Calm yet Tense', 'Generally Steady'],
  },
  {
    question: 'Which acoustic environment settles your attention fastest?',
    tip: 'Your preferred sound channel guides the Meditation Studio and Celestial Audio.',
    options: ['Cedar Forest & Rain', 'Binaural & Alpha Frequencies', 'Acoustic Raga & Felt Piano', 'Deep Space Harmonics'],
  },
  {
    question: 'What intention matters most right now?',
    tip: 'Daily guidance and reflection prompts adapt to this priority.',
    options: ['Sustained Deep Focus', 'Lower Daily Stress Load', 'Consistent Gratitude Practice', 'Emotional Steadiness'],
  },
];

const WelcomeJourney: React.FC<Props> = React.memo(({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [qIndex, setQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    stressLevel: 5,
    goals: [],
  });

  useEffect(() => {
    setSelectedOption(null);
  }, [qIndex, step]);

  const toggleGoal = (id: string) => {
    setProfile(prev => ({
      ...prev,
      goals: prev.goals?.includes(id)
        ? prev.goals.filter(g => g !== id)
        : [...(prev.goals || []), id],
    }));
  };

  const next = () => {
    if (step === 3 && qIndex < QUESTIONNAIRE.length - 1) {
      setQIndex(qIndex + 1);
      setSelectedOption(null);
    } else {
      setStep(step + 1);
    }
  };

  const back = () => {
    if (step === 3 && qIndex > 0) {
      setQIndex(qIndex - 1);
      setSelectedOption(null);
    } else if (step > 1) {
      setStep(step - 1);
    }
  };

  const totalSteps = 6;
  let currentStepNumber = step;
  if (step === 3) currentStepNumber = 2 + qIndex + 1;
  else if (step === 4) currentStepNumber = 6;
  const progressPercent = Math.min(((currentStepNumber - 1) / (totalSteps - 1)) * 100, 100);

  return (
    <div className="min-h-screen flex flex-col relative overflow-y-auto">
      {step > 1 && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-slate-900/10 dark:bg-white/10 z-50">
          <div
            className="h-full bg-[#0F5E59] dark:bg-teal-400 transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Header */}
      <header className="w-full max-w-5xl mx-auto px-5 sm:px-8 pt-6 pb-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#0F5E59] dark:text-teal-400 flex-shrink-0">
            <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="2.75" fill="currentColor" />
          </svg>
          <span className="font-editorial text-xl sm:text-2xl font-normal text-slate-900 dark:text-white tracking-tight">
            Sanctuary
          </span>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Onboarding · Step {currentStepNumber} of {totalSteps}
        </span>
      </header>

      <div className="flex-1 flex items-center justify-center w-full px-4 sm:px-6 py-8 md:py-12">
        <div className="max-w-2xl w-full relative z-10 animate-in fade-in duration-500">

          {step === 1 && (
            <div className="glass-card p-6 sm:p-10 md:p-12 rounded-2xl space-y-8">
              <div className="space-y-3">
                <p className="text-xs font-medium text-[#0F5E59] dark:text-teal-400">Personal Calibration</p>
                <h1 className="font-editorial text-3xl sm:text-5xl font-normal text-slate-900 dark:text-white tracking-tight leading-[1.12] text-balance">
                  Begin with your name.
                </h1>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
                  Sanctuary shapes guided soundscapes, mindfulness guidance, and evening gratitude around your focus.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="onboarding-name" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                    Preferred Name
                  </label>
                  <input
                    id="onboarding-name"
                    type="text"
                    className="w-full bg-[#F5F4EF] dark:bg-slate-900/70 border border-slate-900/15 dark:border-white/15 px-4 py-3.5 rounded-xl text-base sm:text-lg font-medium outline-none focus:border-[#0F5E59] dark:focus:border-teal-400 text-slate-900 dark:text-white placeholder:text-slate-400 transition-colors"
                    placeholder="Enter your first name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter' && profile.name.trim()) next(); }}
                    aria-label="Your name"
                  />
                </div>

                <button
                  onClick={next}
                  disabled={!profile.name.trim()}
                  className="w-full calm-btn-primary py-3.5 px-6 rounded-xl text-sm sm:text-base font-semibold flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Continue to next step"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="glass-card p-6 sm:p-10 rounded-2xl space-y-7 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <p className="text-xs font-medium text-[#0F5E59] dark:text-teal-400">Intentions</p>
                <h2 className="font-editorial text-2xl sm:text-4xl font-normal text-slate-900 dark:text-white tracking-tight text-balance">
                  What brings you here today?
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Select one or more focus areas for your mindfulness practice.
                </p>
              </div>

              <div className="space-y-2.5">
                {GOAL_OPTIONS.map((goal) => {
                  const isSelected = profile.goals?.includes(goal.id);
                  return (
                    <button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className={`
                        w-full flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl border text-left transition-all min-h-[56px]
                        ${isSelected
                          ? 'bg-[#0F5E59]/8 dark:bg-teal-400/10 border-[#0F5E59] dark:border-teal-400 text-slate-900 dark:text-white'
                          : 'bg-white/60 dark:bg-white/[0.03] border-slate-900/10 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-slate-900/25 dark:hover:border-white/25'}
                      `}
                      aria-pressed={isSelected}
                      aria-label={`Select goal: ${goal.label}`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <goal.icon size={18} className={isSelected ? 'text-[#0F5E59] dark:text-teal-400 flex-shrink-0' : 'text-slate-400 flex-shrink-0'} />
                        <div className="min-w-0">
                          <p className="text-sm sm:text-base font-semibold truncate">{goal.label}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{goal.desc}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-[#0F5E59] dark:bg-teal-400 border-transparent text-white dark:text-slate-950' : 'border-slate-300 dark:border-slate-600'}`}>
                        {isSelected && <Check size={13} strokeWidth={2.5} />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-900/10 dark:border-white/10">
                <button
                  onClick={next}
                  className="py-2.5 px-4 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  aria-label="Skip goal selection for now"
                >
                  Skip for now
                </button>
                <button
                  onClick={next}
                  className="calm-btn-primary py-3 px-7 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2"
                  aria-label="Continue to next step"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="glass-card p-6 sm:p-10 rounded-2xl space-y-7 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <p className="text-xs font-medium text-[#0F5E59] dark:text-teal-400">
                  Baseline Question {qIndex + 1} of {QUESTIONNAIRE.length}
                </p>
                <h2 className="font-editorial text-2xl sm:text-3xl font-normal text-slate-900 dark:text-white leading-snug text-balance">
                  {QUESTIONNAIRE[qIndex].question}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {QUESTIONNAIRE[qIndex].tip}
                </p>
              </div>

              <div className="space-y-2.5">
                {QUESTIONNAIRE[qIndex].options.map((option) => {
                  const isSelected = selectedOption === option;
                  return (
                    <button
                      key={option}
                      onClick={() => setSelectedOption(option)}
                      className={`
                        w-full py-3.5 px-4 sm:px-5 rounded-xl text-sm sm:text-base font-medium border transition-all text-left flex items-center justify-between gap-3 min-h-[50px]
                        ${isSelected
                          ? 'border-[#0F5E59] dark:border-teal-400 bg-[#0F5E59]/8 dark:bg-teal-400/10 text-slate-900 dark:text-white'
                          : 'border-slate-900/10 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 hover:border-slate-900/25 dark:hover:border-white/25'}
                      `}
                      aria-pressed={isSelected}
                      aria-label={`Select option: ${option}`}
                    >
                      <span>{option}</span>
                      {isSelected && <Check size={16} className="text-[#0F5E59] dark:text-teal-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-900/10 dark:border-white/10 flex items-center justify-between gap-4">
                <button
                  onClick={back}
                  className="py-2.5 px-4 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  aria-label="Go back to previous question"
                >
                  Back
                </button>
                <button
                  onClick={next}
                  disabled={!selectedOption}
                  className="calm-btn-primary py-3 px-7 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  aria-label="Continue to next step"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="glass-card p-6 sm:p-10 rounded-2xl space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <p className="text-xs font-medium text-[#0F5E59] dark:text-teal-400">Stress Calibration</p>
                <h2 className="font-editorial text-2xl sm:text-4xl font-normal text-slate-900 dark:text-white tracking-tight">
                  Set your starting baseline
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Adjust how much tension you are carrying today so Sanctuary can calibrate your mindfulness score and guidance.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Stress Load</span>
                  <span className="display-number text-2xl font-semibold text-[#0F5E59] dark:text-teal-400">
                    {profile.stressLevel} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1" max="10"
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-[#0F5E59] dark:accent-teal-400"
                  value={profile.stressLevel}
                  onChange={(e) => setProfile({ ...profile, stressLevel: parseInt(e.target.value) })}
                  aria-label={`Set stress level to ${profile.stressLevel} out of 10`}
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Calm</span>
                  <span>Moderate</span>
                  <span>Elevated</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-900/10 dark:border-white/10">
                <button
                  onClick={back}
                  className="py-2.5 px-4 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  aria-label="Go back to previous step"
                >
                  Back
                </button>
                <button
                  onClick={() => onComplete(profile)}
                  className="calm-btn-primary py-3 px-7 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
                  aria-label="Enter My Sanctuary"
                >
                  <span>Complete Setup</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default WelcomeJourney;
