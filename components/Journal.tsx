
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { JournalEntry, AppView, UserProfile } from '../types';
import { 
  Mic, Square, Sparkles, Send, Quote, Heart, MessageCircle, 
  Loader2, Trash2, Calendar, CheckCircle2, ChevronLeft, ChevronRight, 
  Download, Eraser, AlertCircle
} from 'lucide-react';
import { analyzeGratitudeJournal } from '../services/geminiService';
// Fix: LiveVoiceSession is a default export, not a named export
import LiveVoiceSession from './LiveVoiceSession';

interface Props {
  entries: JournalEntry[];
  setEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  setView: (view: AppView) => void;
  user: UserProfile | null;
}

const DRAFT_STORAGE_KEY = 'sanctuary_journal_draft';

const Journal: React.FC<Props> = ({ entries, setEntries, setView, user }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textEntry, setTextEntry] = useState(() => localStorage.getItem(DRAFT_STORAGE_KEY) || '');
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [showLiveSession, setShowLiveSession] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    localStorage.setItem(DRAFT_STORAGE_KEY, textEntry);
    setLastSaved(textEntry.trim() ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null);
  }, [textEntry]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition && !recognitionRef.current) {
      try {
        const recognizer = new SpeechRecognition();
        recognizer.continuous = true;
        recognizer.interimResults = true;
        recognizer.lang = 'en-US';
        recognizer.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
          }
          if (finalTranscript) {
            setTextEntry(prev => {
              const separator = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
              return prev + separator + finalTranscript;
            });
          }
        };
        recognizer.onend = () => setIsRecording(false);
        recognizer.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsRecording(false);
        };
        recognitionRef.current = recognizer;
      } catch (e) {
        console.error("Failed to initialize SpeechRecognition:", e);
      }
    }
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  const handleVoiceToggle = () => {
    if (!recognitionRef.current) {
      setAiFeedback("Speech recognition is not supported in this browser.");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        setAiFeedback("Sanctuary is listening...");
      } catch (err) { 
        console.error("Recognition start error", err);
        setIsRecording(false);
      }
    }
  };

  const handleTextSubmit = async () => {
    if (!textEntry.trim() || isProcessing) return;
    setIsProcessing(true);
    setAiFeedback("Analyzing your reflection..."); // Show processing message
    
    let aiResponseForEntry: string = "I've saved your reflection in your sanctuary. It's a beautiful step toward peace.";
    let displayFeedback: string = "I've saved your reflection in your sanctuary. It's a beautiful step toward peace.";

    try {
      const response = await analyzeGratitudeJournal(textEntry);
      if (response.success) {
        aiResponseForEntry = response.message;
        displayFeedback = response.message;
      } else {
        // AI analysis failed, use the error message as display feedback but save a default positive message
        displayFeedback = response.message; // Display the error message to the user
        aiResponseForEntry = "Sanctuary could not generate a personalized reflection at this time, but your entry is saved.";
      }
    } catch (e) {
      console.error("Unexpected error during AI analysis:", e);
      displayFeedback = "An unexpected error occurred. Your reflection is safe, please try again later.";
      aiResponseForEntry = "Sanctuary could not generate a personalized reflection at this time, but your entry is saved.";
    } finally {
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        type: isRecording ? 'voice' : 'text', // Assuming textEntry is the source
        transcript: textEntry,
        aiResponse: aiResponseForEntry // Save the appropriate AI response
      };
      
      setEntries(prev => [newEntry, ...prev]);
      setAiFeedback(displayFeedback); // Display dynamic feedback
      setTextEntry('');
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      setIsProcessing(false);
    }
  };

  const exportJournal = () => {
    if (entries.length === 0) return;
    const content = entries.map(e => `[${e.date}] (${e.type})\nReflection: ${e.transcript}\nSanctuary: ${e.aiResponse}\n\n-------------------\n\n`).join('');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sanctuary_Journal_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearAllEntries = () => {
    setEntries([]);
    setShowClearConfirm(false);
    setAiFeedback("Your history has been cleared. A fresh start.");
  };

  return (
    <div className="space-y-8 md:space-y-16 animate-in slide-in-from-right-8 duration-700 max-w-6xl mx-auto pb-20 px-2 sm:px-0">
      <div className="flex flex-col items-center gap-6">
        <button 
          onClick={() => setView(AppView.DASHBOARD)} 
          className="flex items-center gap-2 px-5 py-2.5 bg-white/40 dark:bg-slate-100/50 hover:bg-white/80 dark:hover:bg-slate-200/80 backdrop-blur-md rounded-full border border-teal-100/30 dark:border-teal-100/30 text-teal-800 dark:text-teal-800 outline-none shadow-sm group hover:scale-105 active:scale-95 transition-all"
          aria-label="Back to dashboard"
        >
          <ChevronLeft size={16} className="group-hover:translate-x-[-2px] transition-transform" /> 
          <span className="label-caps">Back to Sanctuary</span>
        </button>
        <div className="text-center space-y-3 md:space-y-4 max-w-2xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-3">
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 dark:text-slate-900 tracking-tighter leading-tight transition-colors duration-300">Your Reflections</h2>
            <span className="px-3 py-1 bg-rose-50 dark:bg-rose-100/30 text-rose-600 dark:text-rose-600 text-[10px] font-black tracking-[0.2em] rounded-full border border-rose-100 dark:border-rose-100 uppercase shadow-sm">BETA</span>
          </div>
          <p className="text-lg md:text-2xl text-slate-500 dark:text-slate-700 font-bold italic leading-relaxed transition-colors duration-300">Release the workday. Your history is a record of resilience.</p>
        </div>
      </div>

      <div className="glass-card p-6 sm:p-10 md:p-16 rounded-[2.5rem] md:rounded-[4.5rem] relative shadow-2xl border-none ring-1 ring-teal-500/10 dark:ring-teal-500/10 space-y-8 md:space-y-10">
        <div className="relative">
          <Quote className="absolute -top-6 -left-6 md:-top-10 md:-left-10 text-teal-600/10 dark:text-teal-600/20 w-24 h-24 md:w-[180px] md:h-[180px]" />
          <textarea 
            className="w-full h-48 md:h-72 p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] bg-white/50 dark:bg-slate-100/50 text-xl md:text-4xl font-medium italic text-slate-900 dark:text-slate-900 outline-none ring-2 ring-transparent focus:ring-teal-500/10 dark:focus:ring-teal-500/10 placeholder:text-slate-300 dark:placeholder:text-slate-400 resize-none transition-all leading-relaxed shadow-inner" 
            placeholder="Today, I am feeling..." 
            value={textEntry} 
            onChange={(e) => setTextEntry(e.target.value)}
            aria-label="Journal entry text"
          />
          <div className="absolute top-4 right-5 md:top-8 md:right-10 flex items-center gap-2">
            {lastSaved && <div className="flex items-center gap-1.5 px-4 py-2 bg-white/90 dark:bg-white/90 backdrop-blur-md rounded-full border border-teal-100/50 dark:border-teal-100/50 text-[10px] font-black text-teal-800 dark:text-teal-800 uppercase tracking-widest shadow-sm"><CheckCircle2 size={12} className="text-teal-600 dark:text-teal-600" /> <span className="hidden sm:inline">Saved at</span> {lastSaved}</div>}
          </div>
          {isRecording && <div className="absolute bottom-5 right-5 md:bottom-10 md:right-12 flex items-center gap-3 text-red-600 dark:text-red-700 font-black uppercase text-xs md:text-base tracking-[0.2em] animate-pulse bg-white/95 dark:bg-white/90 px-6 py-3 rounded-full shadow-xl border border-red-100 dark:border-red-100"><div className="w-3 h-3 bg-red-600 rounded-full"></div>Sanctuary Listening</div>}
        </div>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-10">
          <div className="flex gap-4 w-full lg:w-auto items-center">
             <button 
                onClick={() => setShowLiveSession(true)} 
                className="flex-1 sm:flex-none h-16 md:h-24 px-6 md:px-10 rounded-2xl md:rounded-[2.5rem] bg-teal-900 text-white flex items-center gap-4 transition-all active:scale-95 group shadow-2xl shadow-teal-100/20 dark:shadow-teal-100/20"
                aria-label="Start live AI voice session"
              >
              <MessageCircle size={24} className="md:w-8 md:h-8 group-hover:rotate-12 transition-transform" />
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Conversation</p>
                <p className="text-sm md:text-xl font-black tracking-tight">Live Session</p>
              </div>
            </button>
            <button 
              onClick={handleVoiceToggle} 
              disabled={isProcessing} 
              className={`flex-1 sm:flex-none h-16 md:h-24 px-6 md:px-10 rounded-2xl md:rounded-[2.5rem] flex items-center gap-4 transition-all relative ${isRecording ? 'bg-red-600 text-white shadow-2xl shadow-red-500/20' : 'bg-slate-100 dark:bg-slate-100 text-slate-800 dark:text-slate-800 hover:bg-slate-200 dark:hover:bg-slate-200'} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label={isRecording ? "Stop voice dictation" : "Start quick voice note"}
            >
              {isRecording ? <Square size={20} /> : <Mic size={20} />}
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Dictation</p>
                <p className="text-sm md:text-xl font-black tracking-tight">{isRecording ? 'Finish' : 'Quick Note'}</p>
              </div>
            </button>
          </div>
          <button 
            onClick={handleTextSubmit} 
            disabled={isProcessing || !textEntry || isRecording} 
            className="w-full lg:w-auto px-12 md:px-20 py-5 md:py-8 bg-slate-900 dark:bg-slate-900 text-white font-black rounded-2xl md:rounded-[2.5rem] hover:bg-black dark:hover:bg-black disabled:opacity-30 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-4"
            aria-label="Save Reflection"
          >
            {isProcessing ? <Loader2 className="animate-spin md:w-8 md:h-8" /> : <Send className="md:w-8 md:h-8" />} {isProcessing ? 'Processing...' : 'Save Reflection'}
          </button>
        </div>
        {aiFeedback && <div className={`p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border transition-all duration-700 animate-in fade-in zoom-in-95 shadow-lg ${isRecording ? 'bg-red-50 dark:bg-red-50 border-red-100 dark:border-red-100' : 'bg-teal-50 dark:bg-teal-50 border-teal-100 dark:border-teal-100'}`}><div className="flex items-start gap-6 md:gap-10"><div className={`w-12 h-12 md:w-20 md:h-20 bg-white dark:bg-white rounded-2xl md:rounded-3xl flex items-center justify-center shadow-xl flex-shrink-0 ${isRecording ? 'text-red-600' : 'text-teal-700'}`}>{isRecording ? <Mic size={24} className="animate-pulse" /> : <Heart size={28} fill="currentColor" />}</div><p className={`text-lg sm:text-2xl md:text-4xl font-bold italic leading-[1.3] text-balance ${isRecording ? 'text-red-900 dark:text-red-900' : 'text-teal-900 dark:text-teal-900'}`}>"{aiFeedback}"</p></div></div>}
      </div>

      <div className="space-y-10 px-2 md:px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b-2 border-slate-100 dark:border-slate-200 pb-6 md:pb-10 gap-6">
          <div className="space-y-2">
             <h3 className="text-2xl md:text-5xl font-black text-slate-900 dark:text-slate-900 tracking-tighter flex items-center gap-4"><Calendar className="text-teal-600 dark:text-teal-700 md:w-10 md:h-10" /> Your History</h3>
             <div className="flex items-center gap-3">
               <span className="px-3 py-1 bg-teal-50 dark:bg-teal-100/30 text-teal-700 dark:text-teal-700 text-[10px] font-black tracking-widest rounded-full border border-teal-100 dark:border-teal-100 uppercase">{entries.length} Sessions Logged</span>
               <p className="text-slate-400 dark:text-slate-700 font-bold text-xs">All reflections are encrypted and saved locally.</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
               onClick={exportJournal} 
               disabled={entries.length === 0}
               className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-white border border-slate-200 dark:border-slate-200 text-slate-700 dark:text-slate-700 font-black label-caps rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-50 transition-all disabled:opacity-30 shadow-sm"
               aria-label="Export journal history"
             >
               <Download size={14} /> Export History
             </button>
             <button 
               onClick={() => setShowClearConfirm(true)} 
               disabled={entries.length === 0}
               className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-white border border-rose-100 dark:border-rose-100 text-rose-600 dark:text-rose-600 font-black label-caps rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-50 transition-all disabled:opacity-30 shadow-sm"
               aria-label="Reset all journal entries"
             >
               <Eraser size={14} /> Reset
             </button>
          </div>
        </div>

        {showClearConfirm && (
          <div className="p-8 bg-rose-50 dark:bg-rose-50 rounded-[2.5rem] border-2 border-rose-100 dark:border-rose-100 animate-in zoom-in-95 duration-300 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="flex items-center gap-4">
                <AlertCircle className="text-rose-600 dark:text-rose-600 w-10 h-10" />
                <div>
                   <p className="text-xl font-black text-rose-900 dark:text-rose-900">Are you absolutely sure?</p>
                   <p className="text-rose-700 dark:text-rose-700 font-medium italic">This will permanently delete all your reflections and cannot be undone.</p>
                </div>
             </div>
             <div className="flex items-center gap-3 w-full md:w-auto">
                <button onClick={() => setShowClearConfirm(false)} className="flex-1 md:flex-none px-8 py-3 bg-white dark:bg-white text-slate-600 dark:text-slate-600 font-black label-caps rounded-xl border border-slate-200 dark:border-slate-200"
                aria-label="Cancel deletion"
                >Cancel</button>
                <button onClick={clearAllEntries} className="flex-1 md:flex-none px-8 py-3 bg-rose-600 text-white font-black label-caps rounded-xl shadow-lg shadow-rose-200 dark:shadow-rose-900/30"
                aria-label="Confirm permanent deletion"
                >Delete Forever</button>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {entries.length === 0 ? (
            <div className="col-span-full py-24 text-center glass-card rounded-[3rem] md:rounded-[4rem] border-dashed border-4 border-slate-100 dark:border-slate-100 px-10">
              <Quote size={64} className="mx-auto text-slate-100 dark:text-slate-300 mb-8 opacity-50" />
              <p className="text-xl md:text-3xl text-slate-300 dark:text-slate-500 font-bold italic tracking-tight">Your mindful history begins with your first reflection.</p>
            </div>
          ) : entries.map(entry => (
              <div key={entry.id} className="glass-card p-8 md:p-14 rounded-[2.5rem] md:rounded-[4rem] space-y-6 md:space-y-8 hover:shadow-2xl hover:shadow-rose-500/20 transition-all group border-none relative overflow-hidden ring-1 ring-slate-100/50 dark:ring-slate-100/50">
                <div className="absolute top-4 right-4 md:top-8 md:right-8 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEntries(prev => prev.filter(e => e.id !== entry.id))} className="p-3 text-red-200 hover:text-red-600 transition-colors" aria-label="Delete entry">
                    <Trash2 size={24} />
                  </button>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="px-4 py-1.5 bg-slate-50 dark:bg-slate-100 text-[10px] md:text-xs font-black text-slate-500 dark:text-slate-600 rounded-full uppercase tracking-[0.25em] border border-slate-100 dark:border-slate-200">{entry.date}</span>
                  <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest border ${entry.type === 'live' ? 'bg-teal-50 dark:bg-teal-50 text-teal-700 dark:text-teal-700 border-teal-100 dark:border-teal-100' : entry.type === 'voice' ? 'bg-blue-50 dark:bg-blue-50 text-blue-700 dark:text-blue-700 border-blue-100 dark:border-blue-100' : 'bg-slate-50 dark:bg-slate-100 text-slate-600 dark:text-slate-600 border-slate-100 dark:border-slate-200'}`}>
                    {entry.type === 'live' ? <Sparkles size={12}/> : entry.type === 'voice' ? <Mic size={12}/> : <Send size={12}/>} {entry.type} Mode
                  </div>
                </div>
                <p className="text-xl sm:text-2xl md:text-3xl font-medium text-slate-900 dark:text-slate-900 italic leading-[1.3] whitespace-pre-wrap line-clamp-4 tracking-tight">"{entry.transcript}"</p>
                {entry.aiResponse && (
                  <div className="pt-6 md:pt-10 border-t border-slate-100 dark:border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 text-teal-700 dark:text-teal-700 font-black label-caps">
                      <Sparkles size={14} /> Sanctuary Reflection
                    </div>
                    <p className="text-base md:text-2xl text-slate-600 dark:text-slate-700 font-bold italic leading-relaxed text-balance">"{entry.aiResponse}"</p>
                  </div>
                )}
              </div>
          ))}
        </div>
      </div>
      {showLiveSession && <LiveVoiceSession userName={user?.name || "there"} onClose={() => setShowLiveSession(false)} onSave={(t) => {
        setEntries(prev => [{ id: Date.now().toString(), date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), type: 'live', transcript: t, aiResponse: "Saved conversation summary from our live session." }, ...prev]);
        setShowLiveSession(false);
      }} />}
    </div>
  );
};

export default Journal;
