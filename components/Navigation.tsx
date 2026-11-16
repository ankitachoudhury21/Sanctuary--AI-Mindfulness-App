import React from 'react';
import { AppView } from '../types';
import { Home, BookHeart, LogOut, Headphones, Sparkles, Sun, CloudMoon } from 'lucide-react';

interface Props {
  activeView: AppView;
  setView: (view: AppView) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const DesktopNavItem: React.FC<{ item: any; activeView: AppView; setView: (view: AppView) => void }> = React.memo(({ item, activeView, setView }) => {
  const isActive = activeView === item.view;
  const Icon = item.icon;
  return (
    <button
      onClick={() => setView(item.view)}
      className={`
        w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors duration-200 outline-none min-h-[44px] relative group
        ${isActive
          ? 'bg-white/[0.09] text-white font-semibold'
          : 'text-slate-400 font-medium hover:text-slate-100 hover:bg-white/[0.04]'}
      `}
      aria-label={`Navigate to ${item.label}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {isActive && (
        <span className="absolute left-0 top-2.5 bottom-2.5 w-0.5 rounded-full bg-teal-400" aria-hidden="true" />
      )}
      <Icon
        size={18}
        className={`flex-shrink-0 transition-colors ${isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'}`}
      />
      <span className="text-sm leading-tight truncate whitespace-nowrap">
        {item.label}
      </span>
    </button>
  );
});

const MobileNavItem: React.FC<{ item: any; activeView: AppView; setView: (view: AppView) => void }> = React.memo(({ item, activeView, setView }) => {
  const isActive = activeView === item.view;
  const Icon = item.icon;
  return (
    <button
      onClick={() => setView(item.view)}
      className="flex flex-col items-center justify-center flex-1 min-w-0 min-h-[44px] py-1.5 px-1 gap-1 outline-none transition-colors active:opacity-70"
      aria-label={`Navigate to ${item.label}`}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon
        size={19}
        className={`transition-colors ${isActive ? 'text-teal-400' : 'text-slate-400'}`}
      />
      <span className={`text-[10px] font-medium tracking-tight truncate w-full text-center leading-tight ${isActive ? 'text-white' : 'text-slate-400'}`}>
        {item.shortLabel}
      </span>
    </button>
  );
});

const Navigation: React.FC<Props> = React.memo(({ activeView, setView, onLogout, isDarkMode, toggleDarkMode }) => {
  const navItems = [
    { icon: Home, label: 'Dashboard', shortLabel: 'Home', view: AppView.DASHBOARD },
    { icon: Headphones, label: 'Meditation', shortLabel: 'Meditate', view: AppView.MUSIC },
    { icon: Sparkles, label: 'Celestial Audio', shortLabel: 'Cosmos', view: AppView.PLANETARY },
    { icon: BookHeart, label: 'Gratitude', shortLabel: 'Journal', view: AppView.JOURNAL },
  ];

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#F5F4EF]/90 dark:bg-[#0C1117]/95 backdrop-blur-xl border-b border-slate-900/10 dark:border-white/[0.08] z-[70] flex items-center justify-between px-4 sm:px-6 transition-colors duration-300">
        <button
          onClick={() => setView(AppView.DASHBOARD)}
          className="flex items-center gap-2.5 outline-none min-h-[44px] whitespace-nowrap shrink-0"
          aria-label="Go to Dashboard"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-teal-800 dark:text-teal-400 flex-shrink-0">
            <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="2.75" fill="currentColor" />
          </svg>
          <span className="font-editorial font-medium text-slate-900 dark:text-white tracking-tight text-xl">
            Sanctuary
          </span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl border border-slate-900/10 dark:border-white/10 bg-white/80 dark:bg-white/[0.05] text-slate-700 dark:text-amber-300 transition-colors"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <Sun size={17} /> : <CloudMoon size={17} />}
          </button>
          <button
            onClick={onLogout}
            className="w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl border border-slate-900/10 dark:border-white/10 bg-white/80 dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={17} />
          </button>
        </div>
      </header>

      {/* Desktop & Tablet Sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 bottom-0 w-[232px] lg:w-[256px] bg-[#0C1117] z-[70] flex-col py-7 px-4 border-r border-white/[0.08] overflow-y-auto">
        <button
          onClick={() => setView(AppView.DASHBOARD)}
          className="px-3.5 mb-8 flex items-center gap-3 group outline-none text-left flex-shrink-0 whitespace-nowrap"
          aria-label="Go to Dashboard"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-teal-400 flex-shrink-0">
            <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="2.75" fill="currentColor" />
          </svg>
          <span className="font-editorial text-2xl font-normal tracking-tight text-white group-hover:text-teal-300 transition-colors">
            Sanctuary
          </span>
        </button>

        <nav className="flex-1 space-y-1" aria-label="Primary Navigation">
          {navItems.map((item) => (
            <DesktopNavItem key={item.view} item={item} activeView={activeView} setView={setView} />
          ))}
        </nav>

        <div className="pt-5 border-t border-white/[0.08] mt-6 space-y-1 flex-shrink-0">
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.05] transition-colors min-h-[44px] text-sm font-medium"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span className="flex items-center gap-3">
              {isDarkMode ? <Sun size={17} className="text-amber-300" /> : <CloudMoon size={17} className="text-slate-400" />}
              <span>Appearance</span>
            </span>
            <span className="text-xs text-slate-400">{isDarkMode ? 'Dark' : 'Light'}</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-white/[0.04] transition-colors min-h-[44px] text-sm font-medium"
            aria-label="Sign out of Sanctuary"
          >
            <LogOut size={17} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[70] bg-[#0C1117]/95 backdrop-blur-xl border-t border-white/10 px-2 flex justify-around items-center h-16 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.25)]" aria-label="Mobile Navigation">
        {navItems.map((item) => (
          <MobileNavItem key={item.view} item={item} activeView={activeView} setView={setView} />
        ))}
      </nav>
    </>
  );
});

export default Navigation;