
import React, { useState, useEffect } from 'react';
import { AppView, TutorialStep } from '../types';
import { Sparkles, Home, BookHeart, Moon, Music, Compass, ArrowRight, X } from 'lucide-react';

interface Props {
  userName: string;
  onComplete: () => void;
  onViewChange: (view: AppView) => void;
}

const STEPS: TutorialStep[] = [
  {
    title: "Welcome to your Home",
    description: "This is your personal sanctuary. Track your sleep score, hydration, and steps at a glance. Our AI companion will also leave you daily mindful notes here.",
    targetView: AppView.DASHBOARD,
    highlightIcon: Home
  },
  {
    title: "The Gratitude Journal",
    description: "Speak or type what you're thankful for. Our empathetic AI companion listens like a friend, offering warmth and support for your corporate journey.",
    targetView: AppView.JOURNAL,
    highlightIcon: BookHeart
  },
  {
    title: "Deep Sleep Insights",
    description: "Understand your rest. We analyze your patterns to predict health trends and provide clinical-grade insights into your recovery.",
    targetView: AppView.SLEEP,
    highlightIcon: Moon
  },
  {
    title: "Nature's Sanctuary",
    description: "Immerse yourself in nature. From forest mornings to ocean tides, use these tracks for quick desk meditations or to focus under stress.",
    targetView: AppView.MUSIC,
    highlightIcon: Music
  },
  {
    title: "Your Mindful Flow",
    description: "View your entire daily rhythm. We remind you to drink water, stretch, and wind down based on your unique corporate schedule.",
    targetView: AppView.ACTIVITY,
    highlightIcon: Compass
  }
];

const OnboardingTutorial: React.FC<Props> = ({ userName, onComplete, onViewChange }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    onViewChange(STEPS[0].targetView);
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onViewChange(STEPS[nextStep].targetView);
    } else {
      // Ensure we go back to Home after finishing the tour
      onViewChange(AppView.DASHBOARD);
      onComplete();
    }
  };

  const handleSkip = () => {
    onViewChange(AppView.DASHBOARD);
    onComplete();
  };

  const step = STEPS[currentStep];
  const Icon = step.highlightIcon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-500" />
      
      <div className="relative w-full max-w-md glass-card p-8 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 border-2 border-blue-500/30">
        <button 
          onClick={handleSkip}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mb-6 rotate-3 shadow-xl shadow-blue-500/20">
            {Icon && <Icon size={40} />}
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-4">
            <Sparkles size={12} /> Step {currentStep + 1} of {STEPS.length}
          </div>

          <h2 className="text-2xl font-bold text-blue-700 mb-4">
            {step.title}
          </h2>
          
          <p className="text-slate-600 leading-relaxed mb-8">
            {currentStep === 0 ? `Hi ${userName}, let's explore Sanctuary. ` : ''}
            {step.description}
          </p>

          <div className="flex items-center justify-between w-full mt-4">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-blue-600' : 'w-1.5 bg-blue-200'}`} 
                />
              ))}
            </div>

            <button 
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              {currentStep === STEPS.length - 1 ? 'Finish Tour' : 'Next'} <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTutorial;

