import React from 'react';
import { UserProfile, SleepData, ActivityData, AppView } from '../types';
import { Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Droplets, Footprints, Moon, Sparkles, Wind, ArrowUpRight, Brain, BookHeart, Compass, ChevronRight } from 'lucide-react';

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
      title: 'Meditation',
      desc: 'Procedural forest baths.',
      icon: Brain,
      view: AppView.MUSIC,
      color: 'bg-indigo-600',
      textColor: 'text-indigo-900',
    },
    {
      id: 'journal',
      title: 'Gratitude',
      desc: 'Empathetic reflection.',
      icon: BookHeart,
      view: AppView.JOURNAL,
      color: 'bg-rose-500',
      textColor: 'text-rose-900',
    },
    {
      id: 'sleep',
      title: 'Sleep',
      desc: 'Rest trends.',
      icon: Moon,
      view: AppView.SLEEP,
      color: 'bg-blue-600',
      textColor: 'text-blue-900',
    },
    {
      id: 'flow',
      title: 'Journey',
      desc: 'Daily rhythm.',
      icon: Compass,
      view: AppView.ACTIVITY,
      color: 'bg-amber-500',
      textColor: 'text-amber-900',
    }
  ];

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20 px-1 sm:px-0">
      {/* Hero Section */}
      <section className="relative min-h-[350px] md:h-[500px] rounded-[2.5rem] md:rounded-[4.5rem] overflow-hidden group shadow-2xl border border-white/20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2560')] bg-cover bg-center transition-transform duration-[15000ms] group-hover:scale-110"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col items-start justify-center px-8 md:px-20 py-12 space-y-6 max-w-4xl">
          <div className="space-y-3">
            <h2 className="text-4xl xs:text-5xl md:text-7xl font-black tracking-tight text-slate-900 leading-[0.95] hero-text-shadow">
              Welcome home, <br/><span className="text-teal-700 italic">{user?.name || 'Friend'}</span>
            </h2>
            <p className="text-lg md:text-2xl text-slate-700 font-bold max-w-xl hero-text-shadow opacity-90">
              Ready to restore your focus in the Sanctuary?
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button 
              onClick={() => setView(AppView.MUSIC)}
              className="calm-btn-primary px-10 py-4 rounded-2xl md:rounded-3xl font-black text-lg md:text-xl flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
            >
              <Brain size={22} /> Start Meditation
            </button>
          </div>
        </div>
      </section>

      {/* 1. Daily Insight Card - Moved to top priority */}
      <section className="px-1 md:px-0">
        <div className="glass-card p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] bg-slate-900 text-white border-none flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-2xl group ring-1 ring-white/10 transition-all hover:scale-[1.01]">
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
             <button onClick={() => setView(AppView.ACTIVITY)} className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-white font-black label-caps transition-all border border-white/20 whitespace-nowrap">
                Explore Plan
             </button>
          </div>
        </div>
      </section>

      {/* 2. Restfulness Section */}
      <section className="space-y-6">
        <div className="px-4 md:px-2 flex items-center justify-between">
          <h3 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Restfulness</h3>
          <button onClick={() => setView(AppView.SLEEP)} className="text-teal-700 font-black label-caps hover:underline">Full Report</button>
        </div>
        <div className="glass-card p-8 sm:p-10 rounded-[3rem] md:rounded-[4rem] flex flex-col lg:flex-row gap-10 shadow-xl ring-1 ring-slate-100/50">
          <div className="flex-1 space-y-6">
             <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="label-caps text-slate-400 font-bold">Biometric Recovery</p>
                  <p className="text-lg text-slate-500 font-semibold italic">Clinical tracking of your REM cycles.</p>
                </div>
                <div className="text-right">
                  <span className="text-5xl md:text-7xl font-black text-slate-900 display-number tracking-tighter leading-none">{aiInsights?.score || '72'}</span>
                  <p className="label-caps text-slate-400 font-bold text-[10px] mt-1">Recovery Score</p>
                </div>
             </div>
             <div className="h-48 md:h-64 -mx-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sleepData}>
                    <defs>
                      <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip 
                      contentStyle={{ background: '#ffffff', borderRadius: '20px', border: 'none', boxShadow: '0 15px 30px rgba(0,0,0,0.1)', fontFamily: 'Outfit' }}
                      itemStyle={{ color: '#0d9488', fontWeight: 800 }}
                    />
                    <Area type="monotone" dataKey="hours" stroke="#0d9488" strokeWidth={5} fillOpacity={1} fill="url(#colorHours)" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>
          <div className="lg:w-1/3 bg-slate-50 rounded-[2rem] p-8 flex flex-col justify-center gap-4">
             <div className="space-y-1">
               <p className="label-caps text-slate-400 font-bold">Status</p>
               <p className="text-3xl font-black text-teal-600">{aiInsights?.label || 'Calibrated'}</p>
             </div>
             <div className="h-[2px] bg-slate-100 w-full"></div>
             <p className="text-slate-500 font-semibold leading-relaxed">
               Sleep consistency has improved by <span className="text-teal-700 font-black">12%</span> since last Monday. Maintain this rhythm.
             </p>
             <button onClick={() => setView(AppView.SLEEP)} className="mt-4 flex items-center gap-2 text-slate-900 font-black label-caps group">
                Cycle Details <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        </div>
      </section>

      {/* 3. Hydration & Steps Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {/* Hydration Card */}
        <div className="glass-card p-8 rounded-[2.5rem] md:rounded-[3.5rem] flex items-center justify-between hover:shadow-2xl transition-all ring-1 ring-slate-100/50 group">
          <div className="flex items-center gap-6 min-w-0 flex-1">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-cyan-700 text-white flex items-center justify-center rounded-2xl md:rounded-[2.5rem] shadow-xl flex-shrink-0 group-hover:scale-110 transition-transform">
              <Droplets size={32} />
            </div>
            <div className="space-y-2 min-w-0 flex-1">
              <h4 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight leading-none">Hydration</h4>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-cyan-600 transition-all duration-1500" style={{ width: `${waterPercent}%` }}></div>
              </div>
              <p className="text-[10px] md:text-xs font-black uppercase text-slate-400 tracking-widest">{activity.waterIntake} of {user?.waterGoal ? user.waterGoal * 4 : 8} glasses</p>
            </div>
          </div>
          <button 
            onClick={addWater} 
            className="w-14 h-14 bg-cyan-700 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-cyan-800 active:scale-90 transition-all ml-4"
          >
            <ArrowUpRight size={24} />
          </button>
        </div>

        {/* Steps Card */}
        <div className="glass-card p-8 rounded-[2.5rem] md:rounded-[3.5rem] flex items-center justify-between hover:shadow-2xl transition-all ring-1 ring-slate-100/50 group">
          <div className="flex items-center gap-6 flex-1">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-700 text-white flex items-center justify-center rounded-2xl md:rounded-[2.5rem] shadow-xl flex-shrink-0 group-hover:scale-110 transition-transform">
              <Footprints size={32} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight leading-none">Daily Steps</h4>
              <p className="text-4xl md:text-5xl font-black text-emerald-800 display-number tracking-tighter">{activity.steps.toLocaleString()}</p>
            </div>
          </div>
          <button onClick={() => setView(AppView.ACTIVITY)} className="text-right group">
             <span className="label-caps text-slate-400 font-bold mb-1 block">Efficiency</span>
             <p className="text-2xl font-black text-slate-900 flex items-center gap-1 display-number">52% <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform text-emerald-600"/></p>
          </button>
        </div>
      </section>

      {/* Quick Access Modules */}
      <section className="space-y-6">
        <div className="px-4 flex items-center justify-between">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Sanctuary Rooms</h3>
          <p className="label-caps text-slate-400 font-black">Quick Entry</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {modules.map((m) => (
            <button 
              key={m.id}
              onClick={() => setView(m.view)}
              className="group glass-card p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] text-left space-y-4 transition-all hover:scale-[1.03] hover:shadow-xl border-none ring-1 ring-slate-100/50"
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 ${m.color} text-white flex items-center justify-center rounded-2xl shadow-lg transition-transform group-hover:rotate-6`}>
                <m.icon size={24} />
              </div>
              <div>
                <h4 className={`text-lg md:text-xl font-black ${m.textColor} tracking-tight leading-tight`}>{m.title}</h4>
                <p className="text-[10px] md:text-xs font-semibold text-slate-500 mt-1 leading-tight">{m.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeView;