import React from 'react';
import { AppView } from '../types';
import { Cloud, Sunrise, Sun, Sunset, Moon, Coffee, Briefcase, Zap, ChevronLeft, Compass, CheckCircle2, CircleDashed, Clock } from 'lucide-react';

interface Props {
  setView: (view: AppView) => void;
}

const UserFlow: React.FC<Props> = ({ setView }) => {
  const currentHour = new Date().getHours();
  
  const steps = [
    { icon: Sunrise, time: '07:00 AM', hour: 7, action: 'Gentle Wake-up Call', desc: 'AI analyzed sleep quality and adjusted your wake alarm.' },
    { icon: Coffee, time: '08:30 AM', hour: 8.5, action: 'Mindful Morning', desc: 'Hydration check and quick breathing exercise completed.' },
    { icon: Briefcase, time: '11:00 AM', hour: 11, action: 'Workday Focus', desc: 'Corporate stress relief active. Soft forest ambient sounds playing.' },
    { icon: Zap, time: '02:00 PM', hour: 14, action: 'Power Reset', desc: 'Scheduled 5-minute desk meditation session.' },
    { icon: Sunset, time: '06:00 PM', hour: 18, action: 'Evening Wind-down', desc: 'Gratitude journal entry reminder (Audio Recording).' },
    { icon: Moon, time: '10:00 PM', hour: 22, action: 'Deep Rest', desc: '432Hz binaural beats for sleep starting soon.' },
  ];

  return (
    <div className="space-y-12 md:space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-1000 px-2 md:px-4 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <button 
            onClick={() => setView(AppView.DASHBOARD)}
            className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-black uppercase tracking-[0.25em] text-[10px] md:text-xs hover:gap-4 transition-all outline-none mb-2"
            aria-label="Back to Sanctuary Dashboard"
          >
            <ChevronLeft size={16} /> Back to Sanctuary
          </button>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <h2 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none transition-colors duration-300">Your Journey</h2>
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 text-xs font-black tracking-widest rounded-full border border-amber-200 dark:border-amber-700 uppercase w-fit">BETA</span>
          </div>
          <p className="text-slate-500 dark:text-slate-300 font-bold text-lg md:text-2xl transition-colors duration-300">Visualizing your path to lasting peace.</p>
        </div>

        <div className="flex items-center gap-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-3 rounded-[2.5rem] border border-white dark:border-slate-700 shadow-sm ring-1 ring-amber-500/5 transition-colors duration-300">
           <Compass className="text-amber-600 dark:text-amber-400 ml-2" />
           <p className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] pr-4">Timeline Active</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 glass-card p-10 md:p-14 rounded-[3rem] md:rounded-[5rem] shadow-2xl border-none ring-1 ring-amber-500/10 dark:ring-amber-700/10 hover:shadow-amber-500/20 transition-all duration-300 hover:scale-[1.005]">
          <div className="flex items-center justify-between mb-16">
            <h3 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight transition-colors duration-300">Daily Rhythm</h3>
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-5 py-2 rounded-full">
              <Clock size={16} />
              <span className="text-sm font-black uppercase tracking-widest">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          </div>
          <div className="relative space-y-12">
            <div className="absolute left-6 top-4 bottom-4 w-1 bg-gradient-to-b from-amber-200 via-amber-500 to-amber-100 dark:from-amber-700 dark:via-amber-500 dark:to-amber-700 rounded-full"></div>
            {steps.map((step, i) => {
              const isPast = step.hour < currentHour;
              const isCurrent = Math.abs(step.hour - currentHour) < 1.5;
              return (
                <div key={i} className={`relative pl-16 group transition-all duration-500 ${isCurrent ? 'scale-105' : ''}`}>
                  <div className={`
                    absolute left-1 top-0 w-11 h-11 rounded-[1.25rem] border-4 flex items-center justify-center z-10 transition-all duration-500
                    ${isPast ? 'bg-emerald-500 border-emerald-100 text-white shadow-lg shadow-emerald-500/20' : 
                      isCurrent ? 'bg-white dark:bg-slate-700 border-amber-500 text-amber-600 dark:text-amber-300 shadow-2xl shadow-amber-500/30 rotate-12 scale-125' : 
                      'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-500 shadow-sm'}
                  `}>
                    {isPast ? <CheckCircle2 size={20} /> : <step.icon size={20} className={isCurrent ? 'animate-pulse' : ''} />}
                  </div>
                  <div className={`
                    p-8 rounded-[2rem] border transition-all duration-500
                    ${isCurrent ? 'bg-amber-600 text-white shadow-2xl border-none' : 'bg-white/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xl'}
                  `}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <span className={`text-[10px] md:text-xs font-black uppercase tracking-[0.3em] ${isCurrent ? 'text-amber-100' : 'text-amber-600 dark:text-amber-400'}`}>{step.time}</span>
                      {isCurrent && (
                        <span className="px-4 py-1 bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest">Active Now</span>
                      )}
                    </div>
                    <h4 className={`text-xl md:text-2xl font-black tracking-tight ${isCurrent ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{step.action}</h4>
                    <p className={`text-sm md:text-base font-medium mt-2 leading-relaxed ${isCurrent ? 'text-amber-50 opacity-90' : 'text-slate-500 dark:text-slate-400'}`}>{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="space-y-8">
           <div className="px-2">
             <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Daily Nudges</h3>
             <p className="text-slate-500 dark:text-slate-300 font-bold">Actionable steps for your health.</p>
           </div>
           <div className="glass-card p-10 rounded-[3.5rem] bg-amber-600 text-white shadow-2xl shadow-amber-600/20 border-none space-y-8 group transition-transform hover:scale-[1.03] hover:shadow-amber-500/30">
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-white/20">
                <Sun size={32} className="text-amber-100" />
              </div>
              <div className="space-y-4">
                <h4 className="text-3xl font-black tracking-tight leading-none">Stretch & Move</h4>
                <p className="text-amber-50 font-medium text-lg leading-relaxed opacity-90 italic">
                  "You've been at your station for 120 minutes. A 3-minute desk yoga session is highly recommended."
                </p>
              </div>
              <button className="w-full py-5 bg-white text-amber-600 rounded-3xl font-black text-lg transition-all active:scale-95 shadow-xl hover:bg-slate-100"
              aria-label="Start desk yoga session"
              >
                Start Flow
              </button>
           </div>
           <div className="glass-card p-10 rounded-[3.5rem] bg-slate-900 text-white shadow-2xl border-none space-y-6 hover:shadow-indigo-500/20 transition-transform hover:scale-[1.005]">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <CircleDashed size={24} className="text-teal-400 animate-spin-slow" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Real-time Check</span>
              </div>
              <h4 className="text-2xl font-black text-white">Hydration Pulse</h4>
              <p className="text-slate-400 font-bold leading-relaxed">
                Stay focused and hydrated. Next glass is due in <span className="text-teal-400">12 minutes</span> to maintain peak cognitive function.
              </p>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 w-[65%] transition-all duration-1000"></div>
              </div>
           </div>
           <div className="glass-card p-10 rounded-[3.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-4 opacity-70 hover:opacity-100 transition-opacity hover:-translate-y-2">
              <Cloud size={48} className="text-slate-300 dark:text-slate-500" />
              <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-[10px]">Upcoming Sync</p>
              <h5 className="text-xl font-black text-slate-800 dark:text-white">Evening Sanctuary</h5>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">Starts in 3h 12m</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default UserFlow;