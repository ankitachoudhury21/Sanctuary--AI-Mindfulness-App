import React, { useState, useEffect } from 'react';
import { AppView } from '../types';
import { Sunrise, Sun, Sunset, Moon, Coffee, Briefcase, Zap, ChevronLeft, CheckCircle2, Play, Pause, RotateCcw, Droplets } from 'lucide-react';

interface Props {
  setView: (view: AppView) => void;
}

const UserFlow: React.FC<Props> = ({ setView }) => {
  const currentHour = new Date().getHours();
  const [resetSeconds, setResetSeconds] = useState(180);
  const [isResetActive, setIsResetActive] = useState(false);

  useEffect(() => {
    if (!isResetActive) return;
    const timer = window.setInterval(() => {
      setResetSeconds(prev => {
        if (prev <= 1) {
          setIsResetActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isResetActive]);

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const breathPhase = resetSeconds % 12 >= 8 ? 'Inhale slowly (4s)' : resetSeconds % 12 >= 4 ? 'Hold gently (4s)' : 'Exhale release (4s)';

  const steps = [
    { icon: Sunrise, time: '07:00', period: 'AM', hour: 7, action: 'Gentle Wake-up Cue', desc: 'Circadian wake window aligned with natural light onset.' },
    { icon: Coffee, time: '08:30', period: 'AM', hour: 8.5, action: 'Morning Hydration & Breath', desc: 'First hydration target paired with 3 minutes of quiet stillness.' },
    { icon: Briefcase, time: '11:00', period: 'AM', hour: 11, action: 'Deep Focus Block', desc: 'Peak cognitive window supported by ambient forest acoustics.' },
    { icon: Zap, time: '02:00', period: 'PM', hour: 14, action: 'Midday Nervous System Reset', desc: 'Scheduled 3-minute posture release and box breathing break.' },
    { icon: Sunset, time: '06:00', period: 'PM', hour: 18, action: 'Evening Transition', desc: 'Close active work threads with a brief gratitude reflection.' },
    { icon: Moon, time: '10:00', period: 'PM', hour: 22, action: 'Rest Preparation', desc: 'Dim visual stimuli and begin 432 Hz sleep drift soundscape.' },
  ];

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
            Daily Flow
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            A steady circadian cadence from morning clarity to evening rest.
          </p>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 display-number">
          Local Time · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Circadian Timeline */}
        <div className="xl:col-span-2 glass-card p-6 sm:p-8 lg:p-10 rounded-2xl">
          <div className="flex items-baseline justify-between gap-4 mb-8">
            <h2 className="font-editorial text-2xl sm:text-3xl font-normal text-slate-900 dark:text-white">
              Circadian Rhythm
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">6 daily anchors</span>
          </div>

          <div className="relative space-y-5">
            <div className="absolute left-[19px] top-4 bottom-4 w-px bg-slate-200 dark:bg-white/10" aria-hidden="true" />
            {steps.map((step, i) => {
              const isPast = step.hour < currentHour - 1;
              const isCurrent = Math.abs(step.hour - currentHour) <= 1.5;
              return (
                <div key={i} className="relative pl-14 group">
                  <div className={`
                    absolute left-0 top-1.5 w-10 h-10 rounded-xl border flex items-center justify-center z-10 transition-colors
                    ${isPast
                      ? 'bg-[#0F5E59] dark:bg-teal-400 border-transparent text-white dark:text-slate-950'
                      : isCurrent
                      ? 'bg-white dark:bg-[#111720] border-[#0F5E59] dark:border-teal-400 text-[#0F5E59] dark:text-teal-400 shadow-sm'
                      : 'bg-[#F5F4EF] dark:bg-[#090D12] border-slate-200 dark:border-white/10 text-slate-400'}
                  `}>
                    {isPast ? <CheckCircle2 size={17} /> : <step.icon size={17} />}
                  </div>

                  <div className={`
                    p-4 sm:p-5 rounded-xl border transition-colors
                    ${isCurrent
                      ? 'bg-[#0F5E59]/[0.06] dark:bg-teal-400/[0.08] border-[#0F5E59]/30 dark:border-teal-400/30'
                      : 'bg-white/60 dark:bg-white/[0.02] border-slate-900/[0.07] dark:border-white/[0.06]'}
                  `}>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <span className="display-number text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {step.time} {step.period}
                      </span>
                      {isCurrent && (
                        <span className="text-xs font-semibold text-[#0F5E59] dark:text-teal-400">
                          Current Window
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
                      {step.action}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Reset & Hydration Column */}
        <div className="space-y-6">
          <div className="rounded-2xl p-6 sm:p-8 bg-[#0C1117] text-white border border-white/[0.08] space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-teal-400">Guided Pause</span>
                <Sun size={16} className="text-amber-300" />
              </div>
              <h3 className="font-editorial text-2xl sm:text-3xl font-normal">
                3-Minute Breath Reset
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Step back from the screen for balanced box breathing and shoulder release.
              </p>
            </div>

            <div className="py-5 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-center space-y-1.5">
              <p className="display-number text-4xl font-semibold tracking-tight text-white">
                {formatTimer(resetSeconds)}
              </p>
              <p className="text-xs text-teal-300 font-medium">
                {isResetActive ? breathPhase : resetSeconds === 0 ? 'Reset complete' : 'Ready when you are'}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  if (resetSeconds === 0) setResetSeconds(180);
                  setIsResetActive(!isResetActive);
                }}
                className="flex-1 py-3 px-4 bg-white text-slate-950 hover:bg-teal-50 rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2 transition-colors min-h-[44px]"
                aria-label={isResetActive ? "Pause breathing reset" : "Start breathing reset"}
              >
                {isResetActive ? <Pause size={15} /> : <Play size={15} />}
                <span>{isResetActive ? 'Pause' : resetSeconds === 180 ? 'Start Reset' : 'Resume'}</span>
              </button>
              <button
                onClick={() => { setIsResetActive(false); setResetSeconds(180); }}
                className="w-11 h-11 rounded-xl border border-white/15 hover:bg-white/10 flex items-center justify-center text-slate-300 transition-colors"
                aria-label="Reset timer"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Droplets size={14} className="text-sky-600 dark:text-sky-400" />
                <span>Hydration Cadence</span>
              </div>
              <span className="display-number text-xs text-slate-500 dark:text-slate-400">Next · 12m</span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Steady hydration supports afternoon focus stability and prevents late-day fatigue.
            </p>
            <button
              onClick={() => setView(AppView.MUSIC)}
              className="text-xs font-semibold text-[#0F5E59] dark:text-teal-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Pair with Focus Audio →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFlow;