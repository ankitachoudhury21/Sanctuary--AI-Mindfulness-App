
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
      title: 'Mindful Meditation',
      desc: 'Forest baths and ocean breath.',
      icon: Brain,
      view: AppView.MUSIC,
      color: 'bg-indigo-600',
      textColor: 'text-indigo-900',
      lightColor: 'bg-indigo-50'
    },
    {
      id: 'journal',
      title: 'Gratitude Journal',
      desc: 'Release thoughts to your companion.',
      icon: BookHeart,
      view: AppView.JOURNAL,
      color: 'bg-rose-500',
      textColor: 'text-rose-900',
      lightColor: 'bg-rose-50'
    },
    {
      id: 'sleep',
      title: 'Sleep Insights',
      desc: 'Analyze your recovery cycles.',
      icon: Moon,
      view: AppView.SLEEP,
      color: 'bg-blue-600',
      textColor: 'text-blue-900',
      lightColor: 'bg-blue-50'
    },
    {
      id: 'flow',
      title: 'Mindful Journey',
      desc: 'View your corporate daily flow.',
      icon: Compass,
      view: AppView.ACTIVITY,
      color: 'bg-amber-500',
      textColor: 'text-amber-900',
      lightColor: 'bg-amber-50'
    }
  ];

  const BetaBadge = () => (
    <span className="inline-block px-2 py-0.5 bg-teal-500 text-white text-[10px] font-black tracking-widest rounded-md border border-teal-600 ml-2 align-middle">BETA</span>
  );

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20 px-1 sm:px-0">
      <section className="relative min-h-[400px] md:h-[550px] rounded-[2rem] md:rounded-[4rem] overflow-hidden group shadow-2xl border border-white/20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2560')] bg-cover bg-center transition-transform duration-[10000ms] group-hover:scale-105"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 md:via-white/40 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col items-start justify-center text-left px-6 md:px-20 py-12 space-y-6 md:space-y-8 max-w-4xl">
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-4xl xs:text-5xl sm:text-6xl md:text-8xl font-black tracking-tight text-slate-900 leading-[1.1] md:leading-tight hero-text-shadow text-balance">
              Find your <br/><span className="text-teal-700 italic">Sanctuary.</span><BetaBadge />
            </h2>
            <p className="text-base sm:text-xl md:text-2xl text-slate-700 md:text-slate-800 font-bold max-w-2xl leading-relaxed hero-text-shadow">
              Hi {user?.name}, how can we help you find balance today?
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button 
              onClick={() => setView(AppView.MUSIC)}
              className="calm-btn-primary px-8 md:px-12 py-4 md:py-6 rounded-2xl md:rounded-[2.5rem] font-black text-lg md:text-2xl flex items-center justify-center gap-3 shadow-xl md:shadow-2xl"
            >
              <Brain size={24} className="md:w-8 md:h-8" /> Start Meditation
            </button>
            <button 
              onClick={() => setView(AppView.JOURNAL)}
              className="bg-slate-900 text-white px-8 md:px-10 py-4 md:py-6 rounded-2xl md:rounded-[2.5rem] font-black text-lg md:text-2xl hover:bg-slate-800 transition-all shadow-lg"
            >
              Quick Journal
            </button>
          </div>
        </div>
      </section>

      <div className="space-y-6 md:space-y-8">
        <div className="px-4 md:px-0 flex items-center gap-3">
          <h3 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Discover Your Space</h3>
          <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-black tracking-widest rounded">BETA</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {modules.map((m) => (
            <button 
              key={m.id}
              onClick={() => setView(m.view)}
              className="group glass-card p-8 rounded-[2.5rem] text-left space-y-6 transition-all hover:scale-[1.03] hover:shadow-2xl active:scale-95 border-none ring-1 ring-slate-100"
            >
              <div className={`w-14 h-14 md:w-16 md:h-16 ${m.color} text-white flex items-center justify-center rounded-2xl md:rounded-3xl shadow-lg transition-transform group-hover:rotate-12`}>
                <m.icon size={28} className="md:w-8 md:h-8" />
              </div>
              <div className="space-y-2">
                <h4 className={`text-xl md:text-2xl font-black ${m.textColor}`}>{m.title}</h4>
                <p className="text-sm md:text-base font-bold text-slate-500 leading-snug">{m.desc}</p>
              </div>
              <div className={`flex items-center gap-2 text-sm font-black uppercase tracking-widest ${m.textColor} pt-4 opacity-0 group-hover:opacity-100 transition-opacity`}>
                Open Room <ChevronRight size={16} />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
        <div className="glass-card p-6 sm:p-10 rounded-[2.5rem] md:rounded-[4rem] space-y-6 md:space-y-8 flex flex-col justify-between shadow-xl">
          <div className="flex justify-between items-start">
            <div className="space-y-1 md:space-y-2">
              <h3 className="text-2xl md:text-4xl font-bold text-slate-900">Restfulness</h3>
              <p className="text-[10px] md:text-sm text-slate-500 font-black uppercase tracking-widest opacity-80">Weekly Recovery</p>
            </div>
            <button 
              onClick={() => setView(AppView.SLEEP)}
              className="p-3 md:p-4 bg-teal-700 text-white rounded-2xl md:rounded-3xl shadow-lg hover:bg-teal-800 transition-colors"
            >
              <Moon size={24} className="md:w-8 md:h-8" />
            </button>
          </div>
          <div className="h-48 md:h-56 -mx-2 md:-mx-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sleepData}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ background: '#ffffff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', color: '#0f172a' }}
                  itemStyle={{ color: '#0d9488' }}
                />
                <Area type="monotone" dataKey="hours" stroke="#0d9488" strokeWidth={4} md:strokeWidth={5} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between pt-6 md:pt-8 border-t border-slate-100">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl md:text-6xl font-black text-slate-900">{aiInsights?.score || '71.8'}</span>
              <span className="text-slate-500 text-[10px] md:text-sm font-black uppercase tracking-widest opacity-80">Score</span>
            </div>
            <div className="text-right">
              <p className="text-[9px] md:text-[11px] font-black text-slate-500 uppercase tracking-widest opacity-80">Current State</p>
              <p className="text-xl md:text-2xl font-bold text-teal-600">{aiInsights?.label || 'Moderate'}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:gap-6">
          <div className="glass-card p-5 sm:p-8 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-between hover:shadow-xl transition-all">
            <div className="flex items-center gap-4 md:gap-6 min-w-0 flex-1">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-cyan-700 text-white flex items-center justify-center rounded-xl md:rounded-2xl shadow-lg flex-shrink-0">
                <Droplets size={24} className="md:w-9 md:h-9" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <h4 className="text-lg md:text-2xl font-black text-slate-900">Hydration</h4>
                <div className="w-full max-w-[180px] bg-slate-100 h-2.5 md:h-4 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-700 transition-all duration-1000" style={{ width: `${waterPercent}%` }}></div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center ml-4">
               <button onClick={addWater} className="w-10 h-10 md:w-14 md:h-14 bg-cyan-700 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all">
                <ArrowUpRight size={20} className="md:w-7 md:h-7" />
               </button>
               <p className="text-[10px] md:text-sm font-black text-slate-900 mt-1 md:mt-2 uppercase tracking-widest whitespace-nowrap">{activity.waterIntake} Glasses</p>
            </div>
          </div>
          <div className="glass-card p-5 sm:p-8 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-between hover:shadow-xl transition-all">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-700 text-white flex items-center justify-center rounded-xl md:rounded-2xl shadow-lg flex-shrink-0">
                <Footprints size={24} className="md:w-9 md:h-9" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg md:text-2xl font-black text-slate-900">Daily Steps</h4>
                <p className="text-3xl md:text-5xl font-black text-emerald-800">{activity.steps.toLocaleString()}</p>
              </div>
            </div>
            <button 
              onClick={() => setView(AppView.ACTIVITY)}
              className="text-right group"
            >
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-80">View Flow</span>
               <p className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-1">52% <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/></p>
            </button>
          </div>
          <div className="glass-card p-8 rounded-[2rem] md:rounded-[3rem] bg-slate-900 text-white border-none flex-1 flex flex-col justify-center relative overflow-hidden shadow-xl">
             <div className="absolute top-[-40px] right-[-40px] opacity-10">
                <Wind size={150} />
             </div>
             <p className="text-teal-400 font-black mb-3 flex items-center gap-2 tracking-[0.2em] uppercase text-[10px] md:text-sm relative z-10">
                <Sparkles size={14}/> Daily Insight
             </p>
             <p className="text-lg md:text-2xl text-white italic font-bold leading-snug md:leading-relaxed relative z-10 text-balance">
                "{aiInsights?.advice || "Your focus peaks mid-morning. Try scheduling deep work between 9 AM and 11 AM, and save routine tasks for later."}"
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
