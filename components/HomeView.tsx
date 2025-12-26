import React from 'react';
import { UserProfile, SleepData, ActivityData, AppView } from '../types';
import { Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Droplets, Footprints, Moon, Sparkles, Wind, ArrowUpRight, PlayCircle, BookHeart, Brain, Compass, ChevronRight } from 'lucide-react';

interface Props {
  user: UserProfile | null;
  sleepData: SleepData[];
  activity: ActivityData;
  setActivity: React.Dispatch<React.SetStateAction<ActivityData>>;
  aiInsights: any;
  setView: (view: AppView) => void;
}

const HomeView: React.FC<Props> = ({ user, sleepData, activity, setActivity, aiInsights, setView }) => {
  const addWater = () => {
    setActivity(prev => ({ ...prev, waterIntake: prev.waterIntake + 1 }));
  };

  const waterPercent = Math.min(Math.round((activity.waterIntake / (user?.waterGoal ? user.waterGoal * 4 : 8)) * 100), 100);

  const modules = [
    {
      id: 'meditate',
      title: 'Daily Meditation',
      desc: 'Procedural forest baths and ocean breath.',
      icon: Brain,
      view: AppView.MUSIC,
      color: 'bg-indigo-600',
      textColor: 'text-indigo-900',
      lightColor: 'bg-indigo-50'
    },
    {
      id: 'journal',
      title: 'Gratitude Journal',
      desc: 'Release thoughts to your empathetic AI companion.',
      icon: BookHeart,
      view: AppView.JOURNAL,
      color: 'bg-rose-500',
      textColor: 'text-rose-900',
      lightColor: 'bg-rose-50'
    },
    {
      id: 'sleep',
      title: 'Sleep Journal',
      desc: 'Clinical-grade cycle analysis and rest trends.',
      icon: Moon,
      view: AppView.SLEEP,
      color: 'bg-blue-600',
      textColor: 'text-blue-900',
      lightColor: 'bg-blue-50'
    },
    {
      id: 'flow',
      title: 'Mindful Journey',
      desc: 'Visualize your daily corporate path to peace.',
      icon: Compass,
      view: AppView.ACTIVITY,
      color: 'bg-amber-500',
      textColor: 'text-amber-900',
      lightColor: 'bg-amber-50'
    }
  ];

  const BetaBadge = () => (
    <span className="inline-block px-2 py-0.5 bg-teal-500 text-white text-[10px] font-black tracking-widest rounded-md border border-teal-600 ml-2 align-middle font-display shadow-sm">BETA</span>
  );

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20 px-1 sm:px-0">
      <section className="relative min-h-[400px] md:h-[580px] rounded-[2.5rem] md:rounded-[4.5rem] overflow-hidden group shadow-2xl border border-white/20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2560')] bg-cover bg-center transition-transform duration-[15000ms] group-hover:scale-110"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 md:via-white/50 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col items-start justify-center text-left px-8 md:px-24 py-12 space-y-6 md:space-y-10 max-w-4xl">
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-4xl xs:text-5xl sm:text-6xl md:text-8xl font-black tracking-tight text-slate-900 leading-[0.95] md:leading-tight hero-text-shadow text-balance">
              Find your <br/><span className="text-teal-700 italic drop-shadow-sm">Sanctuary.</span><BetaBadge />
            </h2>
            <p className="text-base sm:text-xl md:text-2xl text-slate-700 md:text-slate-800 font-bold max-w-2xl leading-relaxed hero-text-shadow opacity-90">
              Welcome back, {user?.name}. Ready to restore your focus?
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button 
              onClick={() => setView(AppView.MUSIC)}
              className="calm-btn-primary px-10 md:px-14 py-4 md:py-6 rounded-2xl md:rounded-[2.5rem] font-black text-lg md:text-2xl flex items-center justify-center gap-3 shadow-xl md:shadow-2xl active:scale-95 transition-all"
              aria-label="Start meditation session"
            >
              <Brain size={24} className="md:w-8 md:h-8" /> Start Meditation
            </button>
            <button 
              onClick={() => setView(AppView.JOURNAL)}
              className="bg-slate-900/90 backdrop-blur-md text-white px-8 md:px-10 py-4 md:py-6 rounded-2xl md:rounded-[2.5rem] font-black text-lg md:text-2xl hover:bg-slate-800 transition-all shadow-lg font-display active:scale-95"
              aria-label="Open quick journal"
            >
              Quick Journal
            </button>
          </div>
        </div>
      </section>

      <div className="space-y-8">
        <div className="px-4 md:px-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Daily Pulse</h3>
            <span className="label-caps px-2 py-0.5 bg-teal-50 text-teal-600 rounded-lg border border-teal-100 shadow-sm">Active</span>
          </div>
          <button onClick={() => setView(AppView.ACTIVITY)} className="text-teal-700 font-black label-caps hover:underline transition-all">View All Labs</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {modules.map((m) => (
            <button 
              key={m.id}
              onClick={() => setView(m.view)}
              className="group glass-card p-8 rounded-[2.5rem] text-left space-y-6 transition-all hover:scale-[1.03] hover:shadow-2xl active:scale-95 border-none ring-1 ring-slate-100/50"
              aria-label={`Open ${m.title}`}
            >
              <div className={`w-14 h-14 md:w-16 md:h-16 ${m.color} text-white flex items-center justify-center rounded-2xl md:rounded-3xl shadow-lg transition-transform group-hover:rotate-6`}>
                <m.icon size={28} className="md:w-8 md:h-8" />
              </div>
              <div className="space-y-2">
                <h4 className={`text-xl md:text-2xl font-black ${m.textColor} tracking-tight`}>{m.title}</h4>
                <p className="text-sm md:text-base font-semibold text-slate-500 leading-snug">{m.desc}</p>
              </div>
              <div className={`flex items-center gap-2 label-caps ${m.textColor} pt-4 opacity-40 group-hover:opacity-100 transition-opacity`}>
                Enter Room <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        <div className="glass-card p-8 sm:p-12 rounded-[3rem] md:rounded-[4.5rem] space-y-8 md:space-y-10 flex flex-col justify-between shadow-2xl relative overflow-hidden ring-1 ring-slate-100/50">
          <div className="flex justify-between items-start relative z-10">
            <div className="space-y-1 md:space-y-2">
              <h3 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Restfulness</h3>
              <p className="label-caps text-slate-400 font-bold">Biometric Recovery Curve</p>
            </div>
            <button 
              onClick={() => setView(AppView.SLEEP)}
              className="p-4 bg-teal-700 text-white rounded-2xl md:rounded-3xl shadow-xl hover:bg-teal-800 transition-all active:scale-90"
              aria-label="View detailed sleep insights"
            >
              <Moon size={24} className="md:w-8 md:h-8" />
            </button>
          </div>
          <div className="h-48 md:h-64 -mx-4 md:-mx-8 relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sleepData}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ background: '#ffffff', borderRadius: '20px', border: 'none', boxShadow: '0 15px 30px rgba(0,0,0,0.1)', color: '#0f172a', fontFamily: 'Outfit' }}
                  itemStyle={{ color: '#0d9488', fontWeight: 800, fontSize: '14px' }}
                />
                <Area type="monotone" dataKey="hours" stroke="#0d9488" strokeWidth={5} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between pt-8 border-t border-slate-100 relative z-10">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl md:text-7xl font-black text-slate-900 display-number tracking-tighter">{aiInsights?.score || '72'}</span>
              <span className="label-caps text-slate-400 font-bold opacity-80">Score</span>
            </div>
            <div className="text-right">
              <p className="label-caps text-slate-400 font-bold opacity-80 mb-1">Status</p>
              <p className="text-2xl md:text-3xl font-black text-teal-600 tracking-tight">{aiInsights?.label || 'Calibrated'}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 md:gap-8">
          <div className="glass-card p-6 sm:p-10 rounded-[2.5rem] md:rounded-[3rem] flex items-center justify-between hover:shadow-2xl transition-all ring-1 ring-slate-100/50 group">
            <div className="flex items-center gap-4 md:gap-8 min-w-0 flex-1">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-cyan-700 text-white flex items-center justify-center rounded-2xl md:rounded-3xl shadow-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                <Droplets size={28} className="md:w-10 md:h-10" />
              </div>
              <div className="space-y-2 min-w-0 flex-1">
                <h4 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">Hydration</h4>
                <div className="w-full max-w-[200px] bg-slate-100 h-3 md:h-5 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-cyan-600 transition-all duration-1500 ease-out shadow-[0_0_10px_rgba(8,145,178,0.3)]" style={{ width: `${waterPercent}%` }}></div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center ml-6">
               <button 
                onClick={addWater} 
                className="w-12 h-12 md:w-16 md:h-16 bg-cyan-700 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-cyan-800 active:scale-90 transition-all"
                aria-label="Add a glass of water"
               >
                <ArrowUpRight size={24} className="md:w-8 md:h-8" />
               </button>
               <p className="label-caps text-cyan-900 font-black mt-3 whitespace-nowrap">{activity.waterIntake} Glasses</p>
            </div>
          </div>

          <div className="glass-card p-6 sm:p-10 rounded-[2.5rem] md:rounded-[3rem] flex items-center justify-between hover:shadow-2xl transition-all ring-1 ring-slate-100/50 group">
            <div className="flex items-center gap-4 md:gap-8 flex-1">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-700 text-white flex items-center justify-center rounded-2xl md:rounded-3xl shadow-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                <Footprints size={28} className="md:w-10 md:h-10" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">Daily Steps</h4>
                <p className="text-4xl md:text-6xl font-black text-emerald-800 display-number tracking-tighter">{activity.steps.toLocaleString()}</p>
              </div>
            </div>
            <button 
              onClick={() => setView(AppView.ACTIVITY)}
              className="text-right group outline-none"
              aria-label="View activity journey"
            >
               <span className="label-caps text-slate-400 font-bold mb-1 block">Efficiency</span>
               <p className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-1 display-number">52% <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform text-emerald-600"/></p>
            </button>
          </div>

          <div className="glass-card p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] bg-slate-950 text-white border-none flex-1 flex flex-col justify-center relative overflow-hidden shadow-2xl group ring-1 ring-white/10">
             <div className="absolute top-[-40px] right-[-40px] opacity-[0.05] text-white rotate-12 transition-transform group-hover:rotate-0 duration-1000">
                <Wind size={200} />
             </div>
             <div className="relative z-10">
               <p className="label-caps text-teal-400 mb-4 flex items-center gap-2 font-black">
                  <Sparkles size={16} className="animate-pulse"/> Corporate Insight
               </p>
               <p className="text-xl md:text-3xl text-white italic font-bold leading-[1.3] text-balance tracking-tight">
                  "{aiInsights?.advice || "Your focus peaks mid-morning. Try scheduling deep work between 9 AM and 11 AM to optimize neuro-performance."}"
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;