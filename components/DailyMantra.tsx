import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, RefreshCw } from 'lucide-react';
import { DailyMantraItem } from '../types';

interface DailyMantraProps {
  mantras: DailyMantraItem[];
  isLoading: boolean;
  error: string | null;
  userName?: string;
  onRefresh: () => void;
}

const ROTATION_INTERVAL_MS = 12000;

export const DailyMantra: React.FC<DailyMantraProps> = ({
  mantras,
  isLoading,
  error,
  userName,
  onRefresh,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Reset to first affirmation whenever a fresh set arrives after login or refresh
  useEffect(() => {
    setActiveIndex(0);
    setIsFading(false);
  }, [mantras]);

  const switchToIndex = useCallback(
    (nextIndex: number) => {
      if (mantras.length <= 1) return;
      const wrapped = ((nextIndex % mantras.length) + mantras.length) % mantras.length;
      if (prefersReducedMotion) {
        setActiveIndex(wrapped);
        return;
      }
      setIsFading(true);
      window.setTimeout(() => {
        setActiveIndex(wrapped);
        setIsFading(false);
      }, 170);
    },
    [mantras.length, prefersReducedMotion]
  );

  useEffect(() => {
    if (mantras.length <= 1 || isPaused || isInteracting || isLoading || prefersReducedMotion) {
      return;
    }

    const timer = window.setInterval(() => {
      switchToIndex(activeIndex + 1);
    }, ROTATION_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [activeIndex, mantras.length, isPaused, isInteracting, isLoading, prefersReducedMotion, switchToIndex]);

  const current = mantras[activeIndex] ?? mantras[0];
  const displayIndex = String(Math.min(activeIndex + 1, Math.max(mantras.length, 1))).padStart(2, '0');
  const displayTotal = String(Math.max(mantras.length, 1)).padStart(2, '0');

  return (
    <section
      aria-label="Daily Mantra"
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onFocusCapture={() => setIsInteracting(true)}
      onBlurCapture={() => setIsInteracting(false)}
      className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6 min-w-0 h-full"
    >
      {/* Top metadata & single-line control bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 min-w-0">
          <span className="font-medium text-[#0F5E59] dark:text-teal-400 whitespace-nowrap">
            Daily Mantra
          </span>
          <span aria-hidden="true">·</span>
          <span className="truncate max-w-[160px] sm:max-w-[220px]">
            {isLoading && !current ? 'Preparing reflection' : current?.theme || 'Mindful Anchor'}
          </span>
          {mantras.length > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="display-number font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                {displayIndex} / {displayTotal}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => switchToIndex(activeIndex - 1)}
            disabled={isLoading || mantras.length <= 1}
            className="w-10 h-10 rounded-xl border border-slate-900/10 dark:border-white/10 bg-[#F5F4EF]/70 dark:bg-white/[0.04] hover:border-[#0F5E59]/40 dark:hover:border-teal-400/40 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors disabled:opacity-40"
            aria-label="Previous daily affirmation"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            disabled={isLoading || mantras.length <= 1}
            className="w-10 h-10 rounded-xl border border-slate-900/10 dark:border-white/10 bg-[#F5F4EF]/70 dark:bg-white/[0.04] hover:border-[#0F5E59]/40 dark:hover:border-teal-400/40 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors disabled:opacity-40"
            aria-label={isPaused ? 'Resume rotating affirmations' : 'Pause rotating affirmations'}
            aria-pressed={isPaused}
          >
            {isPaused ? <Play size={14} /> : <Pause size={14} />}
          </button>

          <button
            type="button"
            onClick={() => switchToIndex(activeIndex + 1)}
            disabled={isLoading || mantras.length <= 1}
            className="w-10 h-10 rounded-xl border border-slate-900/10 dark:border-white/10 bg-[#F5F4EF]/70 dark:bg-white/[0.04] hover:border-[#0F5E59]/40 dark:hover:border-teal-400/40 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors disabled:opacity-40"
            aria-label="Next daily affirmation"
          >
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-10 px-3 rounded-xl border border-slate-900/10 dark:border-white/10 bg-[#F5F4EF]/70 dark:bg-white/[0.04] hover:border-[#0F5E59]/40 dark:hover:border-teal-400/40 text-xs font-medium text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
            aria-label="Generate new AI affirmations"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin text-[#0F5E59] dark:text-teal-400' : ''} />
            <span>{isLoading ? 'Updating' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Affirmation display */}
      <div className="min-h-[112px] flex flex-col justify-center">
        {isLoading && !current ? (
          <div className="space-y-3" aria-busy="true" aria-label="Loading daily affirmation">
            <div className="h-7 w-11/12 rounded-lg bg-slate-900/10 dark:bg-white/10 animate-pulse" />
            <div className="h-7 w-3/4 rounded-lg bg-slate-900/10 dark:bg-white/10 animate-pulse" />
            <div className="h-4 w-2/3 rounded-md bg-slate-900/[0.06] dark:bg-white/[0.06] animate-pulse mt-2" />
          </div>
        ) : current ? (
          <div
            className={`space-y-3 transition-all duration-200 ${
              isFading ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
            }`}
          >
            <blockquote className="font-editorial italic text-2xl sm:text-3xl text-slate-900 dark:text-white leading-snug text-balance">
              "{current.affirmation}"
            </blockquote>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              {current.breathCue}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <blockquote className="font-editorial italic text-2xl sm:text-3xl text-slate-900 dark:text-white leading-snug text-balance">
              "I am the calm center in the stream of daily work."
            </blockquote>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Take three slow breaths before transitioning into your next focus block.
            </p>
          </div>
        )}
      </div>

      {/* Step selector track & status notice */}
      <div className="pt-3 border-t border-slate-900/[0.06] dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Daily affirmation rotation">
          {(mantras.length > 0 ? mantras : [{ id: 'placeholder' }]).map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Show affirmation ${idx + 1}`}
                onClick={() => switchToIndex(idx)}
                disabled={mantras.length <= 1}
                className="py-2 px-0.5 group focus-visible:outline-none"
              >
                <span
                  className={`block h-1 rounded-full transition-all duration-200 ${
                    isActive
                      ? 'w-7 bg-[#0F5E59] dark:bg-teal-400'
                      : 'w-3 bg-slate-900/15 dark:bg-white/15 group-hover:bg-slate-900/35 dark:group-hover:bg-white/35'
                  }`}
                />
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500 dark:text-slate-400">
          {error ? (
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <span>Using offline affirmation</span>
              <button
                type="button"
                onClick={onRefresh}
                className="font-semibold underline hover:no-underline whitespace-nowrap"
              >
                Retry AI
              </button>
            </div>
          ) : (
            <span className="truncate">
              {userName ? `Tailored for ${userName}` : 'Daily mindfulness rotation'}
              {mantras.length > 1 && !prefersReducedMotion ? (isPaused ? ' · Paused' : ' · Auto-rotating') : ''}
            </span>
          )}
        </div>
      </div>
    </section>
  );
};
