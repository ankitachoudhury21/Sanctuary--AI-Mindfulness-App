import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppView, UserProfile, JournalEntry, MindfulnessInsights, DailyMantraItem } from './types';
import WelcomeJourney from './components/WelcomeJourney';
import { AuthFlow } from './components/AuthFlow';
import Dashboard from './components/Dashboard';
import Navigation from './components/Navigation';
import { analyzeMindfulnessInsights, generateDailyMantras } from './services/geminiService';
import { ArrowRight } from 'lucide-react';
import backdropImg from './src/assets/images/sanctuary_ambient_backdrop_1794849879379.jpg';

const STORAGE_KEYS = {
  USER: 'sanctuary_user_profile',
  JOURNAL: 'sanctuary_journal_entries',
  DRAFT: 'sanctuary_journal_draft',
  DARK_MODE: 'sanctuary_dark_mode',
  MANTRAS: 'sanctuary_daily_mantras',
};

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [view, setView] = useState<AppView>(AppView.WELCOME);
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
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.JOURNAL);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [aiInsights, setAiInsights] = useState<MindfulnessInsights | null>(null);
  const [dailyMantras, setDailyMantras] = useState<DailyMantraItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MANTRAS);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (parsed?.date === getTodayKey() && Array.isArray(parsed?.mantras)) {
        return parsed.mantras;
      }
      return [];
    } catch {
      return [];
    }
  });
  const [isLoadingMantras, setIsLoadingMantras] = useState(false);
  const [mantrasError, setMantrasError] = useState<string | null>(null);
  const refreshTimerRef = useRef<number | null>(null);
  const lastAnalyzedJournalCount = useRef<number>(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, isDarkMode.toString());
    document.documentElement.classList.toggle('dark', isDarkMode);
    document.body.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  }, [user]);

  const loadDailyMantras = useCallback(
    async (profileOverride?: UserProfile | null) => {
      const activeUser = profileOverride !== undefined ? profileOverride : user;
      setIsLoadingMantras(true);
      setMantrasError(null);
      try {
        const snippets = journalEntries.slice(0, 4).map((e) => e.transcript || '');
        const result = await generateDailyMantras(snippets, activeUser);
        setDailyMantras(result.mantras);
        if (result.isFallback) {
          setMantrasError(result.error || 'Unable to reach AI affirmation service.');
        } else {
          localStorage.setItem(
            STORAGE_KEYS.MANTRAS,
            JSON.stringify({
              date: getTodayKey(),
              userName: activeUser?.name || '',
              mantras: result.mantras,
            })
          );
        }
      } catch (e: any) {
        console.error('Daily mantra load failed', e);
        setMantrasError(e?.message || 'Unable to load daily affirmations.');
      } finally {
        setIsLoadingMantras(false);
      }
    },
    [journalEntries, user]
  );

  const refreshAIInsights = useCallback(async () => {
    try {
      lastAnalyzedJournalCount.current = journalEntries.length;
      const snippets = journalEntries.slice(0, 5).map(e => e.transcript || '');
      const result = await analyzeMindfulnessInsights(snippets, user);
      setAiInsights(result);
    } catch (e) {
      console.error('AI Insights sync failed', e);
    }
  }, [journalEntries, user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(journalEntries));

    if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);

    if (journalEntries.length !== lastAnalyzedJournalCount.current) {
      refreshTimerRef.current = window.setTimeout(() => {
        if (journalEntries.length > 0 || user) refreshAIInsights();
      }, 15000);
    }
  }, [journalEntries, user, refreshAIInsights]);

  useEffect(() => {
    if (hasStarted && user && view === AppView.WELCOME) {
      setView(AppView.DASHBOARD);
    }
  }, [hasStarted, user, view]);

  const handleStartExperience = useCallback(() => {
    setHasStarted(true);
    if (user && view === AppView.WELCOME) {
      setView(AppView.DASHBOARD);
      if (dailyMantras.length === 0) {
        loadDailyMantras(user);
      }
      if (!aiInsights) {
        refreshAIInsights();
      }
    }
  }, [user, view, dailyMantras.length, aiInsights, loadDailyMantras, refreshAIInsights]);

  const handleStart = useCallback((profile: UserProfile) => {
    setUser(profile);
    setView(AppView.LOGIN);
  }, []);

  const handleAuthComplete = useCallback(() => {
    setView(AppView.DASHBOARD);
    refreshAIInsights();
    loadDailyMantras(user);
  }, [refreshAIInsights, loadDailyMantras, user]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.DRAFT);
    localStorage.removeItem(STORAGE_KEYS.MANTRAS);

    setUser(null);
    setDailyMantras([]);
    setMantrasError(null);
    setAiInsights(null);
    setView(AppView.WELCOME);
    setHasStarted(false);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prevMode => !prevMode);
  }, []);

  return (
    <div className="min-h-screen transition-colors duration-500 relative overflow-x-hidden bg-[#F5F4EF] dark:bg-[#090D12] text-slate-900 dark:text-slate-100">
      {/* Subtle architectural backdrop */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={backdropImg}
          alt="Minimalist architectural lakeside pavilion in morning mist"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-[0.14] dark:opacity-[0.12] scale-105 transition-opacity duration-700"
          decoding="async"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5F4EF]/85 via-[#F5F4EF]/92 to-[#F5F4EF] dark:from-[#090D12]/80 dark:via-[#090D12]/90 dark:to-[#090D12] transition-colors duration-500"></div>
      </div>

      {/* Editorial Entry Gate */}
      {!hasStarted && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-700">
          <div className="fixed inset-0 bg-[#F5F4EF]/75 dark:bg-[#090D12]/80 backdrop-blur-xl"></div>
          <div className="relative z-10 w-full max-w-xl my-auto rounded-2xl bg-white/95 dark:bg-[#111720]/95 border border-slate-900/10 dark:border-white/10 shadow-2xl overflow-hidden">
            <div className="relative h-44 sm:h-52 w-full overflow-hidden">
              <img
                src={backdropImg}
                alt="Sanctuary architectural pavilion"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="12" r="2.75" fill="currentColor" />
                  </svg>
                  <span className="font-editorial text-lg font-medium tracking-tight">Sanctuary</span>
                </div>
                <span className="text-xs text-white/80 font-medium">Focus · Audio · Reflection</span>
              </div>
            </div>

            <div className="p-6 sm:p-10 space-y-6 text-left">
              <div className="space-y-2.5">
                <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-normal text-slate-900 dark:text-white tracking-tight leading-[1.12] text-balance">
                  A quiet place for focus and clarity.
                </h1>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-md">
                  Guided meditation soundscapes, celestial frequencies, and private gratitude reflection crafted for unhurried calm.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-900/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {user ? `Welcome back, ${user.name}` : 'Personal mindfulness space'}
                </span>
                <button
                  onClick={handleStartExperience}
                  className="calm-btn-primary px-6 py-3.5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2.5 group"
                  aria-label="Enter Sanctuary"
                >
                  <span>{user ? 'Resume Session' : 'Enter Sanctuary'}</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`relative z-10 min-h-screen flex flex-col transition-opacity duration-700 ${hasStarted ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {view === AppView.WELCOME && <WelcomeJourney onComplete={handleStart} />}
        {view === AppView.LOGIN && user && <AuthFlow onAuthComplete={handleAuthComplete} userName={user.name} />}
        {view !== AppView.WELCOME && view !== AppView.LOGIN && (
          <div className="flex flex-col md:flex-row min-h-screen">
            <Navigation
              activeView={view}
              setView={setView}
              onLogout={logout}
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
            />
            <div className="flex-1 w-full min-w-0 md:pl-[232px] lg:pl-[256px] transition-all duration-300">
              <main className="w-full max-w-[1320px] mx-auto relative px-4 sm:px-6 lg:px-10 pt-20 pb-24 md:pt-8 md:pb-14">
                <Dashboard
                  view={view}
                  setView={setView}
                  user={user}
                  journalEntries={journalEntries}
                  setJournalEntries={setJournalEntries}
                  aiInsights={aiInsights}
                  dailyMantras={dailyMantras}
                  isLoadingMantras={isLoadingMantras}
                  mantrasError={mantrasError}
                  onRefreshMantras={() => loadDailyMantras(user)}
                  setIsAnyTrackPlaying={setIsAnyTrackPlaying}
                />
              </main>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;