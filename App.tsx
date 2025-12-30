
import React, { useState, useEffect, useRef } from 'react';
import { AppView, UserProfile, SleepData, ActivityData, JournalEntry } from './types';
import WelcomeJourney from './components/WelcomeJourney';
// FIX: Changed AuthFlow from default import to named import
import { AuthFlow } from './components/AuthFlow';
import Dashboard from './components/Dashboard';
import Navigation from './components/Navigation';
// Removed: import OnboardingTutorial from './components/OnboardingTutorial'; 
// Removed: import BackgroundAmbience from './components/BackgroundAmbience';
import { analyzeSleepAndHealth } from './services/geminiService';
import { Sparkles, Play } from 'lucide-react';

const STORAGE_KEYS = {
  USER: 'sanctuary_user_profile',
  JOURNAL: 'sanctuary_journal_entries',
  SLEEP: 'sanctuary_sleep_data',
  ACTIVITY: 'sanctuary_activity_data',
  DRAFT: 'sanctuary_journal_draft',
  // Removed: AMBIENT_MUTED: 'sanctuary_ambient_muted',
  DARK_MODE: 'sanctuary_dark_mode'
};

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [view, setView] = useState<AppView>(AppView.WELCOME);
  // Removed: const [isAmbientMuted, setIsAmbientMuted] = useState(() => {
  // Removed:   const saved = localStorage.getItem(STORAGE_KEYS.AMBIENT_MUTED);
  // Removed:   return saved === 'true';
  // Removed: });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    return saved === 'true';
  });
  const [isAnyTrackPlaying, setIsAnyTrackPlaying] = useState(false);

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  // Removed: const [showTutorial, setShowTutorial] = useState(false);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.JOURNAL);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [sleepData, setSleepData] = useState<SleepData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SLEEP);
      return saved ? JSON.parse(saved) : [
        { date: 'Mon', hours: 6.5, quality: 6, score: 65, label: 'Fair' },
        { date: 'Tue', hours: 7.2, quality: 8, score: 82, label: 'Good' },
        { date: 'Wed', hours: 5.8, quality: 4, score: 45, label: 'Poor' },
        { date: 'Thu', hours: 8.1, quality: 9, score: 88, label: 'Great' },
        { date: 'Fri', hours: 7.5, quality: 8, score: 79, label: 'Good' },
      ];
    } catch { return []; }
  });
  const [activity, setActivity] = useState<ActivityData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
      return saved ? JSON.parse(saved) : { steps: 4200, waterIntake: 5 };
    } catch { return { steps: 0, waterIntake: 0 }; }
  });
  const [aiInsights, setAiInsights] = useState<any>(null);
  const refreshTimerRef = useRef<number | null>(null);
  const lastAnalyzedJournalCount = useRef<number>(0);

  // Removed: useEffect(() => {
  // Removed:   localStorage.setItem(STORAGE_KEYS.AMBIENT_MUTED, isAmbientMuted.toString());
  // Removed: }, [isAmbientMuted]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, isDarkMode.toString());
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(journalEntries));
    
    if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
    
    if (journalEntries.length !== lastAnalyzedJournalCount.current) {
      refreshTimerRef.current = window.setTimeout(() => {
        if (journalEntries.length > 0 || user) refreshAIInsights();
      }, 15000); 
    }
  }, [journalEntries, user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SLEEP, JSON.stringify(sleepData));
  }, [sleepData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(activity));
  }, [activity]);

  useEffect(() => {
    if (hasStarted && user && view === AppView.WELCOME) {
      setView(AppView.DASHBOARD);
    }
  }, [hasStarted, user]);

  const handleStartExperience = () => {
    setHasStarted(true);
    if (user && view === AppView.WELCOME) {
      setView(AppView.DASHBOARD);
    }
  };

  const handleStart = (profile: UserProfile) => {
    setUser(profile);
    setView(AppView.LOGIN);
  };

  const handleAuthComplete = () => {
    setView(AppView.DASHBOARD);
    // Removed: setShowTutorial(true);
    refreshAIInsights();
  };

  // Removed: const handleTutorialComplete = () => {
  // Removed:   setShowTutorial(false);
  // Removed: };

  const refreshAIInsights = async () => {
    try {
      lastAnalyzedJournalCount.current = journalEntries.length;
      const snippets = journalEntries.slice(0, 5).map(e => e.transcript || "");
      const result = await analyzeSleepAndHealth(sleepData, snippets, user);
      setAiInsights(result);
    } catch (e) {
      console.error("AI Insights sync failed", e);
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.DRAFT);
    
    setUser(null);
    setView(AppView.WELCOME);
    // Removed: setShowTutorial(false);
    setHasStarted(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return (
    <div className="min-h-screen transition-all duration-1000 relative overflow-x-hidden">
      {/* Removed: <BackgroundAmbience hasStarted={hasStarted} isActive={!isAmbientMuted && !isAnyTrackPlaying} /> */}
      
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1490522046460-e4d658c407c0?auto=format&fit=crop&q=80&w=2560" 
          alt="Zen landscape" 
          className="w-full h-full object-cover opacity-80 transition-opacity duration-1000"
        />
        {/* Changed dark mode overlay to a darker slate for better background blending */}
        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/60 backdrop-blur-md transition-colors duration-1000"></div>
        {/* Changed dark mode gradient to a darker slate for better background blending */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/80 dark:to-slate-950/90 transition-colors duration-1000"></div>
      </div>

      {!hasStarted && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-1000">
          <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-md dark:bg-white/50 transition-colors duration-1000"></div>
          <div className="relative z-10 glass-card p-10 md:p-24 rounded-[3rem] md:rounded-[5rem] shadow-2xl border-white/60 dark:border-teal-500/10 max-w-2xl w-full space-y-12 transition-all duration-1000">
             <div className="space-y-6">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-teal-600/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                   <div className="absolute inset-0 border-2 border-teal-600/30 rounded-full animate-ping opacity-20"></div>
                   <Sparkles size={48} className="text-teal-700 md:w-16 md:h-16" />
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-slate-900 tracking-tighter font-display leading-tight transition-colors duration-1000">Welcome to <br/>Sanctuary</h1>
                <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-700 font-medium italic transition-colors duration-1000">Your mindful space is ready.</p>
             </div>
             <button 
                onClick={handleStartExperience}
                className="w-full calm-btn-primary py-6 md:py-8 rounded-[1.5rem] md:rounded-[2.5rem] text-2xl md:text-3xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group hover:shadow-teal-500/40"
                aria-label="Enter Sanctuary"
              >
                <Play size={28} className="md:w-9 md:h-9 group-hover:fill-current" fill="none" /> 
                Enter Sanctuary
             </button>
          </div>
        </div>
      )}

      <div className={`relative z-10 min-h-screen flex flex-col transition-all duration-1000 ${hasStarted ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-xl scale-110 pointer-events-none'}`}>
        {view === AppView.WELCOME && <WelcomeJourney onComplete={handleStart} />}
        {view === AppView.LOGIN && user && <AuthFlow onAuthComplete={handleAuthComplete} userName={user.name} />}
        {view !== AppView.WELCOME && view !== AppView.LOGIN && (
          <div className="flex flex-col md:flex-row min-h-screen">
            <Navigation 
              activeView={view} 
              setView={setView} 
              onLogout={logout}
              // Removed: isAmbientMuted={isAmbientMuted}
              // Removed: toggleAmbient={() => setIsAmbientMuted(!isAmbientMuted)}
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
            />
            <main className="flex-1 w-full transition-all duration-500 relative px-4 sm:px-8 pb-32 pt-24 md:pt-16 md:pb-16 md:pl-[260px] max-w-[1600px] mx-auto">
              {/* Changed main content gradient to be more subtle and darker in dark mode */}
              <div className="fixed inset-0 bg-gradient-to-t from-slate-50/90 to-transparent dark:from-slate-900/90 dark:to-transparent pointer-events-none z-0"></div>
              <Dashboard 
                view={view}
                setView={setView}
                user={user} 
                sleepData={sleepData} 
                activity={activity}
                setActivity={setActivity}
                journalEntries={journalEntries}
                setJournalEntries={setJournalEntries}
                aiInsights={aiInsights}
                setSleepData={setSleepData}
                setIsAnyTrackPlaying={setIsAnyTrackPlaying}
              />
            </main>
            {/* Removed: {showTutorial && user && <OnboardingTutorial userName={user.name} onComplete={handleTutorialComplete} onViewChange={setView} />} */}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;