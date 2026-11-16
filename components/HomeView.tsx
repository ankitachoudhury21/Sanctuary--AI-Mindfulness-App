import React from 'react';
import { UserProfile, AppView, MindfulnessInsights, DailyMantraItem } from '../types';
import { Headphones, BookHeart, Sparkles, ArrowRight, ChevronRight } from 'lucide-react';
import homeHeroImg from '../src/assets/images/home_forest_clearing_1794849880211.jpg';
import { DailyMantra } from './DailyMantra';

interface Props {
  user: UserProfile | null;
  journalCount: number;
  aiInsights: MindfulnessInsights | null;
  dailyMantras: DailyMantraItem[];
  isLoadingMantras: boolean;
  mantrasError: string | null;
  onRefreshMantras: () => void;
  setView: (view: AppView) => void;
}

const HomeView: React.FC<Props> = React.memo(
  ({
    user,
    journalCount,
    aiInsights,
    dailyMantras,
    isLoadingMantras,
    mantrasError,
    onRefreshMantras,
    setView,
  }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const spaces = [
    {
      id: 'meditate',
      title: 'Meditation',
      desc: 'Generative forest baths, ragas, and binaural focus acoustics.',
      icon: Headphones,
      view: AppView.MUSIC,
    },
    {
      id: 'celestial',
      title: 'Celestial Audio',
      desc: 'Spatial planetary frequencies synthesized across the solar system.',
      icon: Sparkles,
      view: AppView.PLANETARY,
    },
    {
      id: 'journal',
      title: 'Gratitude Journal',
      desc: 'Private voice and written reflection with empathetic mentoring.',
      icon: BookHeart,
      view: AppView.JOURNAL,
    },
  ];

  return (
    <div className="space-y-8 md:space-y-10 animate-in fade-in duration-500 pb-6">
      {/* Editorial Hero Banner */}
      <section className="relative min-h-[280px] sm:min-h-[320px] rounded-2xl overflow-hidden shadow-md border border-slate-900/10 dark:border-white/[0.08] flex flex-col justify-end group">
        <img
          src={homeHeroImg}
          alt="Timber terrace overlooking misty pine forest at dawn"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          decoding="async"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#090D12]/90 via-[#090D12]/65 to-[#090D12]/25"></div>

        <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-3xl space-y-5">
          <div className="space-y-2">
            <p className="text-xs font-medium text-teal-300 tracking-wide">
              Personal Sanctuary · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="font-editorial text-3xl sm:text-5xl font-normal tracking-tight text-white leading-[1.1] text-balance">
              {greeting}, <span className="italic text-teal-200">{user?.name || 'Friend'}</span>.
            </h1>
            <p className="text-sm sm:text-base text-slate-200/90 max-w-xl leading-relaxed">
              Step away from notification noise. Tune into restorative acoustics and quiet reflection.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => setView(AppView.MUSIC)}
              className="bg-white text-slate-950 hover:bg-teal-50 px-5 py-3 rounded-xl font-semibold text-sm inline-flex items-center gap-2 transition-colors min-h-[44px]"
              aria-label="Begin Meditation"
            >
              <Headphones size={16} className="text-[#0F5E59]" />
              <span>Begin Meditation</span>
            </button>
            <button
              onClick={() => setView(AppView.JOURNAL)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-5 py-3 rounded-xl font-medium text-sm inline-flex items-center gap-2 transition-colors min-h-[44px]"
              aria-label="Write Reflection"
            >
              <span>Write Reflection</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* Rotating AI Daily Mantra & Mindfulness Index */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8 min-w-0">
          <DailyMantra
            mantras={dailyMantras}
            isLoading={isLoadingMantras}
            error={mantrasError}
            userName={user?.name}
            onRefresh={onRefreshMantras}
          />
        </div>

        <aside
          aria-label="Mindfulness Index"
          className="lg:col-span-4 glass-card rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-5 min-w-0"
        >
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Mindfulness Index</p>
              <p className="text-sm font-semibold text-[#0F5E59] dark:text-teal-400 mt-0.5">
                {aiInsights?.label || 'Balanced'}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="display-number text-4xl sm:text-5xl font-semibold text-slate-900 dark:text-white">
                {aiInsights?.score || '78'}
              </span>
              <span className="text-sm text-slate-400 display-number ml-1">/ 100</span>
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {aiInsights?.advice || 'Take three slow breaths before transitioning into your next deep focus block.'}
          </p>

          <div className="pt-3 border-t border-slate-900/[0.06] dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="display-number">
              {journalCount} {journalCount === 1 ? 'reflection' : 'reflections'} · Stress {user?.stressLevel ?? 5}/10
            </span>
            <button
              onClick={() => setView(AppView.JOURNAL)}
              className="inline-flex items-center gap-1 font-semibold text-[#0F5E59] dark:text-teal-400 hover:underline whitespace-nowrap"
              aria-label="Open Gratitude Journal"
            >
              <span>Journal</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </aside>
      </div>

      {/* Sanctuary Spaces */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-editorial text-xl sm:text-2xl font-normal text-slate-900 dark:text-white tracking-tight">
            Sanctuary Spaces
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">Direct entry</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {spaces.map((space) => (
            <button
              key={space.id}
              onClick={() => setView(space.view)}
              className="group glass-card p-6 rounded-2xl text-left flex flex-col justify-between gap-5 hover:border-[#0F5E59]/40 dark:hover:border-teal-400/40 transition-colors min-w-0"
              aria-label={`Enter ${space.title} room`}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#F5F4EF] dark:bg-white/[0.06] border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-[#0F5E59] dark:text-teal-400">
                  <space.icon size={18} />
                </div>
                <ArrowRight size={15} className="text-slate-400 group-hover:text-[#0F5E59] dark:group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
              </div>

              <div className="space-y-1.5 min-w-0">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight truncate">
                  {space.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {space.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
});

export default HomeView;
