
import React from 'react';
import { AppView } from '../types';
import { Home, BookHeart, Moon, Music, Compass, LogOut, Brain } from 'lucide-react';

interface Props {
  activeView: AppView;
  setView: (view: AppView) => void;
  onLogout: () => void;
}

const DesktopNavItem: React.FC<{ item: any; activeView: AppView; setView: (view: AppView) => void }> = ({ item, activeView, setView }) => {
  const isActive = activeView === item.view;
  const Icon = item.icon;
  return (
    <button 
      onClick={() => setView(item.view)}
      className="w-full flex items-center gap-4 px-6 py-3 group transition-all duration-300 outline-none"
    >
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
        ${isActive 
          ? `${item.color} border-transparent text-white shadow-lg` 
          : 'border-white/20 text-white/70 group-hover:border-white/40 group-hover:text-white'}
      `}>
        <Icon size={18} fill={isActive ? 'currentColor' : 'none'} />
      </div>
      <span className={`text-lg transition-colors duration-300 font-display ${isActive ? 'font-bold text-white' : 'text-slate-400 font-medium group-hover:text-slate-200'}`}>
        {item.label}
      </span>
    </button>
  );
};

const MobileNavItem: React.FC<{ item: any; activeView: AppView; setView: (view: AppView) => void }> = ({ item, activeView, setView }) => {
  const isActive = activeView === item.view;
  const Icon = item.icon;
  return (
    <button 
      onClick={() => setView(item.view)}
      className="flex flex-col items-center justify-center flex-1 min-w-0 py-2 gap-1 outline-none transition-all active:opacity-60"
    >
      <div className={`
        w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
        ${isActive 
          ? `${item.color} text-white shadow-lg shadow-black/10` 
          : 'text-slate-500'}
      `}>
        <Icon size={20} fill={isActive ? 'currentColor' : 'none'} />
      </div>
      <span className={`label-caps truncate w-full px-1 ${isActive ? 'text-white' : 'text-slate-500'}`} style={{ fontSize: '7px' }}>
        {item.label}
      </span>
    </button>
  );
};

const Navigation: React.FC<Props> = ({ activeView, setView, onLogout }) => {
  const navItems = [
    { icon: Home, label: 'Home', view: AppView.DASHBOARD, color: 'bg-emerald-500' },
    { icon: Brain, label: 'Meditate', view: AppView.MUSIC, color: 'bg-indigo-500' },
    { icon: BookHeart, label: 'Journal', view: AppView.JOURNAL, color: 'bg-rose-500' },
    { icon: Moon, label: 'Sleep', view: AppView.SLEEP, color: 'bg-blue-600' },
    { icon: Compass, label: 'Journey', view: AppView.ACTIVITY, color: 'bg-amber-500' },
  ];

  const BetaBadge = () => (
    <span className="px-2 py-0.5 bg-teal-500/20 text-teal-400 label-caps rounded-md border border-teal-500/30 ml-2">BETA</span>
  );

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-100 z-[70] flex items-center justify-between px-6 shadow-sm">
        <button 
          onClick={() => setView(AppView.DASHBOARD)}
          className="flex items-center gap-2 outline-none active:scale-95 transition-transform"
        >
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white shadow-md">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="3" fill="white" />
            </svg>
          </div>
          <span className="font-black text-slate-900 tracking-tight text-xl font-display">Sanctuary</span>
          <span className="px-1.5 py-0.5 bg-teal-100 text-teal-700 label-caps rounded-md border border-teal-200" style={{fontSize: '6px'}}>BETA</span>
        </button>
        <button 
          onClick={onLogout}
          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 active:scale-90 transition-all rounded-full bg-slate-50 border border-slate-100"
          title="Log out"
        >
          <LogOut size={18} />
        </button>
      </header>

      <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-[260px] bg-[#0b1d2e] z-[70] flex-col py-10 shadow-2xl border-r border-white/5">
        <button 
          onClick={() => setView(AppView.DASHBOARD)}
          className="px-8 mb-12 flex items-center gap-3 group outline-none"
        >
          <div className="relative w-10 h-10 flex-shrink-0 group-hover:scale-110 transition-transform">
             <div className="absolute inset-0 bg-teal-500 rounded-full opacity-20 animate-pulse"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12" stroke="#2dd4bf" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="12" cy="12" r="3" fill="#2dd4bf" />
                </svg>
             </div>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white font-display group-hover:text-teal-400 transition-colors">
              Sanctuary
            </h1>
            <BetaBadge />
          </div>
        </button>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <DesktopNavItem key={item.label} item={item} activeView={activeView} setView={setView} />
          ))}
        </nav>

        <div className="px-6 space-y-4 pt-10 border-t border-white/10 mt-auto">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-2 py-3 text-slate-400 hover:text-red-400 transition-colors font-display"
          >
            <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
              <LogOut size={18} />
            </div>
            <span className="text-lg font-medium">Log out</span>
          </button>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[70] bg-[#0b1d2e]/95 backdrop-blur-xl border-t border-white/10 px-2 flex justify-around items-center h-20 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
        {navItems.map((item) => (
          <MobileNavItem key={item.label} item={item} activeView={activeView} setView={setView} />
        ))}
      </nav>
    </>
  );
};

export default Navigation;
