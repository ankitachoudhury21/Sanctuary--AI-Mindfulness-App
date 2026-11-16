import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, PhoneOff, Loader2, Volume2, AlertCircle } from 'lucide-react';
import { LiveTranscriptTurn, UserProfile } from '../types';

interface Props {
  user: UserProfile | null;
  onSaveSummary: (turns: LiveTranscriptTurn[]) => Promise<void>;
  onActiveStateChange?: (isActive: boolean) => void;
}

type SessionState = 'idle' | 'connecting' | 'live' | 'summarizing' | 'error';

function resampleTo16k(input: Float32Array, sourceRate: number): Float32Array {
  if (sourceRate === 16000) return input;
  const ratio = sourceRate / 16000;
  const newLength = Math.max(1, Math.round(input.length / ratio));
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const pos = i * ratio;
    const idx = Math.floor(pos);
    const frac = pos - idx;
    const a = input[idx] ?? 0;
    const b = input[Math.min(idx + 1, input.length - 1)] ?? a;
    result[i] = a + (b - a) * frac;
  }
  return result;
}

function pcmFloatToBase64(float32: Float32Array): string {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const clamped = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
  }
  const bytes = new Uint8Array(int16.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const int16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / 32768;
  }
  return float32;
}

export const LiveJournalDialogue: React.FC<Props> = ({ user, onSaveSummary, onActiveStateChange }) => {
  const [status, setStatus] = useState<SessionState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isMentorSpeaking, setIsMentorSpeaking] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [turns, setTurns] = useState<LiveTranscriptTurn[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const isMutedRef = useRef(false);
  const turnsRef = useRef<LiveTranscriptTurn[]>([]);
  const openTurnSpeakerRef = useRef<'user' | 'mentor' | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    onActiveStateChange?.(status === 'connecting' || status === 'live' || status === 'summarizing');
  }, [status, onActiveStateChange]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns]);

  useEffect(() => {
    if (status !== 'live') return;
    const interval = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [status]);

  const stopAudioPlayback = useCallback(() => {
    activeSourcesRef.current.forEach((source) => {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // Ignore already stopped sources
      }
    });
    activeSourcesRef.current = [];
    nextStartTimeRef.current = 0;
    setIsMentorSpeaking(false);
  }, []);

  const cleanupMediaAndSocket = useCallback(() => {
    stopAudioPlayback();

    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
        processorRef.current.onaudioprocess = null;
      } catch {
        // Ignore disconnect errors
      }
      processorRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (inputCtxRef.current) {
      inputCtxRef.current.close().catch(() => {});
      inputCtxRef.current = null;
    }

    if (outputCtxRef.current) {
      outputCtxRef.current.close().catch(() => {});
      outputCtxRef.current = null;
    }

    if (wsRef.current) {
      try {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;
        if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
          wsRef.current.close();
        }
      } catch {
        // Ignore socket close errors
      }
      wsRef.current = null;
    }

    setMicLevel(0);
  }, [stopAudioPlayback]);

  useEffect(() => {
    return () => {
      cleanupMediaAndSocket();
    };
  }, [cleanupMediaAndSocket]);

  const appendTranscriptChunk = useCallback((speaker: 'user' | 'mentor', chunk: string) => {
    if (!chunk) return;
    const nowLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setTurns((prev) => {
      const last = prev[prev.length - 1];
      let next: LiveTranscriptTurn[];

      if (last && last.speaker === speaker && openTurnSpeakerRef.current === speaker) {
        next = [
          ...prev.slice(0, -1),
          {
            ...last,
            text: last.text + chunk,
          },
        ];
      } else {
        openTurnSpeakerRef.current = speaker;
        next = [
          ...prev,
          {
            id: `${speaker}-${Date.now()}-${prev.length}`,
            speaker,
            text: chunk.trimStart(),
            timestamp: nowLabel,
          },
        ];
      }

      turnsRef.current = next;
      return next;
    });
  }, []);

  const schedulePlaybackChunk = useCallback((base64Audio: string) => {
    const ctx = outputCtxRef.current;
    if (!ctx) return;

    const float32 = base64ToFloat32(base64Audio);
    if (float32.length === 0) return;

    const buffer = ctx.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const startTime = Math.max(ctx.currentTime + 0.02, nextStartTimeRef.current);
    source.start(startTime);
    nextStartTimeRef.current = startTime + buffer.duration;

    activeSourcesRef.current.push(source);
    setIsMentorSpeaking(true);

    source.onended = () => {
      activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
      if (activeSourcesRef.current.length === 0) {
        setIsMentorSpeaking(false);
      }
    };
  }, []);

  const startConversation = useCallback(async () => {
    if (status === 'connecting' || status === 'live' || status === 'summarizing') return;

    setErrorMsg(null);
    setTurns([]);
    turnsRef.current = [];
    openTurnSpeakerRef.current = null;
    setElapsedSeconds(0);
    setIsMuted(false);
    setStatus('connecting');

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Microphone capture is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioCtx({ sampleRate: 16000 });
      const outputCtx = new AudioCtx({ sampleRate: 24000 });
      await inputCtx.resume();
      await outputCtx.resume();
      inputCtxRef.current = inputCtx;
      outputCtxRef.current = outputCtx;

      const params = new URLSearchParams({
        name: user?.name || 'Friend',
        stress: String(user?.stressLevel ?? 5),
        goals: Array.isArray(user?.goals) && user.goals.length > 0 ? user.goals.join(', ') : 'Gratitude Practice',
      });
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${wsProtocol}//${window.location.host}/api/live-journal?${params.toString()}`);
      wsRef.current = ws;

      ws.onopen = () => {
        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        const silentGain = inputCtx.createGain();
        silentGain.gain.value = 0;

        processor.onaudioprocess = (event) => {
          if (isMutedRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            setMicLevel(0);
            return;
          }

          const rawInput = event.inputBuffer.getChannelData(0);
          let sumSq = 0;
          for (let i = 0; i < rawInput.length; i++) {
            sumSq += rawInput[i] * rawInput[i];
          }
          const rms = Math.sqrt(sumSq / rawInput.length);
          setMicLevel(Math.min(1, rms * 6));

          const resampled = resampleTo16k(rawInput, inputCtx.sampleRate);
          const base64Audio = pcmFloatToBase64(resampled);
          wsRef.current.send(JSON.stringify({ type: 'audio', data: base64Audio }));
        };

        source.connect(processor);
        processor.connect(silentGain);
        silentGain.connect(inputCtx.destination);
        processorRef.current = processor;
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'ready') {
            setStatus('live');
          } else if (msg.type === 'audio' && msg.data) {
            schedulePlaybackChunk(msg.data);
          } else if (msg.type === 'inputTranscript' && msg.text) {
            appendTranscriptChunk('user', msg.text);
          } else if (msg.type === 'outputTranscript' && msg.text) {
            appendTranscriptChunk('mentor', msg.text);
          } else if (msg.type === 'interrupted') {
            stopAudioPlayback();
            openTurnSpeakerRef.current = null;
          } else if (msg.type === 'turnComplete') {
            openTurnSpeakerRef.current = null;
          } else if (msg.type === 'error') {
            setErrorMsg(msg.message || 'Live voice connection encountered an error.');
            cleanupMediaAndSocket();
            setStatus('error');
          }
        } catch {
          // Ignore malformed frames
        }
      };

      ws.onerror = () => {
        setErrorMsg('Unable to connect to the live voice companion. Please try again.');
        cleanupMediaAndSocket();
        setStatus('error');
      };

      ws.onclose = () => {
        setStatus((prev) => (prev === 'connecting' || prev === 'live' ? 'idle' : prev));
        cleanupMediaAndSocket();
      };
    } catch (err: any) {
      cleanupMediaAndSocket();
      setErrorMsg(err?.message || 'Microphone permission is required for live voice conversation.');
      setStatus('error');
    }
  }, [status, user, appendTranscriptChunk, schedulePlaybackChunk, stopAudioPlayback, cleanupMediaAndSocket]);

  const handleEndAndSave = useCallback(async () => {
    const capturedTurns = [...turnsRef.current].filter((t) => t.text.trim().length > 0);
    cleanupMediaAndSocket();

    if (capturedTurns.length === 0) {
      setStatus('idle');
      return;
    }

    setStatus('summarizing');
    try {
      await onSaveSummary(capturedTurns);
      setTurns([]);
      turnsRef.current = [];
      setStatus('idle');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not save conversation summary.');
      setStatus('error');
    }
  }, [cleanupMediaAndSocket, onSaveSummary]);

  const formatDuration = (secs: number) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="space-y-6">
      {/* Live status & conversational transcript surface */}
      <div className="rounded-xl bg-[#FAF9F6] dark:bg-slate-900/70 border border-slate-900/10 dark:border-white/10 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-slate-900/[0.06] dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="font-medium text-[#0F5E59] dark:text-teal-400">
              {status === 'live'
                ? isMentorSpeaking
                  ? 'Sanctuary is speaking'
                  : isMuted
                  ? 'Microphone muted'
                  : 'Listening — speak naturally'
                : status === 'connecting'
                ? 'Connecting live audio...'
                : status === 'summarizing'
                ? 'Distilling your reflection...'
                : 'Real-time spoken dialogue'}
            </span>
            {status === 'live' && (
              <>
                <span aria-hidden="true" className="text-slate-400">·</span>
                <span className="display-number font-mono text-slate-600 dark:text-slate-300">
                  {formatDuration(elapsedSeconds)}
                </span>
              </>
            )}
          </div>

          {status === 'live' && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Volume2 size={14} className={isMentorSpeaking ? 'text-[#0F5E59] dark:text-teal-400' : 'text-slate-400'} />
              <div className="w-16 h-1.5 rounded-full bg-slate-900/10 dark:bg-white/10 overflow-hidden" aria-hidden="true">
                <div
                  className="h-full bg-[#0F5E59] dark:bg-teal-400 transition-all duration-75"
                  style={{ width: `${Math.max(8, Math.round((isMentorSpeaking ? 0.85 : micLevel) * 100))}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="min-h-[220px] max-h-[340px] overflow-y-auto px-4 sm:px-6 py-5 space-y-4">
          {turns.length === 0 ? (
            <div className="h-[170px] flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-2">
              <p className="font-editorial italic text-xl sm:text-2xl text-slate-800 dark:text-slate-100">
                {status === 'live'
                  ? 'Share whatever is on your mind today.'
                  : status === 'connecting'
                  ? 'Opening your private voice channel...'
                  : 'Speak aloud and reflect together in real time.'}
              </p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {status === 'live'
                  ? 'Sanctuary listens as you speak and replies aloud with gentle follow-up questions.'
                  : 'When you finish talking, your dialogue is distilled into a clean archive reflection.'}
              </p>
            </div>
          ) : (
            turns.map((turn) => (
              <div
                key={turn.id}
                className={`flex flex-col ${turn.speaker === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 space-y-1 ${
                    turn.speaker === 'user'
                      ? 'bg-[#0F5E59] text-white'
                      : 'bg-white dark:bg-white/[0.05] border border-slate-900/10 dark:border-white/10 text-slate-800 dark:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 text-[11px] opacity-75">
                    <span className="font-medium">{turn.speaker === 'user' ? user?.name || 'You' : 'Sanctuary'}</span>
                    <span aria-hidden="true">·</span>
                    <span className="display-number font-mono">{turn.timestamp}</span>
                  </div>
                  <p className={`text-sm sm:text-base leading-relaxed ${turn.speaker === 'mentor' ? 'font-editorial italic' : ''}`}>
                    {turn.text}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={transcriptEndRef} />
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center gap-3 text-xs sm:text-sm text-rose-800 dark:text-rose-200">
          <AlertCircle size={17} className="text-rose-600 dark:text-rose-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Action Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {status === 'live' ? (
          <>
            <button
              type="button"
              onClick={() => setIsMuted((prev) => !prev)}
              className={`px-5 py-3 rounded-xl border text-sm font-medium inline-flex items-center justify-center gap-2.5 transition-colors min-h-[44px] ${
                isMuted
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/50 text-amber-800 dark:text-amber-200'
                  : 'bg-[#F5F4EF] dark:bg-white/[0.04] border-slate-900/10 dark:border-white/10 text-slate-800 dark:text-slate-200 hover:border-slate-900/25 dark:hover:border-white/25'
              }`}
              aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? <MicOff size={16} /> : <Mic size={16} className="text-[#0F5E59] dark:text-teal-400" />}
              <span>{isMuted ? 'Unmute Microphone' : 'Mute Microphone'}</span>
            </button>

            <button
              type="button"
              onClick={handleEndAndSave}
              className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors min-h-[44px]"
              aria-label="End conversation and save summary"
            >
              <PhoneOff size={16} />
              <span>{turns.length > 0 ? 'End & Save Summary' : 'End Conversation'}</span>
            </button>
          </>
        ) : (
          <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Speak naturally — you can interrupt or pause anytime.
            </span>
            <button
              type="button"
              onClick={startConversation}
              disabled={status === 'connecting' || status === 'summarizing'}
              className="calm-btn-primary px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2.5 disabled:opacity-50 min-h-[44px]"
              aria-label="Start live voice conversation"
            >
              {status === 'connecting' || status === 'summarizing' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Mic size={16} />
              )}
              <span>
                {status === 'connecting'
                  ? 'Connecting...'
                  : status === 'summarizing'
                  ? 'Saving Summary...'
                  : 'Start Conversation'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
