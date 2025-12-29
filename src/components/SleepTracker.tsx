
import React from 'react';
import { SleepData, AppView } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Area, AreaChart, ComposedChart } from 'recharts';
import { Info, ShieldAlert, Sparkles, TrendingUp, ChevronLeft, Moon, Clock, Zap, Star } from 'lucide-react';

interface Props {
  data: SleepData[];
  setData: (data: SleepData[]) => void;
  aiInsights: any;
  setView: (view: AppView) => void;
}

const SleepTracker: React.FC<Props> = ({ data, aiInsights, setView }) => {
  const avgHours = (data.reduce((acc, curr) => acc + curr.hours, 0) / data.length).toFixed(1);

  return (
    <div className="space-y-10 md:space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-1000 px-2 md:px-4 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <button 
            onClick={() => setView(AppView.DASHBOARD)}
            className="flex items-center gap-2 text-blue-600 label-caps hover:gap-4 transition-all outline-none mb-2"
          >
            <ChevronLeft size={16} /> Back to Sanctuary
          </button>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <h2 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">Rest & Recovery</h2>
            <span className="label-caps px-3 py-1 bg-blue-100 text-blue-600 rounded-full border border-blue-200 w-fit">BETA</span>
          </div>
          <p className="text-slate-500 font-semibold text-lg md:text-2xl">Clinical-grade insights for corporate performance.</p>
        </div>

        <div className="flex items-center gap-4 bg-white/60 backdrop-blur-xl p-3 rounded-[2.5rem] border border-white shadow-sm ring-1 ring-blue-500/5">
           <div className="px-6 py-2 bg-blue-600 text-white rounded-full label-caps">Live Analysis</div>
           <p className="text-slate-900 font-bold text-sm pr-4">Updated 2m ago</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-10 md:p-14 rounded-[3rem] md:rounded-[4.5rem] relative overflow-hidden flex flex-col justify-between shadow-2xl border-none ring-1 ring-blue-500/10 min-h-[450px]">
           <div className="absolute top-[-50px] right-[-50px] opacity-[0.03] text-blue-900">
             <Moon size={300} />
           </div>
           <div className="space-y-10 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                  <Star size={28} fill="currentColor" />
                </div>
                <div>
                  <h3 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Sleep Quality Index</h3>
                  <p className="text-slate-500 font-semibold">Comprehensive nightly analysis</p>
                </div>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-[120px] md:text-[180px] font-black text-slate-900 tracking-tighter leading-none drop-shadow-2xl display-number">
                  {aiInsights?.score || '78'}
                </span>
                <div className="space-y-1">
                   <div className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full label-caps inline-block">
                     +{Math.floor(Math.random() * 5) + 2}% Up
                   </div>
                   <p className="label-caps text-slate-400 pl-1">Target 85+</p>
                </div>
              </div>
           </div>
           <div className="grid grid-cols-3 gap-6 relative z-10">
              <div className="space-y-1">
                <p className="label-caps text-slate-400">State</p>
                <p className="text-lg md:text-2xl font-black text-blue-600">{aiInsights?.label || 'Optimal'}</p>
              </div>
              <div className="space-y-1">
                <p className="label-caps text-slate-400">Avg Duration</p>
                <p className="text-lg md:text-2xl font-black text-slate-900 display-number">{avgHours}h</p>
              </div>
              <div className="space-y-1">
                <p className="label-caps text-slate-400">Deep Sleep</p>
                <p className="text-lg md:text-2xl font-black text-slate-900 display-number">32%</p>
              </div>
           </div>
        </div>
        <div className="glass-card p-10 rounded-[3rem] md:rounded-[4.5rem] bg-slate-900 text-white border-none flex flex-col justify-between shadow-2xl relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent opacity-50"></div>
           <div className="relative z-10 space-y-6">
              <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-white/20">
                <Zap size={32} className="text-blue-400" />
              </div>
              <h4 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">Burnout <br/>Prevention</h4>
              <p className="text-slate-300 font-medium text-lg leading-relaxed italic">
                "{aiInsights?.advice || "Your restorative sleep phase is slightly delayed. Consider cutting blue light 30 minutes earlier tonight."}"
              </p>
           </div>
           <button className="relative z-10 w-full py-5 bg-white text-slate-900 rounded-3xl font-black text-lg transition-all hover:scale-[1.02] active:scale-95 shadow-xl font-display">
             Explore Protocols
           </button>
        </div>
      </div>

      <div className="glass-card p-10 md:p-14 rounded-[3rem] md:rounded-[5rem] shadow-2xl border-none ring-1 ring-slate-200/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div className="space-y-2">
            <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Recovery Trends</h3>
            <p className="text-slate-500 font-semibold">Historical data across past 7 sessions</p>
          </div>
          <div className="flex gap-2">
             <button className="px-6 py-3 bg-slate-100 text-slate-900 rounded-2xl label-caps border border-slate-200">Weekly</button>
             <button className="px-6 py-3 text-slate-400 rounded-2xl label-caps">Monthly</button>
          </div>
        </div>
        <div className="h-[400px] -mx-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700, fontFamily: 'Outfit' }} dy={20} />
              <YAxis hide />
              <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.05)', radius: 24 }} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', padding: '16px 24px', background: '#ffffff', fontFamily: 'Outfit' }} itemStyle={{ color: '#1e40af', fontWeight: 900, fontSize: '18px' }} labelStyle={{ color: '#64748b', fontWeight: 800, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '10px' }} />
              <Bar dataKey="hours" radius={[18, 18, 18, 18]} barSize={48}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.hours < 7 ? '#60a5fa' : '#2563eb'} />
                ))}
              </Bar>
              <Area type="monotone" dataKey="hours" stroke="none" fill="url(#chartGradient)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-8">
        <div className="px-2">
          <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <ShieldAlert className="text-blue-600 w-10 h-10 md:w-14 md:h-14" /> Wellness Forecasts
          </h3>
          <p className="text-slate-500 font-semibold text-lg md:text-2xl">Predictive health alerts based on biometric patterns.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(aiInsights?.predictions || ["Cognitive Fatigue Risk", "Elevated Cortisol Levels", "Social Withdrawal Signal"]).map((pred: string, i: number) => (
            <div key={i} className="glass-card p-10 rounded-[3rem] space-y-8 hover:shadow-2xl transition-all hover:-translate-y-2 border-none ring-1 ring-slate-100">
               <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center">
                 <Sparkles size={32} />
               </div>
               <div className="space-y-3">
                 <h4 className="text-2xl font-black text-slate-900 tracking-tight leading-snug">{pred}</h4>
                 <p className="text-slate-500 font-semibold">Detected in late REM cycles during Tuesday - Thursday interval.</p>
               </div>
               <div className="flex items-center gap-2 label-caps text-blue-700">
                 Read Protocol <TrendingUp size={16} />
               </div>
            </div>
          ))}
          <button className="glass-card p-10 rounded-[3rem] border-2 border-dashed border-blue-200 flex flex-col items-center justify-center text-center space-y-4 hover:bg-blue-50 transition-all group outline-none">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Info className="text-blue-600" />
            </div>
            <span className="text-xl font-black text-blue-900 font-display">Unlock Full Bio-Report</span>
            <p className="text-sm text-slate-500 font-semibold">Connect your wearable for heart-rate variability tracking.</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SleepTracker;
