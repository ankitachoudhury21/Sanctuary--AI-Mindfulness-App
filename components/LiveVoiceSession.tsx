
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { X, Mic, MicOff, Save, Sparkles, MessageCircle } from 'lucide-react';
import { TranscriptionMessage } from '../types';

interface Props {
  onClose: () => void;
  onSave: (transcript: string) => void;
  userName: string;
}

// Helper functions for PCM Audio as per guidelines
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

const LiveVoiceSession: React.FC<Props> = ({ onClose, onSave, userName }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<TranscriptionMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const sessionRef = useRef<any>(null);
  const audioContextInRef = useRef<AudioContext | null>(null);
  const audioContextOutRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const transcriptionRef = useRef<{ user: string; model: string }>({ user: '', model: '' });
  
  // Track messages for auto-save on close
  const messagesRef = useRef<TranscriptionMessage[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const initSession = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        audioContextInRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        audioContextOutRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

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
            Keep your responses concise and focused on their well-being.`,
          },
          callbacks: {
            onopen: () => {
              setIsConnected(true);
              const source = audioContextInRef.current!.createMediaStreamSource(stream);
              const scriptProcessor = audioContextInRef.current!.createScriptProcessor(4096, 1, 1);
              
              scriptProcessor.onaudioprocess = (e) => {
                if (isMuted) return;
                const inputData = e.inputBuffer.getChannelData(0);
                const int16 = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                  int16[i] = inputData[i] * 32768;
                }
                const pcmBase64 = encodeBase64(new Uint8Array(int16.buffer));
                
                sessionPromise.then(session => {
                  session.sendRealtimeInput({
                    media: { data: pcmBase64, mimeType: 'audio/pcm;rate=16000' }
                  });
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
                     return [...prev.slice(0, -1), { role: 'user', text: transcriptionRef.current.user }];
                   }
                   return [...prev, { role: 'user', text: transcriptionRef.current.user }];
                });
              }

              if (message.serverContent?.outputTranscription) {
                transcriptionRef.current.model += message.serverContent.outputTranscription.text;
                setMessages(prev => {
                  const last = prev[prev.length - 1];
                  if (last?.role === 'model') {
                    return [...prev.slice(0, -1), { role: 'model', text: transcriptionRef.current.model }];
                  }
                  return [...prev, { role: 'model', text: transcriptionRef.current.model }];
                });
              }

              if (message.serverContent?.turnComplete) {
                transcriptionRef.current = { user: '', model: '' };
              }

              // Handle Audio Output
              const audioBase64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
              if (audioBase64 && audioContextOutRef.current) {
                setIsSpeaking(true);
                const ctx = audioContextOutRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                
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
              }

              if (message.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => s.stop());
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
                setIsSpeaking(false);
              }
            },
            onclose: () => setIsConnected(false),
            onerror: (e) => console.error("Live session error:", e),
          },
        });

        sessionRef.current = await sessionPromise;
      } catch (err) {
        console.error("Failed to connect to Live API", err);
      }
    };

    initSession();

    return () => {
      if (sessionRef.current) sessionRef.current.close();
      if (audioContextInRef.current) audioContextInRef.current.close();
      if (audioContextOutRef.current) audioContextOutRef.current.close();
    };
  }, [userName]);

  const handleFinish = () => {
    if (messages.length > 0) {
      const fullTranscript = messages.map(m => `${m.role === 'user' ? 'Me' : 'Companion'}: ${m.text}`).join('\n');
      onSave(fullTranscript);
    }
    onClose();
  };

  const handleCloseRequest = () => {
    // Auto-save if there's significant content when X is clicked
    if (messagesRef.current.length > 0) {
      const fullTranscript = messagesRef.current.map(m => `${m.role === 'user' ? 'Me' : 'Companion'}: ${m.text}`).join('\n');
      onSave(fullTranscript);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
      <div className="absolute inset-0 bg-teal-950/60 backdrop-blur-2xl animate-in fade-in duration-500" />
      
      <div className="relative w-full max-w-4xl h-[85vh] glass-card rounded-[3rem] md:rounded-[4rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
        <div className="p-8 md:p-12 flex justify-between items-center border-b border-teal-100/10">
          <div className="flex items-center gap-4">
            <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 shadow-lg'}`}></div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-teal-950">Conversational Journal</h2>
              <p className="text-sm font-bold text-teal-700 tracking-wide uppercase">{isConnected ? 'Sanctuary is listening...' : 'Connecting...'}</p>
            </div>
          </div>
          <button onClick={handleCloseRequest} className="p-4 rounded-full bg-teal-100 text-teal-800 hover:scale-110 transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-16 space-y-8 scroll-smooth custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-60">
              <div className="p-8 bg-teal-50 rounded-[3rem]">
                <Sparkles size={64} className="text-teal-600 animate-bounce" />
              </div>
              <p className="text-2xl font-medium text-teal-900 italic">"Say hello to your companion when you're ready..."</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                <div className={`max-w-[80%] p-6 md:p-8 rounded-[2rem] shadow-lg ${msg.role === 'user' ? 'bg-teal-700 text-white rounded-tr-none' : 'bg-white/80 backdrop-blur-md text-teal-950 rounded-tl-none border border-teal-100'}`}>
                  <div className="flex items-center gap-2 mb-2 opacity-60">
                    {msg.role === 'user' ? <MessageCircle size={14} /> : <Sparkles size={14} />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{msg.role === 'user' ? 'Your Voice' : 'Companion'}</span>
                  </div>
                  <p className="text-xl md:text-2xl font-medium leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-8 md:p-12 bg-teal-50/50 backdrop-blur-xl border-t border-teal-100/20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 ${isMuted ? 'bg-red-100 text-red-600' : 'bg-teal-700 text-white'}`}
            >
              {isMuted ? <MicOff size={36} /> : <Mic size={36} className={!isSpeaking ? 'animate-pulse' : ''} />}
            </button>
            <div className="hidden md:block">
              <p className="text-lg font-black text-teal-900">{isSpeaking ? 'Companion Speaking...' : isMuted ? 'Muted' : 'Listening...'}</p>
              <p className="text-sm font-bold text-teal-600 italic">Conversational mode active</p>
            </div>
          </div>

          <button 
            onClick={handleFinish}
            disabled={messages.length === 0}
            className="w-full md:w-auto px-12 py-6 rounded-[2rem] bg-teal-950 text-white font-black text-xl flex items-center justify-center gap-4 shadow-2xl hover:bg-teal-900 transition-all disabled:opacity-30 active:scale-95"
          >
            <Save size={24} /> Save & Finish
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveVoiceSession;
