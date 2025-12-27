import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { AppView } from '../types';
import { 
  Play, Pause, SkipBack, SkipForward, Sparkles, 
  ChevronLeft, Loader2, Volume2, VolumeX, Timer, Brain, 
  WavesIcon, Wind, Cloud, Moon,
  Target, Heart, Sun, Activity, Music, Droplets, Stars, Maximize2, Zap, Coffee
} from 'lucide-react';

interface Props {
  setView: (view: AppView) => void;
  setIsAnyTrackPlaying: (playing: boolean) => void;
}

const CATEGORIES = [
  { id: 'focus', label: 'Focus', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'meditate', label: 'Meditate', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'relax', label: 'Relax', icon: Wind, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'sleep', label: 'Sleep', icon: Moon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'piano', label: 'Piano', icon: Music, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'all', label: 'All', icon: Activity, color: 'text-slate-600', bg: 'bg-slate-50' },
];

const TRACKS = [
  { id: 'p1', cat: 'piano', name: 'Midnight Debug', genre: 'Felt Reflection', icon: Music, color: 'from-slate-950 to-indigo-950', url: 'GEN_PIANO_MIDNIGHT', benefit: 'Deep, felt-damped melodies designed to slow down your racing thoughts after a long sprint.' },
  { id: 'p2', cat: 'piano', name: 'Solar Syntax', genre: 'Bright Prelude', icon: Sun, color: 'from-amber-100 to-orange-200', url: 'GEN_PIANO_MORNING', benefit: 'High-frequency major scales to clear cognitive fog and reset your morning flow state.' },
  { id: 'p3', cat: 'piano', name: 'Monsoon Logic', genre: 'Rainy Resonance', icon: Droplets, color: 'from-blue-200 to-slate-400', url: 'GEN_PIANO_RAIN', benefit: 'A steady rhythmic downpour paired with low-octave chords to drown out office chatter.' },
  { id: 'p4', cat: 'piano', name: 'Latency Void', genre: 'Ambient Grand', icon: Zap, color: 'from-slate-900 via-slate-800 to-slate-950', url: 'GEN_PIANO_VOID', benefit: 'Ultra-slow, drifting harmonies that create a mental buffer between work and rest.' },
  { id: 'p5', cat: 'piano', name: 'Coffee Lake Prelude', genre: 'Rhythmic Focus', icon: Coffee, color: 'from-amber-600/20 to-amber-900/40', url: 'GEN_PIANO_COFFEE', benefit: 'A driving, focused tempo to maintain high-velocity output during deep work blocks.' },
  { id: 'p6', cat: 'piano', name: 'Glass Focus', genre: 'Minimalist Zen', icon: Activity, color: 'from-blue-50 to-teal-100', url: 'GEN_PIANO_GLASS', benefit: 'Precision-timed, minimal notes for entering a state of high-performance flow.' },
  { id: 'f7', cat: 'focus', name: 'Raag Bilawal', genre: 'Energizing', icon: Sun, color: 'from-yellow-400 to-orange-400', url: 'GEN_RAAG_BILAWAL', benefit: 'A bright, major-scale Raga to energize your focus.' },
  { id: 'f4', cat: 'focus', name: 'Raag Yaman', genre: 'Evening Devotion', icon: Music, color: 'from-orange-200 to-amber-600', url: 'GEN_RAAG_YAMAN', benefit: 'Lydian melodies that cultivate peace and creative devotion.' },
  { id: 'f6', cat: 'focus', name: 'Logic Reeds', genre: 'Harmonium Focus', icon: Wind, color: 'from-amber-100 to-orange-300', url: 'GEN_HARMONIUM_FOCUS', benefit: 'Steady reed drone for rhythmic cognitive flow.' },
  { id: 'f1', cat: 'focus', name: 'Deep Work', genre: 'Calm Waves', icon: WavesIcon, color: 'from-blue-50 to-teal-300', url: 'GEN_CALM_WAVES', benefit: 'Rhythmic shore waves for cognitive clarity.' },
  { id: 'm6', cat: 'meditate', name: 'Sacred Bellows', genre: 'Reed Zen', icon: Wind, color: 'from-amber-200 to-orange-700', url: 'GEN_HARMONIUM_MEDITATE', benefit: 'Traditional harmonium drone for spiritual depth and centering.' },
  { id: 'm5', cat: 'meditate', name: 'Celestial Voyage', genre: 'Astro-Ambient', icon: Stars, color: 'from-slate-900 via-indigo-950 to-purple-900', url: 'GEN_SPACE_ASTRO', benefit: 'Ethereal cosmic melodies and deep stardust frequencies.' },
  { id: 'm7', cat: 'meditate', name: 'Ancient Temple', genre: 'Bronze Resonance', icon: Brain, color: 'from-amber-200 to-yellow-600', url: 'GEN_BRONZE_ZEN', benefit: 'Deep singing bowl vibrations for grounding your nervous system.' },
  { id: 'm8', cat: 'meditate', name: 'Forest Breath', genre: 'Shakuhachi', icon: Wind, color: 'from-green-100 to-teal-200', url: 'GEN_FLUTE_MEDITATE', benefit: 'Natural woodwind textures that sync with your breathing capacity.' },
  { id: 'm9', cat: 'meditate', name: 'Prism Light', genre: 'Glass Harp', icon: Sparkles, color: 'from-blue-50 to-indigo-100', url: 'GEN_GLASS_HARP', benefit: 'High-clarity harmonic layers to sharpen intuition and focus.' },
  { id: 'r3', cat: 'relax', name: 'Raag Bhairavi', genre: 'Healing', icon: Heart, color: 'from-rose-100 to-teal-400', url: 'GEN_RAAG_BHAIRAVI', benefit: 'The Queen of Ragas. A soul-stirring healing vibration suited for any time of day.' },
  { id: 'r4', cat: 'relax', name: 'Raag Malhar', genre: 'Monsoon Rain', icon: Cloud, color: 'from-slate-700 to-blue-900', url: 'GEN_RAAG_MALHAR', benefit: 'The Raga of Rain. Majestic, surging melodies like a storm over the plains.' },
  { id: 'r5', cat: 'relax', name: 'Raag Bihag', genre: 'Dreamy Evening', icon: Heart, color: 'from-pink-100 to-amber-200', url: 'GEN_RAAG_BIHAG', benefit: 'Best suited for late evening. Evokes a sweet, romantic, and dreamy atmosphere.' },
  { id: 'r2', cat: 'relax', name: 'Raag Darbari', genre: 'Regal Night', icon: Moon, color: 'from-indigo-900 to-blue-950', url: 'GEN_RAAG_DARBARI', benefit: 'Grave, regal, and deeply grounding melodies for late-night reflection.' },
  { id: 's1', cat: 'sleep', name: 'Lunar Tide', genre: 'Ocean Delta', icon: WavesIcon, color: 'from-[#0b1d2e] to-[#1e3a8a]', url: 'GEN_SLEEP_WAVES', benefit: 'Gentle, slow-moving oceanic rhythms tuned to Delta sleep frequencies.' },
  { id: 's2', cat: 'sleep', name: 'Starlight Drift', genre: 'Binaural Pad', icon: Stars, color: 'from-[#1e1b4b] to-[#312e81]', url: 'GEN_SLEEP_DRIFT', benefit: 'Soft ethereal pads layered with a 2Hz binaural beat for deep REM induction.' },
  { id: 's3', cat: 'sleep', name: 'Rain on Glass', genre: 'ASMR Rain', icon: Droplets, color: 'from-[#172554] to-[#1e3a8a]', url: 'GEN_SLEEP_RAIN', benefit: 'A soothing, warm rainfall designed to mask environmental noise and racing thoughts.' },
  { id: 's4', cat: 'sleep', name: 'Velvet Void', genre: 'Deep Space', icon: Moon, color: 'from-black to-[#111827]', url: 'GEN_SLEEP_SPACE', benefit: 'Warm, low-frequency cosmic hums designed for total mental surrender.' },
];

const CROSSFADE_TIME = 2.0; 

interface AudioVoice {
  id: string;
  gainNode: GainNode;
  nodes: any[];
}

const MusicPlayer: React.FC<Props> = ({ setView, setIsAnyTrackPlaying }) => {
  const [activeCat, setActiveCat] = useState('focus');
  const [currentTrack, setCurrentTrack] = useState(TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const reverbNodeRef = useRef<ConvolverNode | null>(null);
  
  const activeVoicesRef = useRef<AudioVoice[]>([]);

  const filteredTracks = useMemo(() => {
    if (activeCat === 'all') return TRACKS;
    return TRACKS.filter(t => t.cat === activeCat);
  }, [activeCat]);

  const initAudioEngine = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
        audioContextRef.current = new AudioContextClass();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      if (!masterGainRef.current) {
        masterGainRef.current = ctx.createGain();
        masterGainRef.current.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime);
        masterGainRef.current.connect(ctx.destination);
      }
      if (!reverbNodeRef.current) {
        const reverb = ctx.createConvolver();
        const sampleRate = ctx.sampleRate;
        const length = sampleRate * 4.0;
        const impulse = ctx.createBuffer(2, length, sampleRate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);
        for (let i = 0; i < length; i++) {
          const envelope = Math.pow(1 - i / length, 4.0);
          left[i] = (Math.random() * 2 - 1) * envelope;
          right[i] = (Math.random() * 2 - 1) * envelope;
        }
        reverb.buffer = impulse;
        const reverbGain = ctx.createGain();
        reverbGain.gain.setValueAtTime(0.4, ctx.currentTime); 
        reverb.connect(reverbGain).connect(masterGainRef.current);
        reverbNodeRef.current = reverb;
      }
      if (!analyzerRef.current) {
        const analyzer = ctx.createAnalyser();
        analyzer.fftSize = 512;
        analyzer.smoothingTimeConstant = 0.8;
        analyzer.connect(masterGainRef.current);
        analyzerRef.current = analyzer;
      }
      return true;
    } catch (err) { return false; }
  }, [volume, isMuted]);

  const stopAllVoices = useCallback((fade = true) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    activeVoicesRef.current.forEach(voice => {
      const now = ctx.currentTime;
      if (fade) {
        voice.gainNode.gain.cancelScheduledValues(now);
        voice.gainNode.gain.linearRampToValueAtTime(0, now + CROSSFADE_TIME);
        setTimeout(() => {
          voice.nodes.forEach(node => {
            try { if (node.stop) node.stop(); node.disconnect(); } catch (e) {}
          });
          voice.gainNode.disconnect();
        }, CROSSFADE_TIME * 1000 + 100);
      } else {
        voice.nodes.forEach(node => {
          try { if (node.stop) node.stop(); node.disconnect(); } catch (e) {}
        });
        voice.gainNode.disconnect();
      }
    });
    activeVoicesRef.current = [];
    setIsPlaying(false);
    setIsAnyTrackPlaying(false);
  }, [setIsAnyTrackPlaying]);

  const startGenerator = useCallback((type: string, trackId: string) => {
    const ctx = audioContextRef.current;
    if (!ctx || !analyzerRef.current || isMuted) {
      setIsLoading(false);
      return;
    }

    const now = ctx.currentTime;
    const voiceGain = ctx.createGain();
    voiceGain.gain.setValueAtTime(0, now);
    voiceGain.gain.linearRampToValueAtTime(1, now + CROSSFADE_TIME);
    voiceGain.connect(analyzerRef.current);

    const extraNodes: any[] = [];
    let mainNode: AudioNode;

    if (type.startsWith('GEN_PIANO')) {
      const mainGain = ctx.createGain();
      mainGain.connect(voiceGain);
      if (reverbNodeRef.current) mainGain.connect(reverbNodeRef.current);
      
      const playPianoNote = (freq: number, startTime: number, duration: number, vel: number) => {
        const hammerBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
        const hammerData = hammerBuffer.getChannelData(0);
        for(let i=0; i<hammerData.length; i++) hammerData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i/hammerData.length, 6);
        const hammerSource = ctx.createBufferSource();
        hammerSource.buffer = hammerBuffer;
        const hFilter = ctx.createBiquadFilter();
        hFilter.type = 'lowpass'; hFilter.frequency.setValueAtTime(200, startTime);
        const hGain = ctx.createGain();
        hGain.gain.setValueAtTime(0.08 * vel, startTime);
        hGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.08);
        hammerSource.connect(hFilter).connect(hGain).connect(mainGain);
        hammerSource.start(startTime);
        extraNodes.push(hammerSource, hFilter, hGain);

        const harmonicRatios = [1, 2, 3.01, 4, 5.02];
        harmonicRatios.forEach((ratio, idx) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq * ratio, startTime);
          osc.detune.setValueAtTime((Math.random() - 0.5) * 5, startTime);
          
          const g = ctx.createGain();
          g.gain.setValueAtTime(0, startTime);
          g.gain.linearRampToValueAtTime((0.3 / (idx + 1)) * vel, startTime + 0.005);
          
          const decay = duration * (1.5 - idx * 0.15);
          g.gain.exponentialRampToValueAtTime(0.0001, startTime + decay);
          
          const vFilter = ctx.createBiquadFilter();
          vFilter.type = 'lowpass';
          vFilter.frequency.setValueAtTime(freq * 3, startTime);
          vFilter.frequency.exponentialRampToValueAtTime(freq * 0.5, startTime + decay);

          osc.connect(vFilter).connect(g).connect(mainGain);
          osc.start(startTime);
          osc.stop(startTime + decay + 0.5);
          extraNodes.push(osc, vFilter, g);
        });
      };

      const isMidnight = type.includes('MIDNIGHT');
      const isMorning = type.includes('MORNING');
      const isRain = type.includes('RAIN');
      const isVoid = type.includes('VOID');
      const isCoffee = type.includes('COFFEE');
      const isGlass = type.includes('GLASS');

      const scale = isMidnight ? [0, 3, 7, 8, 10, 12] : 
                   isMorning ? [0, 2, 4, 7, 9, 12] : 
                   isRain ? [0, 2, 3, 7, 9, 12] : 
                   isVoid ? [0, 7, 12, 14, 19] :
                   isCoffee ? [0, 2, 4, 7, 9, 12, 14] :
                   [0, 2, 7, 9, 12, 14]; 

      const baseTonic = isMidnight ? 110 : isMorning ? 146.83 : isRain ? 130.81 : isVoid ? 82.41 : isCoffee ? 164.81 : 196.00;
      const seqInterval = isMidnight ? 4500 : isMorning ? 3000 : isRain ? 5000 : isVoid ? 12000 : isCoffee ? 800 : 1200;

      let nextNoteTime = ctx.currentTime;
      const runSequence = () => {
        while (nextNoteTime < ctx.currentTime + 1.0) {
          const interval = scale[Math.floor(Math.random() * scale.length)];
          const oct = isVoid ? (Math.random() > 0.5 ? -1 : 0) : (isCoffee ? 1 : Math.floor(Math.random() * 2));
          const f = baseTonic * Math.pow(2, (interval + oct * 12) / 12);
          playPianoNote(f, nextNoteTime, isVoid ? 15 : (isCoffee ? 1.5 : 5), 0.6 + Math.random() * 0.4);
          nextNoteTime += (seqInterval / 1000) + (isGlass || isCoffee ? 0 : Math.random() * 2.0);
        }
      };

      const schedulerId = setInterval(runSequence, 200);
      runSequence();
      extraNodes.push({ stop: () => clearInterval(schedulerId) });
      mainNode = mainGain;
    }
    else if (type === 'GEN_BRONZE_ZEN') {
      const mainGain = ctx.createGain();
      mainGain.connect(voiceGain);
      if (reverbNodeRef.current) mainGain.connect(reverbNodeRef.current);
      
      const droneOsc = ctx.createOscillator();
      droneOsc.type = 'sine';
      droneOsc.frequency.setValueAtTime(55, ctx.currentTime);
      const droneG = ctx.createGain();
      droneG.gain.setValueAtTime(0.08, ctx.currentTime);
      droneOsc.connect(droneG).connect(mainGain);
      droneOsc.start();
      extraNodes.push(droneOsc, droneG);

      const playBowl = () => {
        const now = ctx.currentTime;
        const base = 110 + (Math.random() * 10);
        const harmonics = [1, 2.76, 5.4, 8.1, 11.3]; 
        
        harmonics.forEach((h, i) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(base * h, now);
          osc.detune.setValueAtTime((Math.random() - 0.5) * 8, now);
          
          const g = ctx.createGain();
          const lfo = ctx.createOscillator();
          lfo.frequency.setValueAtTime(0.2 + (i * 0.05), now);
          const lfoG = ctx.createGain();
          lfoG.gain.setValueAtTime(0.05, now);
          lfo.connect(lfoG).connect(g.gain);
          
          g.gain.setValueAtTime(0, now);
          g.gain.linearRampToValueAtTime(0.12 / (i + 1), now + 0.1);
          g.gain.exponentialRampToValueAtTime(0.0001, now + 18);
          
          osc.connect(g).connect(mainGain);
          osc.start(now); osc.stop(now + 19);
          lfo.start(now); lfo.stop(now + 19);
          extraNodes.push(osc, g, lfo, lfoG);
        });
      };
      const bowlId = setInterval(playBowl, 14000);
      playBowl();
      extraNodes.push({ stop: () => clearInterval(bowlId) });
      mainNode = mainGain;
    }
    else if (type === 'GEN_FLUTE_MEDITATE') {
      const mainGain = ctx.createGain();
      mainGain.connect(voiceGain);
      if (reverbNodeRef.current) mainGain.connect(reverbNodeRef.current);
      
      const playFlute = () => {
        const now = ctx.currentTime;
        const root = 220;
        const scale = [0, 3, 5, 7, 10]; 
        const freq = root * Math.pow(2, scale[Math.floor(Math.random() * scale.length)] / 12);
        
        const noise = ctx.createBufferSource();
        const buffer = ctx.createBuffer(1, ctx.sampleRate * 5, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for(let i=0; i<buffer.length; i++) data[i] = Math.random() * 2 - 1;
        noise.buffer = buffer; noise.loop = true;
        
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(freq, now);
        noiseFilter.Q.setValueAtTime(10, now);
        
        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(0, now);
        nGain.gain.linearRampToValueAtTime(0.25, now + 1.2);
        nGain.gain.linearRampToValueAtTime(0, now + 6);
        
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        
        const oscFilter = ctx.createBiquadFilter();
        oscFilter.type = 'lowpass';
        oscFilter.frequency.setValueAtTime(freq * 2.5, now);
        
        const oGain = ctx.createGain();
        oGain.gain.setValueAtTime(0, now);
        oGain.gain.linearRampToValueAtTime(0.15, now + 1.5);
        oGain.gain.exponentialRampToValueAtTime(0.0001, now + 5.8);
        
        const vibrato = ctx.createOscillator();
        vibrato.frequency.setValueAtTime(4.5 + Math.random(), now);
        const vibratoG = ctx.createGain();
        vibratoG.gain.setValueAtTime(freq * 0.02, now);
        vibrato.connect(vibratoG).connect(osc.frequency);
        vibrato.connect(vibratoG).connect(noiseFilter.frequency);
        
        noise.connect(noiseFilter).connect(nGain).connect(mainGain);
        osc.connect(oscFilter).connect(oGain).connect(mainGain);
        
        noise.start(now); noise.stop(now + 6.1);
        osc.start(now); osc.stop(now + 6.1);
        vibrato.start(now); vibrato.stop(now + 6.1);
        extraNodes.push(noise, noiseFilter, nGain, osc, oscFilter, oGain, vibrato, vibratoG);
      };
      
      const fluteId = setInterval(playFlute, 8500);
      playFlute();
      extraNodes.push({ stop: () => clearInterval(fluteId) });
      mainNode = mainGain;
    }
    else if (type === 'GEN_GLASS_HARP') {
      const mainGain = ctx.createGain();
      mainGain.connect(voiceGain);
      if (reverbNodeRef.current) mainGain.connect(reverbNodeRef.current);
      
      const playGlass = () => {
        const now = ctx.currentTime;
        const scale = [0, 4, 7, 11, 14, 19]; 
        const root = 440;
        const freq = root * Math.pow(2, scale[Math.floor(Math.random() * scale.length)] / 12);
        
        const carrier = ctx.createOscillator();
        carrier.type = 'sine';
        carrier.frequency.setValueAtTime(freq, now);
        
        const modulator = ctx.createOscillator();
        modulator.type = 'sine';
        modulator.frequency.setValueAtTime(freq * 2.01, now); 
        
        const modGain = ctx.createGain();
        modGain.gain.setValueAtTime(freq * 1.5, now);
        modGain.gain.exponentialRampToValueAtTime(freq * 0.1, now + 4);
        
        modulator.connect(modGain).connect(carrier.frequency);
        
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.08, now + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);
        
        if (Math.random() > 0.5) {
          const shimmer = ctx.createOscillator();
          shimmer.frequency.setValueAtTime(freq * 8, now);
          const sGain = ctx.createGain();
          sGain.gain.setValueAtTime(0, now);
          sGain.gain.linearRampToValueAtTime(0.02, now + 0.1);
          sGain.gain.exponentialRampToValueAtTime(0.0001, now + 1);
          shimmer.connect(sGain).connect(mainGain);
          shimmer.start(now); shimmer.stop(now + 1.1);
          extraNodes.push(shimmer, sGain);
        }

        carrier.connect(g).connect(mainGain);
        carrier.start(now); carrier.stop(now + 4.6);
        modulator.start(now); modulator.stop(now + 4.6);
        extraNodes.push(carrier, modulator, modGain, g);
      };
      
      const glassId = setInterval(playGlass, 2500);
      playGlass();
      extraNodes.push({ stop: () => clearInterval(glassId) });
      mainNode = mainGain;
    }
    else if (type === 'GEN_SLEEP_WAVES') {
      const bufferSize = ctx.sampleRate * 10;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + (0.02 * white)) / 1.02;
        data[i] = lastOut * 3.5;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer; source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      const waveGain = ctx.createGain();
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.06, ctx.currentTime); 
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.35, ctx.currentTime);
      lfo.connect(lfoGain).connect(waveGain.gain);
      waveGain.gain.setValueAtTime(0.3, ctx.currentTime);
      source.connect(filter).connect(waveGain).connect(voiceGain);
      source.start(); lfo.start();
      extraNodes.push(source, filter, waveGain, lfo, lfoGain);
      mainNode = waveGain;
    }
    else if (type === 'GEN_SLEEP_DRIFT') {
      const mainGain = ctx.createGain();
      mainGain.connect(voiceGain);
      if (reverbNodeRef.current) mainGain.connect(reverbNodeRef.current);
      
      const leftOsc = ctx.createOscillator();
      leftOsc.frequency.setValueAtTime(100, ctx.currentTime);
      const leftPanner = ctx.createStereoPanner();
      leftPanner.pan.setValueAtTime(-1, ctx.currentTime);
      const leftGain = ctx.createGain();
      leftGain.gain.setValueAtTime(0.1, ctx.currentTime);
      leftOsc.connect(leftPanner).connect(leftGain).connect(mainGain);
      
      const rightOsc = ctx.createOscillator();
      rightOsc.frequency.setValueAtTime(102, ctx.currentTime);
      const rightPanner = ctx.createStereoPanner();
      rightPanner.pan.setValueAtTime(1, ctx.currentTime);
      const rightGain = ctx.createGain();
      rightGain.gain.setValueAtTime(0.1, ctx.currentTime);
      rightOsc.connect(rightPanner).connect(rightGain).connect(mainGain);
      
      leftOsc.start(); rightOsc.start();
      extraNodes.push(leftOsc, rightOsc, leftPanner, rightPanner, leftGain, rightGain);

      const playPad = () => {
        const now = ctx.currentTime;
        const freqs = [200, 300, 400, 600];
        freqs.forEach((f, i) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f + (Math.random() * 2), now);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0, now);
          g.gain.linearRampToValueAtTime(0.03, now + 4);
          g.gain.linearRampToValueAtTime(0, now + 12);
          osc.connect(g).connect(mainGain);
          osc.start(now); osc.stop(now + 12.1);
          extraNodes.push(osc, g);
        });
      };
      const padId = setInterval(playPad, 8000);
      playPad();
      extraNodes.push({ stop: () => clearInterval(padId) });
      mainNode = mainGain;
    }
    else if (type === 'GEN_SLEEP_RAIN') {
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 5, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < buffer.length; i++) data[i] = Math.random() * 2 - 1;
      const source = ctx.createBufferSource();
      source.buffer = buffer; source.loop = true;
      
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.setValueAtTime(800, ctx.currentTime);
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass'; hp.frequency.setValueAtTime(100, ctx.currentTime);
      
      const rainGain = ctx.createGain();
      rainGain.gain.setValueAtTime(0.2, ctx.currentTime);
      source.connect(lp).connect(hp).connect(rainGain).connect(voiceGain);
      source.start();
      extraNodes.push(source, lp, hp, rainGain);
      mainNode = rainGain;
    }
    else if (type === 'GEN_SLEEP_SPACE') {
      const mainGain = ctx.createGain();
      mainGain.connect(voiceGain);
      if (reverbNodeRef.current) mainGain.connect(reverbNodeRef.current);
      
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine'; osc1.frequency.setValueAtTime(40, ctx.currentTime);
      const osc2 = ctx.createOscillator();
      osc2.type = 'sine'; osc2.frequency.setValueAtTime(60.2, ctx.currentTime);
      const g = ctx.createGain();
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.04, ctx.currentTime);
      const lfoG = ctx.createGain();
      lfoG.gain.setValueAtTime(0.1, ctx.currentTime);
      lfo.connect(lfoG).connect(g.gain);
      g.gain.setValueAtTime(0.15, ctx.currentTime);
      
      osc1.connect(g); osc2.connect(g);
      g.connect(mainGain);
      osc1.start(); osc2.start(); lfo.start();
      extraNodes.push(osc1, osc2, g, lfo, lfoG);
      mainNode = mainGain;
    }
    else if (type.startsWith('GEN_RAAG')) {
      const mainGain = ctx.createGain();
      mainGain.connect(voiceGain);
      if (reverbNodeRef.current) mainGain.connect(reverbNodeRef.current);
      
      const isBilawal = type.includes('BILAWAL');
      const isYaman = type.includes('YAMAN');
      const isBhairavi = type.includes('BHAIRAVI');
      const isMalhar = type.includes('MALHAR');
      const isDarbari = type.includes('DARBARI');
      const isBihag = type.includes('BIHAG');

      // Enhanced Tanpura Simulation
      const baseTonic = isDarbari ? 110 : (isBilawal ? 130.81 : 146.83); 
      
      const createTanpuraString = (f: number, pan: number, pluckInterval: number, delay: number) => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, ctx.currentTime);
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, ctx.currentTime);
        
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, ctx.currentTime);
        
        const panner = ctx.createStereoPanner();
        panner.pan.setValueAtTime(pan, ctx.currentTime);
        
        const runPluck = () => {
          const pluckNow = ctx.currentTime;
          g.gain.cancelScheduledValues(pluckNow);
          g.gain.setValueAtTime(0, pluckNow);
          g.gain.linearRampToValueAtTime(0.08, pluckNow + 0.1);
          g.gain.exponentialRampToValueAtTime(0.001, pluckNow + pluckInterval * 0.9);
        };

        const intervalId = setInterval(runPluck, pluckInterval * 1000);
        setTimeout(runPluck, delay * 1000);
        
        osc.connect(filter).connect(g).connect(panner).connect(mainGain);
        osc.start();
        extraNodes.push(osc, filter, g, panner, { stop: () => clearInterval(intervalId) });
      };

      // Traditional 4-string Tanpura tuning (Pa Sa Sa Sa_low)
      const paFreq = isBilawal ? baseTonic * 1.5 : (isYaman ? baseTonic * 1.5 : baseTonic * 1.5);
      createTanpuraString(paFreq, -0.6, 4.0, 0);       // First string (Pa)
      createTanpuraString(baseTonic, -0.2, 4.0, 1.0);  // Second string (Sa)
      createTanpuraString(baseTonic, 0.2, 4.0, 2.0);   // Third string (Sa)
      createTanpuraString(baseTonic / 2, 0.6, 4.0, 3.0); // Fourth string (Low Sa)

      const scaleBilawal = [0, 2, 4, 5, 7, 9, 11, 12];
      const scaleYaman = [0, 2, 4, 6, 7, 9, 11, 12]; // Tivra Ma (sharp 4)
      const scaleBhairavi = [0, 1, 3, 5, 7, 8, 10, 12];
      const scaleMalhar = [0, 2, 5, 7, 10, 12];
      const scaleDarbari = [0, 2, 3, 5, 7, 8, 10, 12];
      const scaleBihag = [0, 4, 5, 6, 7, 11, 12];
      
      const activeScale = isBilawal ? scaleBilawal : 
                         isYaman ? scaleYaman :
                         isBhairavi ? scaleBhairavi : 
                         isMalhar ? scaleMalhar : 
                         isDarbari ? scaleDarbari : scaleBihag;

      const playRaagNote = () => {
        const now = ctx.currentTime;
        const interval = activeScale[Math.floor(Math.random() * activeScale.length)];
        const oct = Math.random() > 0.7 ? 2 : 1;
        const freq = baseTonic * Math.pow(2, (interval + oct * 12) / 12);
        
        const osc = ctx.createOscillator();
        osc.type = 'triangle'; 
        osc.frequency.setValueAtTime(freq, now);
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);
        
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, now);
        
        // Humanized Envelope
        const attack = isYaman ? 1.5 : 0.8;
        const decay = isYaman ? 8.0 : 4.0;
        g.gain.linearRampToValueAtTime(0.1, now + attack);
        g.gain.exponentialRampToValueAtTime(0.0001, now + decay);
        
        // Meend (Soulful Slides)
        if (Math.random() > 0.4) {
          const nextInt = activeScale[Math.floor(Math.random() * activeScale.length)];
          const nextFreq = baseTonic * Math.pow(2, (nextInt + oct * 12) / 12);
          osc.frequency.exponentialRampToValueAtTime(nextFreq, now + (isYaman ? 2.5 : 1.2));
        }

        // Gamak (Subtle Vibrato)
        const vibrato = ctx.createOscillator();
        vibrato.frequency.setValueAtTime(5 + Math.random() * 2, now);
        const vGain = ctx.createGain();
        vGain.gain.setValueAtTime(0, now);
        vGain.gain.linearRampToValueAtTime(freq * 0.015, now + attack);
        vibrato.connect(vGain).connect(osc.frequency);
        vibrato.start();

        osc.connect(filter).connect(g).connect(mainGain);
        osc.start(now); osc.stop(now + decay + 1);
        vibrato.stop(now + decay + 1);
        extraNodes.push(osc, filter, g, vibrato, vGain);
      };

      const noteInterval = isYaman ? 6000 : (isBilawal ? 3500 : 5000);
      const raagSeqId = setInterval(playRaagNote, noteInterval);
      playRaagNote();
      extraNodes.push({ stop: () => clearInterval(raagSeqId) });
      mainNode = mainGain;
    }
    else if (type.startsWith('GEN_HARMONIUM')) {
      const mainGain = ctx.createGain();
      mainGain.connect(voiceGain);
      if (reverbNodeRef.current) mainGain.connect(reverbNodeRef.current);
      
      const isMeditate = type.includes('MEDITATE');
      const baseFreq = isMeditate ? 110 : 146.83;
      
      [1, 1.002, 2, 2.004, 3].forEach((ratio, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(baseFreq * ratio, ctx.currentTime);
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400 + (i * 100), ctx.currentTime);
        
        const g = ctx.createGain();
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.1 + (i * 0.05), ctx.currentTime);
        const lfoG = ctx.createGain();
        lfoG.gain.setValueAtTime(0.05, ctx.currentTime);
        lfo.connect(lfoG).connect(g.gain);
        
        g.gain.setValueAtTime(0.1 / (i + 1), ctx.currentTime);
        osc.connect(filter).connect(g).connect(mainGain);
        osc.start(); lfo.start();
        extraNodes.push(osc, filter, g, lfo, lfoG);
      });
      mainNode = mainGain;
    }
    else if (type.startsWith('GEN_CALM_WAVES')) {
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 8, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < buffer.length; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + (0.02 * white)) / 1.02;
        data[i] = lastOut * 3.5;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer; source.loop = true;
      const waveGain = ctx.createGain();
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.1, ctx.currentTime); 
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.4, ctx.currentTime);
      lfo.connect(lfoGain).connect(waveGain.gain);
      waveGain.gain.setValueAtTime(0.4, ctx.currentTime);
      source.connect(waveGain).connect(voiceGain);
      source.start(); lfo.start();
      extraNodes.push(lfo, source);
      mainNode = waveGain;
    } 
    else {
      const osc = ctx.createOscillator(); 
      osc.frequency.setValueAtTime(432, ctx.currentTime);
      osc.connect(voiceGain); 
      osc.start();
      mainNode = osc;
    }

    activeVoicesRef.current.push({
      id: trackId,
      gainNode: voiceGain,
      nodes: [...extraNodes, mainNode]
    });

    setIsPlaying(true);
    setIsAnyTrackPlaying(true);
    setIsLoading(false);
  }, [isMuted, setIsAnyTrackPlaying]);

  const toggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      if (masterGainRef.current && audioContextRef.current) {
        masterGainRef.current.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.5);
      }
    } else {
      if (masterGainRef.current && audioContextRef.current) {
        masterGainRef.current.gain.linearRampToValueAtTime(volume, audioContextRef.current.currentTime + 0.5);
        if (!isPlaying && activeVoicesRef.current.length === 0) {
          handleTrackSelect(currentTrack);
        }
      }
    }
  }, [isMuted, volume, isPlaying, currentTrack]);

  const drawVisualizer = useCallback(() => {
    if (!canvasRef.current || !analyzerRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const bufferLength = analyzerRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyzerRef.current.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radiusBase = Math.min(centerX, centerY) * 0.45;
    [0.7, 0.4, 0.2].forEach((opacity, layer) => {
      ctx.beginPath(); ctx.lineWidth = 2 + (layer * 1);
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * (radiusBase * (0.3 + layer * 0.4));
        const angle = (i / bufferLength) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * (radiusBase + barHeight);
        const y = centerY + Math.sin(angle) * (radiusBase + barHeight);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.stroke();
    });
    animationRef.current = requestAnimationFrame(drawVisualizer);
  }, []);

  useEffect(() => {
    if (isPlaying && !isMuted) drawVisualizer();
    else if (animationRef.current) cancelAnimationFrame(animationRef.current);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isPlaying, isMuted, drawVisualizer]);

  useEffect(() => {
    let timer: any;
    if (isPlaying && !isMuted) timer = setInterval(() => setSessionTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isPlaying, isMuted]);

  useEffect(() => {
    return () => { stopAllVoices(false); setIsAnyTrackPlaying(false); };
  }, [setIsAnyTrackPlaying, stopAllVoices]);

  const handleTrackSelect = async (track: any) => {
    if (isLoading) return;
    const success = await initAudioEngine();
    if (!success) return;
    const ctx = audioContextRef.current!;

    if (activeVoicesRef.current.some(v => v.id === track.id) && isPlaying && !isMuted) {
      stopAllVoices(true);
      return;
    }

    setIsLoading(true);
    if (activeVoicesRef.current.length > 0) {
      activeVoicesRef.current.forEach(voice => {
        const now = ctx.currentTime;
        voice.gainNode.gain.cancelScheduledValues(now);
        voice.gainNode.gain.linearRampToValueAtTime(0, now + CROSSFADE_TIME);
        setTimeout(() => {
          voice.nodes.forEach(node => {
            try { if (node.stop) node.stop(); node.disconnect(); } catch (e) {}
          });
          voice.gainNode.disconnect();
          activeVoicesRef.current = activeVoicesRef.current.filter(v => v !== voice);
        }, CROSSFADE_TIME * 1000 + 100);
      });
    }

    if (isMuted) setIsMuted(false);
    setCurrentTrack(track);
    startGenerator(track.url, track.id);
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const PlayingIndicator = () => (
    <div className="flex items-center gap-0.5 h-3">
      {[0.4, 1.0, 0.6].map((h, i) => (
        <div key={i} className="w-0.5 bg-teal-400 animate-pulse rounded-full" style={{ height: '100%', animationDelay: `${i * 0.15}s`, transform: `scaleY(${h})` }} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-10 animate-in slide-in-from-bottom-8 duration-1000 px-2 md:px-0 pb-40">
      <div className="flex justify-between items-center px-4 md:px-0">
        <button onClick={() => { stopAllVoices(true); setView(AppView.DASHBOARD); }} className="flex items-center gap-2 text-teal-800 label-caps text-[10px] md:text-xs hover:gap-3 transition-all outline-none">
          <ChevronLeft size={16} /> Exit Sanctuary
        </button>
        <div className="flex items-center gap-3">
           <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-md rounded-lg border border-white shadow-sm">
             <Timer size={14} className="text-teal-600" />
             <span className="text-[10px] font-black uppercase tracking-widest">{formatTime(sessionTime)}</span>
           </div>
           <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white shadow-sm">
            <button onClick={toggleMute} className={`transition-colors outline-none ${isMuted ? 'text-slate-400' : 'text-teal-700'}`} title={isMuted ? "Unmute" : "Mute Audio"}>
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <input type="range" min="0" max="1" step="0.01" className="w-16 md:w-20 h-1 bg-teal-100 rounded-full appearance-none cursor-pointer accent-teal-700" value={volume} onChange={(e) => {
                const val = parseFloat(e.target.value);
                setVolume(val);
                if (masterGainRef.current && audioContextRef.current && !isMuted) {
                  masterGainRef.current.gain.setValueAtTime(val, audioContextRef.current.currentTime);
                }
              }}
            />
          </div>
        </div>
      </div>
      
      <div className="relative h-[320px] md:h-[480px] rounded-[2.5rem] md:rounded-[4rem] overflow-hidden group shadow-[0_30px_80px_-15px_rgba(0,0,0,0.3)] transition-all duration-1000 ring-1 ring-white/15">
        <div className={`absolute inset-0 bg-gradient-to-br ${currentTrack.color} transition-all duration-[2500ms] scale-105 group-hover:scale-100`}></div>
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"></div>
        <canvas ref={canvasRef} width={1000} height={1000} className="absolute inset-0 w-full h-full opacity-70 pointer-events-none mix-blend-screen" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 md:p-12 z-10 text-center">
          <div className="space-y-4 md:space-y-6 animate-in zoom-in-95 duration-1000 max-w-4xl">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-3xl rounded-full border border-white/20 mx-auto">
               <Sparkles size={14} className="text-teal-300" />
               <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-white/90">Mode: {currentTrack.genre}</p>
             </div>
             <div className="space-y-2">
               <h2 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter drop-shadow-2xl text-white leading-[0.9]">{currentTrack.name}</h2>
               {currentTrack.benefit && <p className="text-sm md:text-xl text-teal-50 font-medium italic drop-shadow-lg opacity-90 leading-relaxed max-w-2xl mx-auto">"{currentTrack.benefit}"</p>}
             </div>
          </div>
          <div className="mt-8 md:mt-12">
            <div className="flex items-center gap-4 md:gap-8 px-6 py-2.5 bg-white/10 backdrop-blur-3xl rounded-full border border-white/20 shadow-2xl">
              <button className="text-white/30 hover:text-white transition-all hover:scale-110 p-2"><SkipBack size={18} fill="currentColor" /></button>
              <button onClick={() => handleTrackSelect(currentTrack)} disabled={isLoading} className={`w-12 h-12 md:w-16 md:h-16 bg-white text-teal-950 rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all ${isLoading ? 'opacity-50' : ''}`}>
                {isLoading ? <Loader2 size={20} className="animate-spin text-teal-700" /> : isPlaying && !isMuted ? <Pause size={28} fill="currentColor" /> : <Play size={28} className="ml-1" fill="currentColor" />}
              </button>
              <button className="text-white/30 hover:text-white transition-all hover:scale-110 p-2"><SkipForward size={18} fill="currentColor" /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 px-4 md:px-6">
          <div className="space-y-1">
            <h3 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">Meditation Library</h3>
            <p className="text-slate-500 font-bold text-xs md:text-sm max-w-xl">Clinical-grade procedural audio for cognitive restoration.</p>
          </div>
          <div className="flex p-1 bg-slate-100/80 backdrop-blur-3xl rounded-xl gap-0.5 border border-white shadow-inner flex-wrap">
            {CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCat(cat.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeCat === cat.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                <cat.icon size={12} className={activeCat === cat.id ? cat.color : ''} />{cat.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 px-4 md:px-6">
          {filteredTracks.map(item => {
            const isActive = currentTrack.id === item.id;
            return (
              <button key={item.id} onClick={() => handleTrackSelect(item)} className={`group relative flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 text-left overflow-hidden outline-none ${isActive && !isMuted ? 'bg-slate-950 text-white shadow-lg ring-2 ring-teal-500/30' : 'bg-white hover:bg-slate-50 border border-slate-100'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isActive && !isMuted ? 'bg-teal-600/20' : `bg-gradient-to-br ${item.color} text-white shadow-sm group-hover:scale-105`}`}>
                  {isActive && isLoading ? <Loader2 size={18} className="animate-spin text-teal-400" /> : isActive && isPlaying && !isMuted ? <Pause size={18} fill="currentColor" className="text-teal-400" /> : <item.icon size={18} />}
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-black tracking-tight leading-tight truncate">{item.name}</p>
                    {isActive && isPlaying && !isMuted && <PlayingIndicator />}
                  </div>
                  <p className={`text-[8px] uppercase font-black tracking-[0.2em] ${isActive && !isMuted ? 'text-teal-400' : 'text-slate-400'}`}>{item.genre}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;