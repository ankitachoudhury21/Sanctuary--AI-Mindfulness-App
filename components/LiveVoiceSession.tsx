import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { X, Mic, MicOff, Save, Sparkles, MessageCircle, AlertCircle, KeyRound, Radio } from 'lucide-react';
import { TranscriptionMessage } from '../types';

interface Props {
  onClose: () => void;
  onSave: (transcript: string) => void;
  userName: string;
}

// Manual encoding/decoding for PCM as per high-quality guidelines
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encodeBase64(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Helper to encode Float32Array to Int16Array (PCM) with clamping
function encodePCM(data: Float32Array): Uint8Array {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    // Clamp float value to [-1, 1] before scaling to Int16 range
    const clampedValue = Math.max(-1, Math.min(1, data[i]));
    int16[i] = clampedValue * 32768;
  }
  return new Uint8Array(int16.buffer);
}

const LiveVoiceSession: React.FC<Props> = ({ onClose, onSave, userName }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<TranscriptionMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [isKeySelectionRequired, setIsKeySelectionRequired] = useState(false);
  const [isKeySelecting, setIsKeySelecting] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Refs for audio state that needs to be current within callbacks
  const isMutedRef = useRef(isMuted);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const sessionRef = useRef<any>(null);
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const transcriptionRef = useRef<{ user: string; model: string }>({ user: '', model: '' });
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  
  // Track messages for auto-save on close
  const messagesRef = useRef<TranscriptionMessage[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Keep isMutedRef always up-to-date with the state
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const cleanupAudio = useCallback(() => {
    console.log("Cleaning up audio resources...");
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch (e) { console.warn("Error closing session", e); }
      sessionRef.current = null;
    }
    if (scriptProcessorRef.current) {
      try { scriptProcessorRef.current.disconnect(); } catch (e) { console.warn("Error disconnecting scriptProcessor", e); }
      scriptProcessorRef.current = null;
    }
    if (inputSourceRef.current) {
      try { inputSourceRef.current.disconnect(); } catch (e) { console.warn("Error disconnecting inputSource", e); }
      inputSourceRef.current = null;
    }
    sourcesRef.current.forEach(s => {
      try { s.stop(); } catch (e) { console.warn("Error stopping audio source", e); }
      try { s.disconnect(); } catch (e) { console.warn("Error disconnecting audio source", e); }
    });
    sourcesRef.current.clear();

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch (e) { console.warn("Error stopping media stream track", e); }
      });
      mediaStreamRef.current = null;
    }

    if (audioContextInRef.current && audioContextInRef.current.state !== 'closed') {
      audioContextInRef.current.close().catch(e => console.warn("Error closing input AudioContext", e));
      audioContextInRef.current = null;
    }
    if (audioContextOutRef.current && audioContextOutRef.current.state !== 'closed') {
      audioContextOutRef.current.close().catch(e => console.warn("Error closing output AudioContext", e));
      audioContextOutRef.current = null;
    }
    console.log("Audio resources cleaned up.");
  }, []);

  const initSession = useCallback(async () => {
    console.log("Initializing live session...");
    setIsLoadingSession(true);
    setErrorState(null);
    setIsKeySelectionRequired(false);
    setIsKeySelecting(false);

    // Clean up any existing session or audio components before starting a new one
    cleanupAudio(); 

    try {
      if (!(await window.aistudio.hasSelectedApiKey())) {
        setIsKeySelectionRequired(true);
        setIsLoadingSession(false);
        console.log("API key selection required.");
        return;
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextInRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextOutRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      // Request new media stream on each init to ensure fresh access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream; // Store the stream to stop tracks later

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: `You are a supportive, warm, and professional mindfulness companion for ${userName}, a tech professional. 
          Help them through their journaling process by listening intently and providing empathetic, short reflections. 
          Keep your responses concise and focused on their well-being. If they seem stressed, offer a small grounding exercise.`,
        },
        callbacks: {
          onopen: () => {
            console.log("Live session opened.");
            setIsConnected(true);
            setErrorState(null);
            setIsLoadingSession(false);

            const source = audioContextInRef.current!.createMediaStreamSource(mediaStreamRef.current!);
            inputSourceRef.current = source; // Store source to disconnect later
            const scriptProcessor = audioContextInRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;
            
            scriptProcessor.onaudioprocess = (e) => {
              // Use the ref to get the latest isMuted state
              if (isMutedRef.current) return; 

              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBytes = encodePCM(inputData); // Use the clamping encoder
              const pcmBase64 = encodeBase64(pcmBytes);
              
              sessionPromise.then(session => {
                if (session) {
                  session.sendRealtimeInput({
                    media: { data: pcmBase64, mimeType: 'audio/pcm;rate=16000' }
                  });
                }
              }).catch((sendErr) => {
                // Catch sending errors without breaking the session entirely
                console.warn("Error sending realtime input:", sendErr);
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextInRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Transcriptions
            if (message.serverContent?.inputTranscription) {
              transcriptionRef.current.user += message.serverContent.inputTranscription.text;
              setMessages(prev => {
                 const last = prev[prev.length - 1];
                 if (last?.role === 'user') {
                   // Only update if the text actually changed to avoid unnecessary re-renders
                   if (last.text !== transcriptionRef.current.user) {
                     return [...prev.slice(0, -1), { role: 'user', text: transcriptionRef.current.user }];
                   }
                   return prev; // No change, return previous state
                 }
                 return [...prev, { role: 'user', text: transcriptionRef.current.user }];
              });
            }

            if (message.serverContent?.outputTranscription) {
              transcriptionRef.current.model += message.serverContent.outputTranscription.text;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'model') {
                  // Only update if the text actually changed
                  if (last.text !== transcriptionRef.current.model) {
                    return [...prev.slice(0, -1), { role: 'model', text: transcriptionRef.current.model }];
                  }
                  return prev; // No change, return previous state
                }
                return [...prev, { role: 'model', text: transcriptionRef.current.model }];
              });
            }

            if (message.serverContent?.turnComplete) {
              console.log("Turn complete.");
              transcriptionRef.current = { user: '', model: '' };
            }

            // Handle Audio Output
            const audioBase64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioBase64 && audioContextOutRef.current) {
              setIsSpeaking(true);
              const ctx = audioContextOutRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              try {
                const buffer = await decodeAudioData(decodeBase64(audioBase64), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                source.onended = () => {
                  sourcesRef.current.delete(source);
                  if (sourcesRef.current.size === 0) setIsSpeaking(false);
                };
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
                sourcesRef.current.add(source);
              } catch (e) {
                console.error("PCM Decoding failed", e);
              }
            }

            if (message.serverContent?.interrupted) {
              console.log("Model turn interrupted.");
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch (e) {}
                sourcesRef.current.delete(s); // Ensure it's removed even if stop fails
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
            }
          },
          onclose: (e) => {
            console.log("Live session closed:", e.code, e.reason);
            setIsConnected(false);
            setIsLoadingSession(false);
            setErrorState("Session disconnected. Reconnecting...");
            cleanupAudio(); // Ensure full cleanup
            // Attempt to re-initialize after a short delay
            setTimeout(initSession, 3000); 
          },
          onerror: (e) => {
            console.error("Live session error event:", e);
            setIsConnected(false);
            setIsLoadingSession(false);
            cleanupAudio(); // Ensure full cleanup
            const errorMessage = (e as ErrorEvent).error?.message || "A network error occurred. Please check your internet connection and ensure your API key is correctly configured.";
            
            if (errorMessage.includes("Requested entity was not found.")) {
              setErrorState("API key invalid or insufficient permissions. Please select a valid key from a paid GCP project.");
              setIsKeySelectionRequired(true);
            } else if (errorMessage.includes("403") || errorMessage.includes("Permission denied")) {
              setErrorState("API key permissions error. Ensure billing is enabled for your GCP project.");
              setIsKeySelectionRequired(true);
            } else {
              setErrorState(errorMessage);
            }
          },
        },
      });

      sessionRef.current = await sessionPromise;
      console.log("Live session connection successful.");
    } catch (err: any) {
      console.error("Failed to connect to Live API", err);
      setIsLoadingSession(false);
      cleanupAudio(); // Ensure full cleanup
      const errorMessage = err?.message || "Could not initialize secure session. Please check your mic permissions or internet connection.";
      if (errorMessage.includes("Requested entity was not found.") || errorMessage.includes("403") || errorMessage.includes("Permission denied")) {
        setErrorState("API key invalid or insufficient permissions. Please select a valid key from a paid GCP project.");
        setIsKeySelectionRequired(true);
      } else if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
        setErrorState("Network error. Please check your internet connection.");
      } else if (errorMessage.includes("permission denied")) {
        setErrorState("Microphone access denied. Please grant permission to use the live session.");
      } else {
        setErrorState(errorMessage);
      }
    }
  }, [userName, cleanupAudio]); // initSession depends on userName and cleanupAudio

  const handleSelectApiKey = async () => {
    console.log("Attempting to open API key selection dialog.");
    setIsKeySelecting(true);
    setErrorState(null);
    await window.aistudio.openSelectKey();
    // As per guidelines, assume success after triggering openSelectKey()
    setIsKeySelecting(false);
    console.log("API key selection dialog closed. Re-initializing session.");
    // Re-attempt session initialization immediately after opening the dialog
    initSession(); 
  };

  useEffect(() => {
    // Initial session setup on mount
    initSession(); 

    // Cleanup on component unmount
    return () => {
      console.log("LiveVoiceSession component unmounting, cleaning up.");
      cleanupAudio();
    };
  }, [initSession, cleanupAudio]); // Dependencies ensure this effect re-runs if initSession or cleanupAudio changes

  const handleFinish = () => {
    console.log("Finishing live session.");
    if (messages.length > 0) {
      const fullTranscript = messages.map(m => `${m.role === 'user' ? 'Me' : 'Companion'}: ${m.text}`).join('\n');
      onSave(fullTranscript);
    }
    cleanupAudio(); // Perform final cleanup when session is completed by user
    onClose();
  };

  const handleCloseRequest = () => {
    console.log("Close request from user.");
    // Auto-save session summary on explicit close
    if (messagesRef.current.length > 0) {
      const fullTranscript = messagesRef.current.map(m => `${m.role === 'user' ? 'Me' : 'Companion'}: ${m.text}`).join('\n');
      onSave(fullTranscript);
    }
    cleanupAudio(); // Perform final cleanup on explicit close
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-10">
      <div className="absolute inset-0 bg-teal-950/70 backdrop-blur-2xl animate-in fade-in duration-500" />
      
      <div className="relative w-full max-w-5xl h-[90vh] glass-card rounded-[3rem] md:rounded-[4.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
        <div className="p-8 md:p-12 flex justify-between items-center border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-4">
            <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-lg'}`}></div>
            <div>
              <h2 className="text-2xl md:text-4xl font-black text-teal-950 tracking-tight">Reflective Dialogue</h2>
              <p className="text-[10px] md:text-sm font-black text-teal-700 tracking-[0.2em] uppercase">{isConnected ? 'Sanctuary is listening...' : 'Initializing Secure Stream...'}</p>
            </div>
          </div>
          <button onClick={handleCloseRequest} className="p-4 rounded-full bg-teal-100/80 text-teal-900 hover:scale-110 active:scale-95 transition-all shadow-md">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-16 space-y-10 scroll-smooth custom-scrollbar bg-slate-50/20">
          {(isLoadingSession || isKeySelecting) && (
             <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in">
                <div className="p-10 bg-teal-50 rounded-[4rem] shadow-inner">
                  <Sparkles size={80} className="text-teal-600 animate-pulse" />
                </div>
                <p className="text-2xl md:text-4xl font-medium text-teal-900 italic tracking-tight leading-snug">
                  {isKeySelecting ? "Waiting for API Key Selection..." : "Initializing session with Sanctuary..."}
                </p>
             </div>
          )}

          {errorState && (
            <div className="flex items-start gap-4 p-6 bg-red-50 text-red-700 rounded-3xl border border-red-100 animate-in fade-in zoom-in-95">
              <AlertCircle size={24} className="flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-lg">{errorState}</p>
                {isKeySelectionRequired && (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm font-medium">To use this feature, please select an API key associated with a paid Google Cloud Project. This ensures full access to advanced Gemini features.</p>
                    <button 
                      onClick={handleSelectApiKey} 
                      className="px-6 py-3 bg-red-600 text-white font-black rounded-2xl flex items-center gap-3 hover:bg-red-700 transition-all shadow-lg"
                      disabled={isKeySelecting}
                    >
                      {isKeySelecting ? <Radio size={18} className="animate-spin" /> : <KeyRound size={18} />} Select API Key
                    </button>
                    <p className="text-xs text-red-500 mt-2">
                       <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-600">Learn more about billing</a>.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {messages.length === 0 && !errorState && !isLoadingSession && !isKeySelectionRequired ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 opacity-40">
              <div className="p-10 bg-teal-50 rounded-[4rem] shadow-inner">
                <Sparkles size={80} className="text-teal-600 animate-pulse" />
              </div>
              <p className="text-2xl md:text-4xl font-medium text-teal-900 italic tracking-tight leading-snug">"Your companion is ready. <br/>Take a breath and share your thoughts..."</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 duration-500`}>
                <div className={`max-w-[85%] md:max-w-[75%] p-8 md:p-10 rounded-[2.5rem] shadow-xl ${msg.role === 'user' ? 'bg-teal-800 text-white rounded-tr-none' : 'bg-white/95 backdrop-blur-md text-teal-950 rounded-tl-none border border-teal-100'}`}>
                  <div className="flex items-center gap-2 mb-3 opacity-60">
                    {msg.role === 'user' ? <MessageCircle size={14} /> : <Sparkles size={14} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{msg.role === 'user' ? 'Direct Reflection' : 'Sanctuary Guide'}</span>
                  </div>
                  <p className="text-xl md:text-3xl font-medium leading-[1.4] tracking-tight text-balance">{msg.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-8 md:p-14 bg-white/40 backdrop-blur-3xl border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`w-20 h-20 md:w-28 md:h-28 rounded-[2.5rem] flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 ${isMuted ? 'bg-red-50 text-red-600' : 'bg-teal-700 text-white shadow-teal-500/20'}`}
              aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
              disabled={!isConnected && !errorState && !isKeySelectionRequired}
            >
              {isMuted ? <MicOff size={40} /> : <Mic size={40} className={!isSpeaking && isConnected ? 'animate-pulse' : ''} />}
            </button>
            <div className="hidden md:block">
              <p className="text-2xl font-black text-teal-950 tracking-tight">
                {isKeySelectionRequired ? "API Key Needed" : isSpeaking ? 'Companion Speaking...' : isMuted ? 'Muted' : isConnected ? 'Listening Intently' : 'Connecting...'}
              </p>
              <div className="flex items-center gap-2 text-teal-600 font-bold italic text-lg mt-1">
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-ping"></div>
                Secure Neural Feedback
              </div>
            </div>
          </div>

          <button 
            onClick={handleFinish}
            disabled={messages.length === 0 || isLoadingSession || isKeySelectionRequired}
            className="w-full md:w-auto px-16 py-7 rounded-[2.5rem] bg-teal-950 text-white font-black text-2xl flex items-center justify-center gap-4 shadow-2xl hover:bg-black transition-all disabled:opacity-30 active:scale-95 shadow-teal-950/20"
          >
            <Save size={28} /> Complete Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveVoiceSession;