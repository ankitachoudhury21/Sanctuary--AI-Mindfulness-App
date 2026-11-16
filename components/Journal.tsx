import React, { useState, useRef, useEffect, useCallback } from 'react';
import { JournalEntry, AppView, UserProfile, LiveTranscriptTurn } from '../types';
import {
  Mic, Square, Send, Heart,
  Loader2, Trash2, ChevronLeft,
  Download, Eraser, AlertCircle, BookOpen, MessageCircle, PenLine
} from 'lucide-react';
import { analyzeGratitudeJournal, summarizeLiveJournal } from '../services/geminiService';
import { LiveJournalDialogue } from './LiveJournalDialogue';

interface Props {
  entries: JournalEntry[];
  setEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
  setView: (view: AppView) => void;
  user: UserProfile | null;
}

const DRAFT_STORAGE_KEY = 'sanctuary_journal_draft';

const Journal: React.FC<Props> = React.memo(({ entries, setEntries, setView, user }) => {
  const [journalMode, setJournalMode] = useState<'live' | 'write'>('live');
  const [isLiveSessionActive, setIsLiveSessionActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textEntry, setTextEntry] = useState(() => localStorage.getItem(DRAFT_STORAGE_KEY) || '');
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const recognitionRef = useRef<any>(null);
  const textEntryRef = useRef(textEntry);

  const getNudge = () => {
    if (textEntry.length === 0) return "Start with one quiet observation.";
    if (textEntry.length < 25) return "Take an unhurried breath as you write.";
    if (textEntry.length < 100) return "Notice what brought ease today.";
    return "Your reflection is taking shape.";
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
      setAiFeedback("Your entry is saved, though a reflection insight could not be generated right now.");
    } finally {
      setIsProcessing(false);
    }
  }, [textEntry, isProcessing, setEntries]);

  const handleSaveLiveSummary = useCallback(
    async (turns: LiveTranscriptTurn[]) => {
      setAiFeedback(null);
      const entryDate = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const result = await summarizeLiveJournal(turns, user);

      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        date: entryDate,
        type: 'live',
        transcript: result.summary,
        aiResponse: result.mentorReflection,
      };

      setEntries((prev) => [newEntry, ...prev]);
      setAiFeedback(result.mentorReflection);
    },
    [setEntries, user]
  );

  const exportJournal = useCallback(() => {
    if (entries.length === 0) return;
    const content = entries
      .map((e) => `[${e.date}${e.type === 'live' ? ' · Spoken Dialogue' : ''}]\nReflection: ${e.transcript}\nInsight: ${e.aiResponse}\n\n`)
      .join('---\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Sanctuary_Journal_Export.txt`;
    link.click();
  }, [entries]);

  return (
    <div className="space-y-8 md:space-y-10 animate-in fade-in duration-500 max-w-5xl mx-auto pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-900/10 dark:border-white/[0.08] pb-6">
        <div className="space-y-2">
          <button
            onClick={() => setView(AppView.DASHBOARD)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0F5E59] dark:text-teal-400 hover:underline min-h-[36px]"
            aria-label="Back to Dashboard"
          >
            <ChevronLeft size={15} />
            <span>Dashboard</span>
          </button>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-normal text-slate-900 dark:text-white tracking-tight">
            Gratitude Journal
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Private space to decompress and distill what mattered today.
          </p>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 display-number">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} archived
          {lastSaved ? ` · Draft ${lastSaved}` : ''}
        </div>
      </div>

      {/* Gratitude Reflection Workspace */}
      <div className="glass-card rounded-2xl p-5 sm:p-8 space-y-6">
        {/* Segmented Mode Switch */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div
            className="inline-flex items-center p-1 rounded-xl bg-[#F5F4EF] dark:bg-white/[0.04] border border-slate-900/10 dark:border-white/10 self-start"
            role="tablist"
            aria-label="Gratitude Journal interaction mode"
          >
            <button
              type="button"
              role="tab"
              aria-selected={journalMode === 'live'}
              disabled={isLiveSessionActive && journalMode !== 'live'}
              onClick={() => {
                setAiFeedback(null);
                setJournalMode('live');
              }}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${
                journalMode === 'live'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageCircle size={15} className={journalMode === 'live' ? 'text-[#0F5E59] dark:text-teal-400' : ''} />
              <span>Live Conversation</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={journalMode === 'write'}
              disabled={isLiveSessionActive}
              onClick={() => {
                setAiFeedback(null);
                setJournalMode('write');
              }}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 min-h-[40px] disabled:opacity-45 ${
                journalMode === 'write'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PenLine size={15} className={journalMode === 'write' ? 'text-[#0F5E59] dark:text-teal-400' : ''} />
              <span>Write Reflection</span>
            </button>
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            {journalMode === 'live'
              ? 'Two-way spoken dialogue with automatic summary'
              : 'Written reflection with optional dictation'}
          </span>
        </div>

        {journalMode === 'live' ? (
          <LiveJournalDialogue
            user={user}
            onSaveSummary={handleSaveLiveSummary}
            onActiveStateChange={setIsLiveSessionActive}
          />
        ) : (
          <>
            <div className="rounded-xl bg-[#FAF9F6] dark:bg-slate-900/70 border border-slate-900/10 dark:border-white/10 overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-3 border-b border-slate-900/[0.06] dark:border-white/[0.06]">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {getNudge()}
                </span>
                {isRecording && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                    <Mic size={13} />
                    Listening...
                  </span>
                )}
              </div>
              <textarea
                className="w-full h-44 sm:h-56 px-4 sm:px-6 py-5 bg-transparent font-editorial text-lg sm:text-2xl text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none leading-relaxed"
                placeholder="Today, I am grateful for..."
                value={textEntry}
                onChange={(e) => setTextEntry(e.target.value)}
                aria-label="Write your daily gratitude reflection"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                onClick={handleVoiceToggle}
                disabled={isProcessing}
                className={`px-5 py-3 rounded-xl border text-sm font-medium inline-flex items-center justify-center gap-2.5 transition-colors min-h-[44px] ${
                  isRecording
                    ? 'bg-rose-600 border-rose-600 text-white'
                    : 'bg-[#F5F4EF] dark:bg-white/[0.04] border-slate-900/10 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:border-slate-900/25 dark:hover:border-white/25'
                }`}
              >
                {isRecording ? <Square size={15} fill="currentColor" /> : <Mic size={16} className="text-[#0F5E59] dark:text-teal-400" />}
                <span>{isRecording ? 'Stop Dictation' : 'Voice Dictation'}</span>
              </button>

              <button
                onClick={handleTextSubmit}
                disabled={isProcessing || !textEntry.trim() || isRecording}
                className="calm-btn-primary px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 min-h-[44px]"
              >
                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                <span>{isProcessing ? 'Reflecting...' : 'Save Reflection'}</span>
              </button>
            </div>
          </>
        )}

        {aiFeedback && (
          <div className="p-5 sm:p-6 rounded-xl bg-[#0F5E59]/[0.06] dark:bg-teal-400/[0.08] border border-[#0F5E59]/15 dark:border-teal-400/20 animate-in fade-in duration-300 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0F5E59] dark:text-teal-400">
              <Heart size={13} fill="currentColor" />
              <span>Sanctuary Reflection</span>
            </div>
            <p className="font-editorial italic text-lg sm:text-xl text-slate-800 dark:text-slate-100 leading-relaxed">
              "{aiFeedback}"
            </p>
          </div>
        )}
      </div>

      {/* Reflection Archive */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <BookOpen size={18} className="text-[#0F5E59] dark:text-teal-400" />
            <h2 className="font-editorial text-2xl sm:text-3xl font-normal text-slate-900 dark:text-white tracking-tight">
              Archive
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={exportJournal}
              disabled={entries.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/[0.04] border border-slate-900/12 dark:border-white/12 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.08] transition-colors disabled:opacity-35 min-h-[40px]"
            >
              <Download size={14} />
              <span>Export</span>
            </button>
            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={entries.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/[0.04] border border-rose-500/25 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-35 min-h-[40px]"
            >
              <Eraser size={14} />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {showClearConfirm && (
          <div className="p-5 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-rose-600 dark:text-rose-400 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-semibold text-rose-950 dark:text-rose-100">Clear all archived reflections?</p>
                <p className="text-xs text-rose-800 dark:text-rose-300">This removes saved entries from your local storage.</p>
              </div>
            </div>
            <div className="flex gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 sm:flex-none px-4 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 min-h-[40px]"
              >
                Cancel
              </button>
              <button
                onClick={() => { setEntries([]); setShowClearConfirm(false); setAiFeedback(null); }}
                className="flex-1 sm:flex-none px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg min-h-[40px]"
              >
                Delete All
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {entries.length === 0 ? (
            <div className="col-span-full py-14 px-6 text-center glass-card rounded-2xl border-dashed border border-slate-300 dark:border-white/15">
              <p className="font-editorial italic text-xl text-slate-500 dark:text-slate-400">
                Your archive begins with your first saved reflection.
              </p>
            </div>
          ) : entries.map(entry => (
            <article key={entry.id} className="glass-card p-6 rounded-2xl space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="display-number font-medium">{entry.date}</span>
                    {entry.type === 'live' && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#0F5E59] dark:text-teal-400 font-medium">Spoken Dialogue</span>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => setEntries(prev => prev.filter(e => e.id !== entry.id))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    aria-label="Delete journal entry"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <p className="font-editorial text-lg sm:text-xl text-slate-900 dark:text-white leading-relaxed">
                  "{entry.transcript}"
                </p>
              </div>

              {entry.aiResponse && (
                <div className="pt-4 border-t border-slate-900/[0.08] dark:border-white/[0.08] space-y-1.5">
                  <p className="text-xs font-medium text-[#0F5E59] dark:text-teal-400">Reflection</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                    "{entry.aiResponse}"
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
});

export default Journal;
