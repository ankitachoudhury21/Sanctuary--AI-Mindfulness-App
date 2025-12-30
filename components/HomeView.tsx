
import React from 'react';
import { UserProfile, SleepData, ActivityData, AppView } from '../types';
import { Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Droplets, Footprints, Moon, Sparkles, Wind, ArrowUpRight, Brain, BookHeart, Compass, ChevronRight, Quote } from 'lucide-react';

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
      <div className="glass-card p-4 rounded-xl shadow-lg border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white transition-colors duration-300">
        <p className="label-caps text-slate-500 dark:text-slate-400 mb-1">{label}</p>
        <p className="text-lg font-black text-teal-700 dark:text-teal-400">{`${data.hours} hours`}</p>
        {data.quality && <p className="text-sm text-slate-600 dark:text-slate-300">{`Quality: ${data.quality}/10`}</p>}
        {data.label && <p className={`text-sm font-semibold ${data.label === 'Great' ? 'text-emerald-600' : data.label === 'Good' ? 'text-amber-600' : 'text-rose-600'}`}>{`Status: ${data.label}`}</p>}
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

  const BetaBadge = () => (
    <span className="px-2 py-0.5 bg-teal-500/20 text-teal-400 label-caps rounded-md border border-teal-500/30 ml-2 text-[8px] md:text-[9px]">BETA</span>
  );

  const modules = [
    {
      id: 'meditate',
      title: 'Meditation',
      desc: 'Procedural forest baths.',
      icon: Brain,
      view: AppView.MUSIC,
      color: 'bg-indigo-600',
      textColor: 'text-indigo-900',
      beta: true,
    },
    {
      id: 'journal',
      title: 'Gratitude',
      desc: 'Empathetic reflection.',
      icon: BookHeart,
      view: AppView.JOURNAL,
      color: 'bg-rose-500',
      textColor: 'text-rose-900',
      beta: true,
    },
    {
      id: 'sleep',
      title: 'Sleep',
      desc: 'Rest trends.',
      icon: Moon,
      view: AppView.SLEEP,
      color: 'bg-blue-600',
      textColor: 'text-blue-900',
      beta: true,
    },
    {
      id: 'flow',
      title: 'Journey',
      desc: 'Daily rhythm.',
      icon: Compass,
      view: AppView.ACTIVITY,
      color: 'bg-amber-500',
      textColor: 'text-amber-900',
      beta: true,
    }
  ];

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20 px-4 md:px-6">
        <section className="relative min-h-[350px] md:h-[500px] rounded-[2.5rem] md:rounded-[4.5rem] overflow-hidden group shadow-2xl border border-white/20 dark:border-slate-800">
          <img 
            src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2560" 
            alt="Forest clearing" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[15000ms] group-hover:scale-110"
            decoding="async" 
            fetchpriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent dark:from-slate-900/95 dark:via-slate-900/80 dark:to-transparent transition-colors duration-300"></div>
          <div className="absolute inset-0 flex flex-col items-start justify-center px-8 md:px-20 py-12 space-y-6 max-w-4xl">
            <div className="space-y-3">
              <h2 className="text-4xl xs:text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[0.95] hero-text-shadow transition-all duration-300 group-hover:translate-x-1">
                Welcome home, <br/><span className="text-teal-700 dark:text-teal-400 italic transition-colors duration-300">{user?.name || 'Friend'}</span>
              </h2>
              <p className="text-lg md:text-2xl text-slate-700 dark:text-slate-300 font-bold max-w-xl hero-text-shadow opacity-90 transition-colors duration-300">
                Ready to restore your focus in the Sanctuary?
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button 
                onClick={() => setView(AppView.MUSIC)}
                className="calm-btn-primary px-10 py-4 rounded-2xl md:rounded-3xl font-black text-lg md:text-xl flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all hover:shadow-teal-500/40"
                aria-label="Start Meditation"
              >
                <Brain size={22} /> Start Meditation
              </button>
            </div>
          </div>
        </section>

        <section className="px-1 md:px-0">
          <div className="relative glass-card p-10 md:p-14 rounded-[3rem] md:rounded-[4rem] border-none shadow-2xl overflow-hidden group hover:shadow-teal-500/20 transition-all duration-300 hover:scale-[1.005]">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-blue-600/5 group-hover:scale-105 transition-transform duration-1000"></div>
            <div className="absolute -top-10 -right-10 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-1000">
              <Quote size={240} className="text-teal-900 dark:text-teal-400" />
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full label-caps border border-teal-100/50 dark:border-teal-700/50">
                  <Sparkles size={14} className="animate-pulse" />
                  <span>Mantra for Today</span>
                </div>
                <h3 className="text-3xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] text-balance max-w-4xl italic transition-colors duration-300">
                  {aiInsights?.affirmation ? `"${aiInsights.affirmation}"` : '"I am the calm center in the stream of logic."'}
                </h3>
                <div className="flex items-center gap-4 pt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-300 dark:bg-teal-700"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-300 dark:bg-teal-700"></div>
                </div>
            </div>
          </div>
        </section>

        <section className="px-1 md:px-0">
          <div className="glass-card p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] bg-slate-900 text-white border-none flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-2xl group ring-1 ring-white/10 transition-all hover:scale-[1.01] hover:shadow-blue-500/20">
            <div className="absolute top-[-20px] right-[-20px] opacity-[0.05] text-white rotate-12 transition-transform group-hover:rotate-0 duration-1000">
              <Wind size={180} />
            </div>
            <div className="relative z-10 flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-500/20 rounded-2xl border border-teal-500/30">
                  <Sparkles size={24} className="text-teal-400 animate-pulse" />
                </div>
                <span className="label-caps text-teal-400 font-black text-sm tracking-[0.2em]">Daily Insight</span>
              </div>
              <p className="text-2xl md:text-4xl text-white italic font-bold leading-[1.25] text-balance tracking-tight">
                  "{aiInsights?.advice || "Your mental clarity peaks mid-morning. Try scheduling your most complex debugging tasks before 11 AM."}"
              </p>
            </div>
            <div className="mt-8 md:mt-0 md:ml-12 relative z-10">
              <button onClick={() => setView(AppView.ACTIVITY)} className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-white font-black label-caps transition-all border border-white/20 active:scale-95 whitespace-nowrap"
              aria-label="Explore daily activity plan"
              >
                  Explore Plan
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="px-4 md:px-2 flex items-center justify-between">
            <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight transition-colors duration-300">Restfulness</h3>
            <button onClick={() => setView(AppView.SLEEP)} className="text-teal-700 dark:text-teal-400 font-black label-caps hover:underline"
            aria-label="View full sleep report"
            >Full Report</button>
          </div>
          <div className="glass-card p-8 sm:p-10 rounded-[3rem] md:rounded-[4rem] flex flex-col lg:flex-row gap-10 shadow-xl ring-1 ring-slate-100/50 dark:ring-slate-700/50 hover:shadow-blue-500/20 transition-all duration-300 hover:scale-[1.005]">
            <div className="flex-1 space-y-6 min-w-0 overflow-hidden">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="label-caps text-slate-400 dark:text-slate-500 font-bold">Biometric Recovery</p>
                    <p className="text-lg text-slate-500 dark:text-slate-300 font-semibold italic">Clinical tracking of your REM cycles.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white display-number tracking-tighter leading-none transition-colors duration-300">{aiInsights?.score || '72'}</span>
                    <p className="label-caps text-slate-400 dark:text-slate-500 font-bold text-[10px] mt-1">Recovery Score</p>
                  </div>
                </div>
                <div className="w-full h-48 md:h-64 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sleepData}>
                      <defs>
                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip 
                        content={CustomTooltip} 
                        cursor={{ stroke: '#0d9488', strokeWidth: 2, strokeDasharray: '3 3' }}
                      />
                      <Area type="monotone" dataKey="hours" stroke="#0d9488" strokeWidth={5} fillOpacity={1} fill="url(#colorHours)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
            </div>
            <div className="lg:w-1/3 bg-slate-50 dark:bg-slate-800 rounded-[2rem] p-8 flex flex-col justify-center gap-4 transition-colors duration-300">
                <div className="space-y-1">
                  <p className="label-caps text-slate-400 dark:text-slate-500 font-bold">Status</p>
                  <p className="text-lg md:text-2xl font-black text-blue-600 dark:text-blue-400 transition-colors duration-300">{aiInsights?.label || 'Calibrated'}</p>
                </div>
                <div className="h-[2px] bg-slate-100 dark:bg-slate-700 w-full"></div>
                <p className="text-slate-500 dark:text-slate-300 font-semibold leading-relaxed">
                  Sleep consistency has improved by <span className="text-teal-700 dark:text-teal-400 font-black">12%</span> since last Monday. Maintain this rhythm.
                </p>
                <button onClick={() => setView(AppView.SLEEP)} className="mt-4 flex items-center gap-2 text-slate-900 dark:text-white font-black label-caps group hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                aria-label="View sleep cycle details"
                >
                  Cycle Details <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform text-emerald-600 dark:text-emerald-500"/>
                </button>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="glass-card p-8 rounded-[2.5rem] md:rounded-[3.5rem] flex items-center justify-between hover:shadow-2xl hover:shadow-cyan-500/20 transition-all ring-1 ring-slate-100/50 dark:ring-slate-700/50 group">
            <div className="flex items-center gap-6 min-w-0 flex-1">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-cyan-700 text-white flex items-center justify-center rounded-2xl md:rounded-[2.5rem] shadow-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Droplets size={32} />
              </div>
              <div className="space-y-2 min-w-0 flex-1">
                <h4 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none transition-colors duration-300">Hydration</h4>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-cyan-600 transition-all duration-1500" style={{ width: `${waterPercent}%` }}></div>
                </div>
                <p className="text-[10px] md:text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">{activity.waterIntake} of {waterGoal} glasses</p>
              </div>
            </div>
            <button 
              onClick={addWater} 
              className="w-14 h-14 bg-cyan-700 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-cyan-800 active:scale-90 transition-all ml-4"
              aria-label="Add a glass of water"
            >
              <ArrowUpRight size={24} />
            </button>
          </div>

          <div className="glass-card p-8 rounded-[2.5rem] md:rounded-[3.5rem] flex items-center justify-between hover:shadow-2xl hover:shadow-emerald-500/20 transition-all ring-1 ring-slate-100/50 dark:ring-slate-700/50 group">
            <div className="flex items-center gap-6 flex-1 min-w-0">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-700 text-white flex items-center justify-center rounded-2xl md:rounded-[2.5rem] shadow-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Footprints size={32} />
              </div>
              <div className="space-y-1 min-w-0">
                <h4 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none transition-colors duration-300">Daily Steps</h4>
                <p className="text-4xl md:text-5xl font-black text-emerald-800 dark:text-emerald-400 display-number tracking-tighter transition-colors duration-300 truncate">{activity.steps.toLocaleString()}</p>
              </div>
            </div>
            <button onClick={() => setView(AppView.ACTIVITY)} className="text-right group"
            aria-label="View activity efficiency details"
            >
              <span className="label-caps text-slate-400 dark:text-slate-500 font-bold mb-1 block">Efficiency</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-1 display-number transition-colors duration-300">52% <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform text-emerald-600 dark:text-emerald-500"/></p>
            </button>
          </div>
        </section>

        <section className="space-y-6">
          <div className="px-4 flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight transition-colors duration-300">Sanctuary Rooms</h3>
            <p className="label-caps text-slate-400 dark:text-slate-500 font-black">Quick Entry</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {modules.map((m) => (
              <button 
                key={m.id}
                onClick={() => setView(m.view)}
                className="group glass-card p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] text-left space-y-4 transition-all hover:scale-[1.03] hover:shadow-xl border-none ring-1 ring-slate-100/50 dark:ring-slate-700/50"
                aria-label={`Enter ${m.title} room`}
              >
                <div className={`w-12 h-12 md:w-14 md:h-14 ${m.color} text-white flex items-center justify-center rounded-2xl shadow-lg transition-transform group-hover:rotate-6`}>
                  <m.icon size={24} />
                </div>
                <div>
                  <h4 className={`text-lg md:text-xl font-black ${m.textColor} dark:text-white tracking-tight leading-tight flex items-center transition-colors duration-300`}>
                    {m.title}
                    {m.beta && <BetaBadge />}
                  </h4>
                  <p className="text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-300 mt-1 leading-tight transition-colors duration-300">{m.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
  );
});

export default HomeView;
