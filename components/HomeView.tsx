import React from 'react';
import { UserProfile, SleepData, ActivityData, AppView } from '../types';
import { Tooltip, ResponsiveContainer, AreaChart, Area, XAxis } from 'recharts';
import { Droplets, Footprints, Moon, Headphones, BookHeart, Compass, ArrowRight, Plus, ChevronRight } from 'lucide-react';
import homeHeroImg from '../src/assets/images/home_forest_clearing_1794849880211.jpg';

interface Props {
  user: UserProfile | null;
  sleepData: SleepData[];
  activity: ActivityData;
  setActivity: React.Dispatch<React.SetStateAction<ActivityData>>;
  aiInsights: any;
  setView: (view: AppView) => void;
}

const CustomTooltip = React.memo(({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-[#111720] px-4 py-3 rounded-xl shadow-lg border border-slate-900/10 dark:border-white/10 text-slate-900 dark:text-slate-100">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">{label}</p>
        <p className="display-number text-base font-semibold text-[#0F5E59] dark:text-teal-400">{data.hours} hrs</p>
        {data.quality && <p className="text-xs text-slate-600 dark:text-slate-300 display-number">Quality {data.quality}/10</p>}
      </div>
    );
  }
  return null;
});

const HomeView: React.FC<Props> = React.memo(({ user, sleepData, activity, setActivity, aiInsights, setView }) => {
  const addWater = () => {
    setActivity(prev => ({ ...prev, waterIntake: prev.waterIntake + 1 }));
  };

  const waterGoal = user?.waterGoal ? user.waterGoal * 4 : 8;
  const waterPercent = Math.min(Math.round((activity.waterIntake / waterGoal) * 100), 100);
  const stepGoal = user?.stepGoal || 8000;
  const stepEfficiency = Math.min(Math.round((activity.steps / stepGoal) * 100), 100);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const spaces = [
    {
      id: 'meditate',
      title: 'Meditation',
      desc: 'Generative forest & binaural soundscapes',
      icon: Headphones,
      view: AppView.MUSIC,
    },
    {
      id: 'sleep',
      title: 'Sleep & Rest',
      desc: 'REM cycles, duration & recovery telemetry',
      icon: Moon,
      view: AppView.SLEEP,
    },
    {
      id: 'journal',
      title: 'Gratitude',
      desc: 'Private voice & text daily reflection',
      icon: BookHeart,
      view: AppView.JOURNAL,
    },
    {
      id: 'flow',
      title: 'Daily Flow',
      desc: 'Circadian schedule & desk reset timer',
      icon: Compass,
      view: AppView.ACTIVITY,
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
              Step away from notification noise. Tune into restorative acoustics, sleep recovery, and quiet reflection.
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

      {/* Editorial Daily Mantra & Insight */}
      <section className="glass-card rounded-2xl p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-[#0F5E59] dark:text-teal-400">Daily Mantra</span>
            <span aria-hidden="true">·</span>
            <span>Morning Anchor</span>
          </div>
          <blockquote className="font-editorial italic text-2xl sm:text-3xl text-slate-900 dark:text-white leading-snug text-balance">
            {aiInsights?.affirmation ? `"${aiInsights.affirmation}"` : '"I am the calm center in the stream of daily work."'}
          </blockquote>
        </div>

        <div className="lg:col-span-5 lg:border-l border-t lg:border-t-0 border-slate-900/10 dark:border-white/[0.08] pt-5 lg:pt-0 lg:pl-8 space-y-3">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Guidance</p>
          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
            {aiInsights?.advice || "Mental clarity peaks mid-morning. Reserve your deepest focus block before 11:00 AM, then take a 5-minute acoustic reset."}
          </p>
          <button
            onClick={() => setView(AppView.ACTIVITY)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F5E59] dark:text-teal-400 hover:underline pt-1"
            aria-label="Explore daily activity plan"
          >
            <span>Open Daily Flow</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </section>

      {/* Restfulness Telemetry & Daily Vitals */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Sleep Chart Panel */}
        <div className="xl:col-span-2 glass-card rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Restfulness · Past 5 Nights</p>
              <h2 className="font-editorial text-2xl sm:text-3xl font-normal text-slate-900 dark:text-white tracking-tight">
                Biometric Recovery
              </h2>
            </div>

            <div className="flex items-baseline gap-3">
              <div className="text-left sm:text-right">
                <div className="flex items-baseline gap-1.5">
                  <span className="display-number text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-white">
                    {aiInsights?.score || '72'}
                  </span>
                  <span className="text-sm text-slate-400 display-number">/ 100</span>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  {aiInsights?.label || 'Calibrated'} · +12% consistency
                </p>
              </div>
            </div>
          </div>

          <div className="w-full h-44 sm:h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sleepData} margin={{ top: 6, right: 6, left: 6, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHoursSanctuary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F5E59" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#0F5E59" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12, fontFamily: 'Plus Jakarta Sans' }}
                />
                <Tooltip content={CustomTooltip} cursor={{ stroke: '#0F5E59', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area
                  type="monotone"
                  dataKey="hours"
                  stroke="#0F5E59"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorHoursSanctuary)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-4 border-t border-slate-900/10 dark:border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Consistent REM stability observed across mid-week sessions.
            </span>
            <button
              onClick={() => setView(AppView.SLEEP)}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F5E59] dark:text-teal-400 hover:underline whitespace-nowrap"
              aria-label="View full sleep report"
            >
              <span>Full Sleep Report</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* Daily Vitals Column */}
        <div className="flex flex-col gap-6">
          {/* Hydration */}
          <div className="glass-card rounded-2xl p-6 flex-1 flex flex-col justify-between gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <Droplets size={14} className="text-sky-600 dark:text-sky-400" />
                  <span>Hydration</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="display-number text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
                    {activity.waterIntake}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400 display-number">
                    / {waterGoal} glasses
                  </span>
                </div>
              </div>

              <button
                onClick={addWater}
                className="px-3.5 py-2 rounded-xl border border-slate-900/12 dark:border-white/12 bg-[#F5F4EF] dark:bg-white/[0.04] hover:bg-slate-200/70 dark:hover:bg-white/[0.08] text-slate-800 dark:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors min-h-[40px]"
                aria-label="Add a glass of water"
              >
                <Plus size={14} />
                <span>Add Glass</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="w-full bg-slate-200/80 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0F5E59] dark:bg-teal-400 transition-all duration-500"
                  style={{ width: `${waterPercent}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 display-number">
                {waterPercent}% of daily target ({user?.waterGoal || 2}L)
              </p>
            </div>
          </div>

          {/* Daily Movement */}
          <div className="glass-card rounded-2xl p-6 flex-1 flex flex-col justify-between gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <Footprints size={14} className="text-[#0F5E59] dark:text-teal-400" />
                  <span>Movement</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="display-number text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
                    {activity.steps.toLocaleString()}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">steps</span>
                </div>
              </div>

              <button
                onClick={() => setView(AppView.ACTIVITY)}
                className="text-xs font-semibold text-[#0F5E59] dark:text-teal-400 hover:underline inline-flex items-center gap-1 min-h-[40px]"
                aria-label="View activity efficiency details"
              >
                <span>Schedule</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="w-full bg-slate-200/80 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 dark:bg-emerald-400 transition-all duration-500"
                  style={{ width: `${stepEfficiency}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 display-number">
                {stepEfficiency}% of {stepGoal.toLocaleString()} step goal
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sanctuary Rooms */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-editorial text-xl sm:text-2xl font-normal text-slate-900 dark:text-white tracking-tight">
            Sanctuary Spaces
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">Direct entry</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {spaces.map((space) => (
            <button
              key={space.id}
              onClick={() => setView(space.view)}
              className="group glass-card p-5 rounded-2xl text-left flex flex-col justify-between gap-5 hover:border-[#0F5E59]/40 dark:hover:border-teal-400/40 transition-colors min-w-0"
              aria-label={`Enter ${space.title} room`}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#F5F4EF] dark:bg-white/[0.06] border border-slate-900/10 dark:border-white/10 flex items-center justify-center text-[#0F5E59] dark:text-teal-400">
                  <space.icon size={18} />
                </div>
                <ArrowRight size={15} className="text-slate-400 group-hover:text-[#0F5E59] dark:group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
              </div>

              <div className="space-y-1 min-w-0">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight truncate">
                  {space.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
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
