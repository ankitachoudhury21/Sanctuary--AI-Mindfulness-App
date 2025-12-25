
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { JournalEntry, AppView } from '../types';
import { Mic, Square, Sparkles, Send, Quote, Heart, MessageSquare, Loader2, Trash2, Calendar, CheckCircle2, ChevronLeft } from 'lucide-react';
import { analyzeGratitudeJournal } from '../services/geminiService';
import LiveVoiceSession from './LiveVoiceSession';

interface Props {
  entries: JournalEntry[];
  setEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  setView: (view: AppView) => void;
}

const DRAFT_STORAGE_KEY = 'sanctuary_journal_draft';

const Journal: React.FC<Props> = ({ entries, setEntries, setView }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textEntry, setTextEntry] = useState(() => localStorage.getItem(DRAFT_STORAGE_KEY) || '');
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [showLiveSession, setShowLiveSession] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
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
    setAiFeedback("Analyzing your reflection...");
    try {
      const response = await analyzeGratitudeJournal(textEntry);
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        type: isRecording ? 'voice' : 'text',
        transcript: textEntry,
        aiResponse: response
      };
      setEntries(prev => [newEntry, ...prev]);
      setAiFeedback(response);
      setTextEntry('');
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {
      setAiFeedback("Reflection saved locally.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 md:space-y-16 animate-in slide-in-from-right-8 duration-700 max-w-6xl mx-auto pb-20 px-1 sm:px-0">
      <div className="flex flex-col items-center gap-6">
        <button onClick={() => setView(AppView.DASHBOARD)} className="flex items-center gap-2 text-teal-700 font-black uppercase tracking-[0.2em] text-xs hover:gap-3 transition-all outline-none"><ChevronLeft size={16} /> Back to Sanctuary</button>
        <div className="text-center space-y-3 md:space-y-4 max-w-2xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-3">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">Your Reflections</h2>
            <span className="px-3 py-1 bg-rose-100 text-rose-600 text-xs font-black tracking-widest rounded-full border border-rose-200 uppercase">BETA</span>
          </div>
          <p className="text-base md:text-xl text-slate-600 font-medium italic leading-relaxed">Record your thoughts, release your stress.</p>
        </div>
      </div>

      <div className="glass-card p-5 sm:p-10 md:p-14 rounded-[2rem] md:rounded-[4rem] relative shadow-xl md:shadow-2xl space-y-6 md:space-y-8 border-none ring-1 ring-teal-500/10">
        <div className="relative">
          <Quote className="absolute -top-4 -left-4 md:-top-6 md:-left-6 text-teal-600/10 w-16 h-16 md:w-[150px] md:h-[150px]" />
          <textarea className="w-full h-40 md:h-64 p-5 md:p-10 rounded-[1.5rem] md:rounded-[3rem] bg-white/40 text-lg md:text-3xl font-medium italic text-slate-900 outline-none ring-2 ring-transparent focus:ring-teal-500/20 placeholder:text-slate-400 resize-none transition-all leading-relaxed" placeholder="Today, I am breathing through..." value={textEntry} onChange={(e) => setTextEntry(e.target.value)} />
          <div className="absolute top-3 right-4 md:top-4 md:right-8 flex items-center gap-2">
            {lastSaved && <div className="flex items-center gap-1.5 px-3 py-1 md:px-4 md:py-1.5 bg-white/80 backdrop-blur-md rounded-full border border-teal-100/50 text-[9px] md:text-[10px] font-black text-teal-800 uppercase tracking-widest"><CheckCircle2 size={10} className="text-teal-600" /> <span className="hidden sm:inline">Draft</span> saved {lastSaved}</div>}
          </div>
          {isRecording && <div className="absolute bottom-4 right-4 md:bottom-8 md:right-10 flex items-center gap-2 md:gap-3 text-red-600 font-black uppercase text-[10px] md:text-sm tracking-widest animate-pulse bg-white/95 px-4 py-2 md:px-6 md:py-3 rounded-full shadow-lg border border-red-100"><div className="w-2 h-2 md:w-3 md:h-3 bg-red-600 rounded-full"></div>Live Dictation</div>}
        </div>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 md:gap-8">
          <div className="flex gap-3 md:gap-4 w-full lg:w-auto items-center">
             <button onClick={() => setShowLiveSession(true)} className="flex-1 sm:flex-none h-14 md:h-20 px-4 md:px-8 rounded-xl md:rounded-[2rem] bg-teal-800 text-white flex items-center gap-3 md:gap-4 transition-all active:scale-95 group shadow-lg">
              <MessageSquare size={20} className="md:w-7 md:h-7 group-hover:rotate-12 transition-transform" />
              <div className="text-left">
                <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-70">Conversation</p>
                <p className="text-xs md:text-base font-bold">Live Session</p>
              </div>
            </button>
            <button onClick={handleVoiceToggle} disabled={isProcessing} className={`flex-1 sm:flex-none h-14 md:h-20 px-4 md:px-8 rounded-xl md:rounded-[2rem] flex items-center gap-3 md:gap-4 transition-all relative ${isRecording ? 'bg-red-600 text-white shadow-xl' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {isRecording ? <Square size={18} /> : <Mic size={18} />}
              <div className="text-left">
                <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-70">Dictation</p>
                <p className="text-xs md:text-base font-bold">{isRecording ? 'Stop' : 'Quick Note'}</p>
              </div>
            </button>
          </div>
          <button onClick={handleTextSubmit} disabled={isProcessing || !textEntry || isRecording} className="w-full lg:w-auto px-10 md:px-16 py-4 md:py-6 bg-slate-900 text-white text-lg md:text-2xl font-black rounded-xl md:rounded-[2rem] hover:bg-black disabled:opacity-30 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 md:gap-4">{isProcessing ? <Loader2 className="animate-spin" /> : <Send />} {isProcessing ? 'Saving...' : 'Save Reflection'}</button>
        </div>
        {aiFeedback && <div className={`p-6 md:p-8 rounded-[1.5rem] md:rounded-[3rem] border transition-all duration-500 animate-in fade-in zoom-in-95 ${isRecording ? 'bg-red-50 border-red-100' : 'bg-teal-50 border-teal-100'}`}><div className="flex items-start gap-4 md:gap-6"><div className={`w-10 h-10 md:w-14 md:h-14 bg-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-md flex-shrink-0 ${isRecording ? 'text-red-600' : 'text-teal-700'}`}>{isRecording ? <Mic size={20} className="animate-pulse" /> : <Heart size={20} fill="currentColor" />}</div><p className={`text-sm sm:text-base md:text-2xl font-bold italic leading-relaxed ${isRecording ? 'text-red-900' : 'text-teal-900'}`}>"{aiFeedback}"</p></div></div>}
      </div>

      <div className="space-y-8 px-2 md:px-4">
        <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4 md:pb-6">
          <h3 className="text-xl md:text-3xl font-black text-slate-900 flex items-center gap-3"><Calendar className="text-teal-600" /> Your History</h3>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] md:text-sm">{entries.length} Sessions</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
          {entries.length === 0 ? (
            <div className="col-span-full py-16 text-center glass-card rounded-[2rem] md:rounded-[3rem] border-dashed border-2 border-slate-200 px-6"><Quote size={48} className="mx-auto text-slate-200 mb-6 opacity-50" /><p className="text-lg md:text-2xl text-slate-400 font-bold italic">The history of your peace begins here.</p></div>
          ) : entries.map(entry => (
              <div key={entry.id} className="glass-card p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] space-y-4 md:space-y-6 hover:shadow-2xl transition-all group border-none relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => setEntries(prev => prev.filter(e => e.id !== entry.id))} className="p-2 text-red-200 hover:text-red-600 transition-colors"><Trash2 size={20} /></button></div>
                <div className="flex justify-between items-center mb-2"><span className="px-3 py-1 bg-slate-100 text-[9px] md:text-[11px] font-black text-slate-600 rounded-full uppercase tracking-[0.2em]">{entry.date}</span><div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest ${entry.type === 'live' ? 'bg-teal-100 text-teal-800' : entry.type === 'voice' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>{entry.type === 'live' ? <Sparkles size={10}/> : entry.type === 'voice' ? <Mic size={10}/> : <Send size={10}/>} {entry.type}</div></div>
                <p className="text-base sm:text-xl md:text-2xl font-medium text-slate-900 italic leading-snug whitespace-pre-wrap line-clamp-3 md:line-clamp-4">"{entry.transcript}"</p>
                {entry.aiResponse && <div className="pt-4 md:pt-8 border-t border-slate-100 space-y-2"><div className="flex items-center gap-1.5 text-teal-700 font-black text-[9px] md:text-xs uppercase tracking-widest"><Sparkles size={12} /> Sanctuary Companion</div><p className="text-sm md:text-lg text-slate-700 font-bold italic leading-relaxed">{entry.aiResponse}</p></div>}
              </div>
          ))}
        </div>
      </div>
      {showLiveSession && <LiveVoiceSession userName="there" onClose={() => setShowLiveSession(false)} onSave={(t) => {
        setEntries(prev => [{ id: Date.now().toString(), date: new Date().toLocaleDateString(), type: 'live', transcript: t, aiResponse: "Saved conversation." }, ...prev]);
        setShowLiveSession(false);
      }} />}
    </div>
  );
};

export default Journal;
