import React, { useState } from 'react';
import { SleepData, AppView } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChevronLeft, Moon, Plus, X, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface Props {
  data: SleepData[];
  setData: (data: SleepData[]) => void;
  aiInsights: any;
  setView: (view: AppView) => void;
}

const PROTOCOL_GUIDES: Record<string, { title: string; summary: string; steps: string[] }> = {
  burnout: {
    title: 'Evening Blue-Light & Cortisol Taper',
    summary: 'Gradually lowers evening sympathetic tone 45 minutes before sleep onset.',
    steps: [
      'Dim overhead cool lighting and switch devices to warm display mode 45 minutes before bed.',
      'Listen to 10 minutes of 432 Hz or Pink Noise meditation to shift into slower alpha waves.',
      'Keep bedroom ambient temperature between 18°C and 19.5°C for uninterrupted slow-wave sleep.'
    ]
  },
  forecast: {
    title: 'Restorative Cycle Alignment Protocol',
    summary: 'Stabilizes REM duration and minimizes mid-night micro-arousals.',
    steps: [
      'Anchor wake-up time within a consistent 30-minute window, including weekends.',
      'Get 10 minutes of natural outdoor morning light within 60 minutes of waking.',
      'Avoid caffeine within 9 hours of your target sleep onset.'
    ]
  }
};

const CustomSleepTooltip = React.memo(({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-[#111720] px-4 py-3 rounded-xl shadow-lg border border-slate-900/10 dark:border-white/10 text-slate-900 dark:text-slate-100">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">{label}</p>
        <p className="display-number text-base font-semibold text-[#0F5E59] dark:text-teal-400">{data.hours} hrs</p>
        <p className="text-xs text-slate-600 dark:text-slate-300 display-number">Quality {data.quality}/10 · {data.label}</p>
      </div>
    );
  }
  return null;
});

const SleepTracker: React.FC<Props> = React.memo(({ data, setData, aiInsights, setView }) => {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const [showLogForm, setShowLogForm] = useState(false);
  const [newHours, setNewHours] = useState('7.5');
  const [newQuality, setNewQuality] = useState('8');
  const [activeProtocol, setActiveProtocol] = useState<{ title: string; summary: string; steps: string[] } | null>(null);

  const avgHours = data.length > 0
    ? (data.reduce((acc, curr) => acc + curr.hours, 0) / data.length).toFixed(1)
    : '0.0';

  const monthlyData: SleepData[] = [
    { date: 'Wk 1', hours: 6.9, quality: 7, score: 72, label: 'Fair' },
    { date: 'Wk 2', hours: 7.3, quality: 8, score: 79, label: 'Good' },
    { date: 'Wk 3', hours: 7.1, quality: 7, score: 75, label: 'Good' },
    { date: 'Current', hours: Number(avgHours) || 7.2, quality: 8, score: 82, label: 'Optimal' },
  ];

  const chartData = timeframe === 'weekly' ? data : monthlyData;

  const handleAddSleep = (e: React.FormEvent) => {
    e.preventDefault();
    const hours = Math.max(1, Math.min(14, parseFloat(newHours) || 7.5));
    const quality = Math.max(1, Math.min(10, parseInt(newQuality) || 8));
    const dayLabel = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    const label = quality >= 8 ? 'Great' : quality >= 6 ? 'Good' : 'Fair';
    const score = Math.round((hours / 8) * 50 + quality * 5);

    setData([...data.slice(-6), { date: dayLabel, hours, quality, score, label }]);
    setShowLogForm(false);
  };

  return (
    <div className="space-y-8 md:space-y-10 animate-in fade-in duration-500 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-900/10 dark:border-white/[0.08] pb-6">
        <div className="space-y-2">
          <button
            onClick={() => setView(AppView.DASHBOARD)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0F5E59] dark:text-teal-400 hover:underline min-h-[36px]"
            aria-label="Back to Dashboard"
          >
            <ChevronLeft size={15} />
            <span>Dashboard</span>
          </button>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal text-slate-900 dark:text-white tracking-tight">
            Sleep & Recovery
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Rest duration, cycle quality, and preventative recovery guidance.
          </p>
        </div>

        <button
          onClick={() => setShowLogForm(!showLogForm)}
          className="calm-btn-primary px-5 py-3 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 min-h-[44px] self-start sm:self-auto"
          aria-label="Log sleep session"
        >
          <Plus size={16} />
          <span>Log Night</span>
        </button>
      </div>

      {/* Log Sleep Drawer */}
      {showLogForm && (
        <form onSubmit={handleAddSleep} className="glass-card rounded-2xl p-6 space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h2 className="font-editorial text-xl text-slate-900 dark:text-white">Record Sleep Session</h2>
            <button type="button" onClick={() => setShowLogForm(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sleep-hours" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Duration (Hours)
              </label>
              <input
                id="sleep-hours"
                type="number"
                step="0.1"
                min="1"
                max="14"
                value={newHours}
                onChange={(e) => setNewHours(e.target.value)}
                className="w-full bg-[#F5F4EF] dark:bg-slate-900/70 border border-slate-900/12 dark:border-white/12 px-4 py-2.5 rounded-xl text-sm display-number outline-none focus:border-[#0F5E59] dark:focus:border-teal-400"
              />
            </div>
            <div>
              <label htmlFor="sleep-quality" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                Rest Quality (1–10)
              </label>
              <input
                id="sleep-quality"
                type="number"
                min="1"
                max="10"
                value={newQuality}
                onChange={(e) => setNewQuality(e.target.value)}
                className="w-full bg-[#F5F4EF] dark:bg-slate-900/70 border border-slate-900/12 dark:border-white/12 px-4 py-2.5 rounded-xl text-sm display-number outline-none focus:border-[#0F5E59] dark:focus:border-teal-400"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowLogForm(false)} className="px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300">
              Cancel
            </button>
            <button type="submit" className="calm-btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold">
              Save Entry
            </button>
          </div>
        </form>
      )}

      {/* Main Quality Summary + Protocol Card */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 glass-card p-6 sm:p-8 lg:p-10 rounded-2xl flex flex-col justify-between gap-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Moon size={14} className="text-[#0F5E59] dark:text-teal-400" />
                <span>Sleep Quality Index</span>
              </div>
              <h2 className="font-editorial text-2xl sm:text-3xl font-normal text-slate-900 dark:text-white">
                Nightly Recovery Balance
              </h2>
            </div>

            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              +4% vs prior week · Target 85+
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="display-number text-6xl sm:text-7xl font-semibold text-slate-900 dark:text-white tracking-tight">
              {aiInsights?.score || '78'}
            </span>
            <span className="text-lg text-slate-400 display-number">/ 100</span>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-5 border-t border-slate-900/10 dark:border-white/[0.08]">
            <div className="space-y-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">State</p>
              <p className="text-base sm:text-lg font-semibold text-[#0F5E59] dark:text-teal-400">
                {aiInsights?.label || 'Optimal'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">Avg Duration</p>
              <p className="display-number text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                {avgHours}h
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">Deep Sleep</p>
              <p className="display-number text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
                32%
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 sm:p-8 bg-[#0C1117] text-white border border-white/[0.08] flex flex-col justify-between gap-6">
          <div className="space-y-3">
            <p className="text-xs font-medium text-teal-400">Preventative Focus</p>
            <h3 className="font-editorial text-2xl sm:text-3xl font-normal leading-snug">
              Burnout Prevention
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {aiInsights?.advice || "Your restorative sleep onset is slightly delayed. Stepping away from bright screens 30 minutes earlier supports deeper REM recovery."}
            </p>
          </div>
          <button
            onClick={() => setActiveProtocol(PROTOCOL_GUIDES.burnout)}
            className="w-full py-3 px-4 bg-white text-slate-950 hover:bg-teal-50 rounded-xl font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2 min-h-[44px]"
            aria-label="Explore burnout prevention protocols"
          >
            <span>Explore Protocol</span>
            <ArrowUpRight size={15} />
          </button>
        </div>
      </div>

      {/* Inline Protocol Guide Drawer */}
      {activeProtocol && (
        <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-[#0F5E59] dark:text-teal-400">Recommended Protocol</p>
              <h3 className="font-editorial text-xl sm:text-2xl text-slate-900 dark:text-white">{activeProtocol.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">{activeProtocol.summary}</p>
            </div>
            <button onClick={() => setActiveProtocol(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1" aria-label="Close protocol">
              <X size={18} />
            </button>
          </div>
          <div className="space-y-2.5 pt-2 border-t border-slate-900/10 dark:border-white/[0.08]">
            {activeProtocol.steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-200">
                <CheckCircle2 size={16} className="text-[#0F5E59] dark:text-teal-400 flex-shrink-0 mt-0.5" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recovery Trends Bar Chart */}
      <div className="glass-card p-6 sm:p-8 lg:p-10 rounded-2xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h2 className="font-editorial text-2xl sm:text-3xl font-normal text-slate-900 dark:text-white">
              Recovery Trends
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {timeframe === 'weekly' ? 'Duration across recent logged nights' : 'Weekly average hours across the past month'}
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 bg-[#F5F4EF] dark:bg-white/[0.05] rounded-xl border border-slate-900/10 dark:border-white/[0.08]">
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors min-h-[36px] ${
                timeframe === 'weekly'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              aria-label="View weekly recovery trends"
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors min-h-[36px] ${
                timeframe === 'monthly'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              aria-label="View monthly recovery trends"
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="w-full h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 12, fontFamily: 'Plus Jakarta Sans' }}
                dy={8}
              />
              <YAxis hide domain={[0, 10]} />
              <Tooltip cursor={{ fill: 'rgba(15, 94, 89, 0.05)', radius: 8 }} content={CustomSleepTooltip} />
              <Bar dataKey="hours" radius={[8, 8, 8, 8]} barSize={38}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.hours < 7 ? '#94A3B8' : '#0F5E59'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Wellness Forecasts */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="font-editorial text-2xl sm:text-3xl font-normal text-slate-900 dark:text-white">
            Wellness Forecasts
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Signals derived from sleep duration variance and reflection cadence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(aiInsights?.predictions || ["Cognitive Fatigue Risk", "Elevated Cortisol Load", "Evening Wind-Down Drift"]).map((pred: string, i: number) => (
            <div key={i} className="glass-card p-6 rounded-2xl flex flex-col justify-between gap-5">
              <div className="space-y-2">
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Pattern Signal</p>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
                  {pred}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Observed during late REM cycles across mid-week intervals.
                </p>
              </div>
              <button
                onClick={() => setActiveProtocol({ ...PROTOCOL_GUIDES.forecast, title: `${pred} · Response Guide` })}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F5E59] dark:text-teal-400 hover:underline self-start"
                aria-label={`Read protocol for ${pred}`}
              >
                <span>View Protocol</span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default SleepTracker;
