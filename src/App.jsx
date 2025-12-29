import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] font-sans flex flex-col items-center justify-center p-6">
      
      {/* Main Glass Card */}
      <div className="max-w-md w-full bg-white/90 backdrop-blur-xl border border-teal-100 shadow-2xl rounded-3xl overflow-hidden p-8 text-center relative">
        
        {/* Decorative Circle */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-teal-100 rounded-full blur-2xl opacity-50"></div>

        {/* Header */}
        <h1 className="relative text-4xl font-bold text-teal-700 mb-2 font-display tracking-tight">
          Sanctuary
        </h1>
        <p className="relative text-slate-500 text-lg mb-8 font-light">
          Your space for peace.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4 relative z-10">
          <button className="w-full bg-gradient-to-r from-teal-600 to-sky-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-teal-500/20 hover:scale-[1.02] hover:shadow-teal-500/30 transition-all duration-300">
            Begin Meditation
          </button>
          
          <button className="w-full bg-white border border-slate-200 text-slate-600 font-medium py-4 rounded-xl hover:bg-slate-50 transition-all duration-300">
            Daily Journal
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">
            Mindfulness Loaded
          </p>
        </div>
      </div>

    </div>
  );
}

export default App;
