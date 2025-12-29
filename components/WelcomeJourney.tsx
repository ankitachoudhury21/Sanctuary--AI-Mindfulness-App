import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ArrowRight, Sparkles, Moon, Wind, Target, Heart, Plus } from 'lucide-react';

interface Props {
  onComplete: (profile: UserProfile) => void;
}

const GOAL_OPTIONS = [
  { id: 'sleep', label: 'Improve sleep quality', icon: Moon, gradient: 'from-[#a7f3d0] to-[#bae6fd]' },
  { id: 'stress', label: 'Reduce stress or anxiety', icon: Wind, gradient: 'from-[#bae6fd] to-[#bfdbfe]' },
  { id: 'focus', label: 'Improve focus', icon: Target, gradient: 'from-[#bfdbfe] to-[#ddd6fe]' },
  { id: 'self', label: 'Self-improvement', icon: Heart, gradient: 'from-[#ddd6fe] to-[#fbcfe8]' },
  { id: 'other', label: 'Something else', icon: Plus, gradient: 'from-[#fbcfe8] to-[#fecaca]' },
];

const QUESTIONNAIRE = [
  {
    question: "How often do you feel stressed?",
    tip: "No pressure, there's no wrong answer 😊",
    options: ["Occasionally", "Frequently", "Every Day", "Never"]
  },
  {
    question: "How do you manage your stress now?",
    tip: "You've come to the right place for help!",
    options: ["I don't know how to", "Mindfulness techniques", "I distract myself", "None of the above"]
  },
  {
    question: "How would you like to feel every day?",
    tip: "Tip: Imagine if you didn't feel anxious.",
    options: ["Calm and happy", "In control of my life", "More present", "All of the above"]
  }
];

const WelcomeJourney: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [qIndex, setQIndex] = useState(0); 
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    stressLevel: 5,
    waterGoal: 2,
    stepGoal: 8000,
    goals: []
  });

  const next = () => {
    if (step === 3 && qIndex < QUESTIONNAIRE.length - 1) {
      setQIndex(qIndex + 1);
      setSelectedOption(null);
    } else {
      setStep(step + 1);
      setSelectedOption(null); // Clear selection for new step
    }
  };

  const back = () => {
    if (step === 3 && qIndex > 0) {
      setQIndex(qIndex - 1);
      setSelectedOption(null);
    } else {
      setStep(step - 1);
      setSelectedOption(null); // Clear selection for new step
    }
  };

  const toggleGoal = (goalId: string) => {
    setProfile(prev => {
      const currentGoals = prev.goals || [];
      const newGoals = currentGoals.includes(goalId)
        ? currentGoals.filter(g => g !== goalId)
        : [...currentGoals, goalId];
      return { ...prev, goals: newGoals };
    });
  };

  const progressPercent = step === 1 ? 20 : step === 2 ? 40 : step === 3 ? (40 + (qIndex + 1) * 15) : step === 4 ? 90 : 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-transparent">
      {step > 1 && (
        <div className="fixed top-0 left-0 right-0 h-1.5 md:h-2 bg-white/20 z-50 dark:bg-slate-700/30">
          <div 
            className="h-full bg-teal-500 transition-all duration-700 ease-out shadow-[0_0_15px_rgba(45,212,191,0.5)]"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      )}

      {/* Responsive Logo */}
      <div className="fixed top-8 left-6 md:top-12 md:left-12 z-50 flex items-center gap-3">
         <div className="w-10 h-10 md:w-14 md:h-14 relative flex-shrink-0">
            <div className="absolute inset-0 bg-teal-500 rounded-xl md:rounded-2xl opacity-10 rotate-12"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="md:w-8 md:h-8">
                <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" opacity="0.3"/>
                <circle cx="12" cy="12" r="4" fill="#0d9488" />
              </svg>
            </div>
         </div>
         <span className="text-2xl md:text-5xl font-black text-slate-900 dark:text-white font-display tracking-tight transition-colors duration-300">Sanctuary</span>
      </div>
      
      <div className="max-w-4xl w-full px-6 py-12 md:py-24 relative z-10 animate-in fade-in zoom-in-95 duration-700 overflow-y-auto">
        
        {step === 1 && (
          <div className="space-y-10 md:space-y-16 text-center animate-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4 md:space-y-6">
              <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-8xl font-black text-slate-900 dark:text-white drop-shadow-[0_4px_4px_rgba(255,255,255,0.8)] dark:drop-shadow-none tracking-tight leading-[1.1] transition-colors duration-300">Your quiet space.</h1>
              <p className="text-lg sm:text-2xl md:text-3xl text-slate-800 dark:text-slate-300 font-bold leading-relaxed drop-shadow-sm max-w-2xl mx-auto px-2 transition-colors duration-300">
                Take a deep breath. Sanctuary is your forest for clarity and rest.
              </p>
            </div>

            <div className="max-w-xl mx-auto space-y-6 md:space-y-8">
              <input 
                type="text" 
                className="w-full bg-white/95 dark:bg-slate-800 backdrop-blur-md border-2 border-slate-200 dark:border-slate-700 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] text-xl md:text-3xl font-black outline-none focus:ring-4 focus:ring-teal-500/10 transition-all text-center placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-xl dark:text-white"
                placeholder="What is your name?"
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                aria-label="Your name"
              />
              
              <button 
                onClick={next}
                disabled={!profile.name}
                className="w-full calm-btn-primary py-6 md:py-8 rounded-[1.5rem] md:rounded-[2.5rem] text-xl md:text-3xl font-black flex items-center justify-center gap-3 md:gap-4 disabled:opacity-50 shadow-xl hover:scale-[1.02] transition-all"
                aria-label="Continue to next step"
              >
                Let's Begin <ArrowRight size={24} className="md:w-9 md:h-9" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 md:space-y-12 text-center animate-in slide-in-from-right-4 duration-500">
            <div className="space-y-2 md:space-y-4">
              <h2 className="text-3xl md:text-6xl font-black text-slate-900 dark:text-white drop-shadow-sm transition-colors duration-300">What brings you here?</h2>
              <p className="text-base md:text-2xl text-slate-800 dark:text-slate-300 font-bold transition-colors duration-300">Select your intentions today.</p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:gap-4 max-w-3xl mx-auto">
              {GOAL_OPTIONS.map((goal) => {
                const isSelected = profile.goals?.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`
                      relative w-full p-[1.5px] rounded-[1.25rem] md:rounded-[2.5rem] transition-all duration-300
                      bg-gradient-to-r ${goal.gradient}
                      group active:scale-[0.98] shadow-md
                    `}
                    aria-pressed={isSelected}
                    aria-label={`Select goal: ${goal.label}`}
                  >
                    <div className={`
                      flex items-center gap-4 md:gap-6 px-6 md:px-10 py-4 md:py-6 rounded-[1.25rem] md:rounded-[2.5rem] w-full transition-all
                      ${isSelected ? 'bg-transparent text-[#1e293b] dark:text-white' : 'bg-white/95 dark:bg-slate-800 backdrop-blur-sm text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700'}
                    `}>
                      <goal.icon size={20} className={`md:w-8 md:h-8 ${isSelected ? 'text-[#1e293b] dark:text-white' : 'text-slate-500'}`} />
                      <span className="text-lg md:text-2xl font-black truncate">{goal.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-6 md:pt-10 space-y-3 md:space-y-4 max-w-md mx-auto">
              <button 
                onClick={next}
                className="w-full calm-btn-primary py-5 md:py-6 rounded-2xl md:rounded-[2.5rem] text-lg md:text-2xl font-black shadow-xl"
                aria-label="Continue to next step"
              >
                Continue
              </button>
              <button 
                onClick={next}
                className="w-full py-2 text-slate-600 dark:text-slate-400 font-black hover:text-slate-950 dark:hover:text-white text-base md:text-xl transition-colors duration-300"
                aria-label="Skip goal selection for now"
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-10 md:space-y-16 text-center animate-in slide-in-from-right-4 duration-500 max-w-3xl mx-auto">
            <div className="space-y-4 md:space-y-6">
              <p className="text-[10px] md:text-base font-black text-teal-700 tracking-[0.2em] md:tracking-[0.3em] uppercase">Step {qIndex + 1} of 3</p>
              <h2 className="text-2xl xs:text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight text-balance transition-colors duration-300">
                {QUESTIONNAIRE[qIndex].question}
              </h2>
              <p className="text-base md:text-2xl text-slate-800 dark:text-slate-300 font-bold italic px-2 transition-colors duration-300">{QUESTIONNAIRE[qIndex].tip}</p>
            </div>

            <div className="space-y-3 md:space-y-5">
              {QUESTIONNAIRE[qIndex].options.map((option) => (
                <button
                  key={option}
                  onClick={() => setSelectedOption(option)}
                  className={`
                    w-full py-4 px-6 md:py-7 md:px-12 rounded-2xl md:rounded-[2.5rem] text-lg md:text-2xl font-black border-2 md:border-4 transition-all text-left shadow-lg
                    ${selectedOption === option 
                      ? 'border-teal-600 bg-teal-50/95 dark:bg-teal-900/50 text-teal-950 dark:text-teal-50 ring-4 md:ring-8 ring-teal-500/10' 
                      : 'border-white/60 dark:border-slate-700 bg-white/90 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-teal-300 dark:hover:border-teal-600'}
                  `}
                  aria-pressed={selectedOption === option}
                  aria-label={`Select option: ${option}`}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="pt-8 md:pt-12 flex flex-col gap-4 md:gap-6">
              <button 
                onClick={next}
                disabled={!selectedOption}
                className={`
                  w-full py-5 md:py-7 rounded-2xl md:rounded-[2.5rem] text-xl md:text-3xl font-black transition-all shadow-xl
                  ${selectedOption ? 'calm-btn-primary' : 'bg-white/50 dark:bg-slate-700 text-slate-400 cursor-not-allowed border border-white/20 dark:border-slate-600'}
                `}
                aria-label="Continue to next step"
              >
                Continue
              </button>
              <button 
                onClick={back}
                className="text-slate-600 dark:text-slate-400 font-black hover:text-slate-950 dark:hover:text-white text-base md:text-xl transition-colors duration-300"
                aria-label="Go back to previous question"
              >
                Go back
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 md:space-y-12 animate-in slide-in-from-right-4 duration-500 max-w-2xl mx-auto">
            <div className="text-center space-y-2 md:space-y-4">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white transition-colors duration-300">Personalize Experience</h2>
              <p className="text-base md:text-2xl text-slate-800 dark:text-slate-300 font-bold transition-colors duration-300">Tailoring Sanctuary to you.</p>
            </div>

            <div className="space-y-8 md:space-y-12 glass-card p-6 md:p-12 rounded-[2rem] md:rounded-[4rem] shadow-xl border-2 border-teal-200/30 dark:border-teal-700/30">
              <div className="space-y-4 md:space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] md:text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Stress Level</span>
                  <span className="text-3xl md:text-5xl font-black text-teal-700 dark:text-teal-400">{profile.stressLevel}/10</span>
                </div>
                <input 
                  type="range" 
                  min="1" max="10" 
                  className="w-full h-3 md:h-4 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-teal-600 custom-range-slider"
                  value={profile.stressLevel}
                  onChange={(e) => setProfile({...profile, stressLevel: parseInt(e.target.value)})}
                  aria-label={`Set stress level to ${profile.stressLevel} out of 10`}
                />
                <style jsx>{`
                  .custom-range-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: var(--sanctuary-teal);
                    cursor: grab;
                    box-shadow: 0 0 0 4px rgba(45, 212, 191, 0.2);
                    transition: background 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
                  }
                  .custom-range-slider::-moz-range-thumb {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: var(--sanctuary-teal);
                    cursor: grab;
                    box-shadow: 0 0 0 4px rgba(45, 212, 191, 0.2);
                    transition: background 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
                    border: none; /* Firefox requires removing default border */
                  }
                  .custom-range-slider::-webkit-slider-thumb:hover {
                    background: var(--sanctuary-blue);
                    box-shadow: 0 0 0 6px rgba(45, 212, 191, 0.3);
                  }
                  .custom-range-slider::-moz-range-thumb:hover {
                    background: var(--sanctuary-blue);
                    box-shadow: 0 0 0 6px rgba(45, 212, 191, 0.3);
                  }
                `}</style>
              </div>

              <div className="space-y-4 md:space-y-6">
                <span className="text-[10px] md:text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Hydration Goal</span>
                <div className="grid grid-cols-2 xs:grid-cols-4 gap-3 md:gap-4">
                  {[1.5, 2, 2.5, 3].map(val => (
                    <button 
                      key={val}
                      onClick={() => setProfile({...profile, waterGoal: val})}
                      className={`py-4 md:py-6 rounded-xl md:rounded-3xl font-black text-lg md:text-xl transition-all border-2 md:border-4 ${
                        profile.waterGoal === val 
                          ? 'bg-teal-700 border-teal-700 text-white shadow-lg scale-105 md:scale-110' 
                          : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-300 dark:hover:border-teal-600'
                      }`}
                      aria-pressed={profile.waterGoal === val}
                      aria-label={`Set hydration goal to ${val} liters`}
                    >
                      {val}L
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-4 pt-6 md:pt-10">
                <button 
                  onClick={() => onComplete(profile)}
                  className="w-full calm-btn-primary py-6 md:py-8 rounded-2xl md:rounded-[2.5rem] text-xl md:text-3xl font-black shadow-2xl transition-transform"
                  aria-label="Enter My Sanctuary"
                >
                  Enter My Sanctuary
                </button>
                <button 
                  onClick={back}
                  className="w-full py-2 text-slate-500 dark:text-slate-400 font-black hover:text-slate-800 dark:hover:text-white text-base md:text-lg transition-colors duration-300"
                  aria-label="Go back to previous step"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeJourney;