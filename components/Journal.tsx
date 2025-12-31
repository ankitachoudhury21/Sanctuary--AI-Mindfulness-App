
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { JournalEntry, AppView, UserProfile } from '../types';
import { 
  Mic, Square, Sparkles, Send, Quote, Heart, 
  Loader2, Trash2, Calendar, CheckCircle2, ChevronLeft,
  Download, Eraser, AlertCircle, BrainCircuit
} from 'lucide-react';
import { analyzeGratitudeJournal } from '../services/geminiService';

interface Props {
  entries: JournalEntry[];
  setEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  setView: (view: AppView) => void;
  user: UserProfile | null;
}

const DRAFT_STORAGE_KEY = 'sanctuary_journal_draft';

const Journal: React.FC<Props> = React.memo(({ entries, setEntries, setView, user }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textEntry, setTextEntry] = useState(() => localStorage.getItem(DRAFT_STORAGE_KEY) || '');
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const textEntryRef = useRef(textEntry);

  // Mindfulness "Nudges" based on character count to feel responsive
  const getNudge = () => {
    if (textEntry.length === 0) return "Start with one small thing...";
    if (textEntry.length < 20) return "Keep breathing as you write.";
    if (textEntry.length < 100) return "Acknowledge the peace in this moment.";
    return "Your clarity is growing.";
  };

  useEffect(() => {
    textEntryRef.current = textEntry;
    localStorage.setItem(DRAFT_STORAGE_KEY, textEntry);
    if (textEntry.trim()) {
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } else {
      setLastSaved(null);
    }
  }, [textEntry]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
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
            const sep = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
            return prev + sep + finalTranscript;
          });
        }
      };

      recognizer.onstart = () => setIsRecording(true);
      recognizer.onend = () => setIsRecording(false);
      recognizer.onerror = () => setIsRecording(false);
      recognitionRef.current = recognizer;
    }
  }, []);

  const handleVoiceToggle = useCallback(() => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      try {
        setAiFeedback(null);
        recognitionRef.current.start();
      } catch (err) { console.error(err); }
    }
  }, [isRecording]);

  const handleTextSubmit = useCallback(async () => {
    if (!textEntry.trim() || isProcessing) return;
    
    setIsProcessing(true);
    setAiFeedback(null);
    
    const tempId = Date.now().toString();
    const entryDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    try {
      const result = await analyzeGratitudeJournal(textEntry);
      
      const newEntry: JournalEntry = {
        id: tempId,
        date: entryDate,
        type: 'text',
        transcript: textEntry,
        aiResponse: result.message
      };
      
      setEntries(prev => [newEntry, ...prev]);
      setAiFeedback(result.message);
      setTextEntry('');
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (e) {
      console.error("Submission error:", e);
      setAiFeedback("I've saved your thought, but couldn't generate a reflection right now.");
    } finally {
      setIsProcessing(false);
    }
  }, [textEntry, isProcessing, setEntries]);

  const exportJournal = useCallback(() => {
    if (entries.length === 0) return;
    const content = entries.map(e => `[${e.date}]\nReflection: ${e.transcript}\nInsight: ${e.aiResponse}\n\n`).join('---');
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Sanctuary_Journal_Export.txt`;
    link.click();
  }, [entries]);

  return (
    <div className="space-y-8 md:space-y-12 animate-in slide-in-from-right-8 duration-700 max-w-6xl mx-auto pb-24 px-4 sm:px-0">
      <div className="flex flex-col items-center gap-6">
        <button 
          onClick={() => setView(AppView.DASHBOARD)} 
          className="flex items-center gap-2 px-5 py-2.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full border border-teal-200/50 dark:border-slate-700/50 text-blue-950 dark:text-white outline-none shadow-sm group hover:scale-105 active:scale-95 transition-all"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="label-caps font-black">Back to Sanctuary</span>
        </button>
        
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-4">
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-blue-950 dark:text-white tracking-tighter leading-tight transition-colors duration-300">Journal</h2>
            <div className="px-3 py-1 bg-teal-500/10 text-teal-700 dark:text-teal-400 label-caps rounded-full border border-teal-500/20 text-[10px]">Companion Awake</div>
          </div>
          <p className="text-lg md:text-2xl text-blue-900/70 dark:text-slate-300 font-bold italic leading-relaxed transition-colors duration-300">
            Release the day. Every word is a step toward clarity.
          </p>
        </div>
      </div>

      <div className="glass-card p-6 sm:p-12 md:p-16 rounded-[3rem] md:rounded-[4rem] relative shadow-2xl border-none ring-1 ring-teal-500/10 dark:ring-teal-500/30 space-y-10">
        <div className="relative">
          <Quote className="absolute -top-10 -left-10 text-teal-500/5 dark:text-teal-400/10 w-40 h-40 pointer-events-none" />
          <textarea 
            className="w-full h-48 md:h-80 p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] bg-white/40 dark:bg-slate-900/60 text-xl md:text-3xl font-medium italic text-blue-950 dark:text-white outline-none ring-2 ring-transparent focus:ring-teal-500/10 placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none transition-all leading-relaxed shadow-inner" 
            placeholder="Today, I am grateful for..." 
            value={textEntry} 
            onChange={(e) => setTextEntry(e.target.value)}
          />
          
          <div className="absolute top-6 right-8 flex items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/90 dark:bg-slate-800/90 rounded-full border border-teal-500/20 text-[10px] font-black text-teal-700 dark:text-teal-300 uppercase tracking-widest animate-pulse">
               {getNudge()}
            </div>
          </div>
          
          {isRecording && (
            <div className="absolute bottom-8 right-10 flex items-center gap-3 bg-red-500/10 text-red-700 dark:text-red-400 px-6 py-3 rounded-full border border-red-500/20 animate-pulse">
              <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping"></div>
              <span className="label-caps font-black">Sanctuary is Listening</span>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <button 
            onClick={handleVoiceToggle} 
            disabled={isProcessing} 
            className={`w-full lg:w-auto h-20 md:h-24 px-10 rounded-2xl md:rounded-[2.5rem] flex items-center gap-6 transition-all relative group overflow-hidden ${isRecording ? 'bg-red-600 text-white shadow-2xl' : 'bg-slate-100 dark:bg-slate-800 text-blue-950 dark:text-white'}`}
          >
            {isRecording && <div className="absolute inset-0 bg-white/10 animate-pulse"></div>}
            <div className={`p-4 rounded-2xl ${isRecording ? 'bg-white/20' : 'bg-teal-600 text-white shadow-lg shadow-teal-500/20'}`}>
              {isRecording ? <Square size={20} fill="white" /> : <Mic size={24} />}
            </div>
            <div className="text-left">
              <p className={`label-caps opacity-60 text-[8px] mb-1 ${isRecording ? 'text-white' : ''}`}>Voice Reflection</p>
              <p className="text-lg md:text-xl font-black">{isRecording ? 'Stop Recording' : 'Speak Freely'}</p>
            </div>
          </button>

          <button 
            onClick={handleTextSubmit} 
            disabled={isProcessing || !textEntry.trim() || isRecording} 
            className="w-full lg:w-auto px-16 py-6 md:py-8 bg-blue-950 dark:bg-teal-600 text-white font-black rounded-2xl md:rounded-[2.5rem] hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all shadow-xl flex items-center justify-center gap-4 text-xl"
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : <Send size={24} />}
            {isProcessing ? 'Listening...' : 'Save Reflection'}
          </button>
        </div>

        {aiFeedback && (
          <div className="p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] bg-teal-50/80 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800/50 animate-in zoom-in-95 duration-700 shadow-lg">
            <div className="flex items-start gap-8">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center shadow-xl flex-shrink-0 text-teal-700">
                <BrainCircuit size={28} />
              </div>
              <p className="text-xl md:text-3xl font-bold italic leading-relaxed text-blue-950 dark:text-teal-50 text-balance">
                "{aiFeedback}"
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-8 gap-6">
          <div className="space-y-2">
            <h3 className="text-3xl md:text-5xl font-black text-blue-950 dark:text-white tracking-tight flex items-center gap-4 transition-colors duration-300">
              <Calendar className="text-teal-700" /> Reflection History
            </h3>
            <p className="text-blue-900/60 dark:text-slate-400 font-bold transition-colors duration-300">{entries.length} moments of peace recorded.</p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={exportJournal} disabled={entries.length === 0} className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-950 dark:text-slate-200 font-black label-caps rounded-2xl hover:bg-slate-50 transition-all disabled:opacity-30 shadow-sm">
               <Download size={14} /> Export
             </button>
             <button onClick={() => setShowClearConfirm(true)} disabled={entries.length === 0} className="px-6 py-3 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 font-black label-caps rounded-2xl hover:bg-rose-50 transition-all disabled:opacity-30 shadow-sm">
               <Eraser size={14} /> Reset
             </button>
          </div>
        </div>

        {showClearConfirm && (
          <div className="p-8 bg-rose-50 dark:bg-rose-900/40 rounded-[2.5rem] border border-rose-200 dark:border-rose-800 animate-in zoom-in-95 duration-300 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="flex items-center gap-4">
                <AlertCircle className="text-rose-700 dark:text-rose-400" size={32} />
                <div>
                   <p className="text-xl font-black text-rose-950 dark:text-rose-100">Clear History?</p>
                   <p className="text-rose-800 dark:text-rose-300 font-medium italic">This will permanently delete your journey reflections.</p>
                </div>
             </div>
             <div className="flex gap-3 w-full md:w-auto">
                <button onClick={() => setShowClearConfirm(false)} className="flex-1 px-8 py-3 bg-white dark:bg-slate-800 text-blue-950 dark:text-slate-200 font-black label-caps rounded-xl border border-slate-300 dark:border-slate-700">Cancel</button>
                <button onClick={() => { setEntries([]); setShowClearConfirm(false); setAiFeedback("The slate is clean."); }} className="flex-1 px-8 py-3 bg-rose-700 text-white font-black label-caps rounded-xl shadow-lg">Delete</button>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {entries.length === 0 ? (
            <div className="col-span-full py-24 text-center glass-card rounded-[3rem] border-dashed border-4 border-slate-200 dark:border-slate-800">
              <Quote size={64} className="mx-auto text-slate-200 dark:text-slate-800 mb-8" />
              <p className="text-2xl text-slate-400 dark:text-slate-600 font-bold italic">Your history begins with your first reflection.</p>
            </div>
          ) : entries.map(entry => (
            <div key={entry.id} className="glass-card p-10 md:p-12 rounded-[3rem] space-y-8 hover:shadow-2xl transition-all group border-none ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden relative">
              <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEntries(prev => prev.filter(e => e.id !== entry.id))} className="text-slate-400 hover:text-red-600 transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-[10px] font-black text-blue-800 dark:text-blue-300 rounded-full uppercase tracking-widest">{entry.date}</span>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-teal-700 dark:text-teal-400 tracking-widest">
                  <Sparkles size={12} /> Insight Captured
                </div>
              </div>
              
              <p className="text-2xl md:text-3xl font-medium text-blue-950 dark:text-white italic leading-relaxed tracking-tight transition-colors duration-300">
                "{entry.transcript}"
              </p>
              
              {entry.aiResponse && (
                <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-black label-caps">
                    <Heart size={14} fill="currentColor" /> Sanctuary Reflection
                  </div>
                  <p className="text-lg md:text-2xl text-blue-900/80 dark:text-slate-100 font-bold italic leading-relaxed transition-colors duration-300">
                    "{entry.aiResponse}"
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default Journal;
