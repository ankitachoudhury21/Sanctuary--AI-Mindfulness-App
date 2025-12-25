
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { AppView } from '../types';
import { 
  Play, Pause, SkipBack, SkipForward, Sparkles, Radio, 
  ChevronLeft, Loader2, Volume2, Infinity, Zap, Brain, 
  WavesIcon, Timer, Shuffle, Volume, Wind, Cloud, Moon,
  Target, Heart, Sun, Activity, ZapIcon, Music, Ghost, Droplets, Flame, Stars
} from 'lucide-react';

interface Props {
  setView: (view: AppView) => void;
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
  // PIANO
  { id: 'p1', cat: 'piano', name: 'Midnight Piano', genre: 'Minimalist', icon: Music, color: 'from-slate-900 to-blue-900', url: 'GEN_PIANO_MIDNIGHT', benefit: 'Dark, brooding minor-key piano for deep nocturnal focus.' },
  { id: 'p2', cat: 'piano', name: 'Morning Ivory', genre: 'Uplifting', icon: Sun, color: 'from-yellow-100 to-orange-200', url: 'GEN_PIANO_MORNING', benefit: 'Bright, major-key scales to welcome the morning sun.' },
  { id: 'p3', cat: 'piano', name: 'Rainy Keys', genre: 'Melancholic', icon: Droplets, color: 'from-blue-200 to-slate-400', url: 'GEN_PIANO_RAIN', benefit: 'Soft piano melodies layered with a gentle procedural rain.' },
  { id: 'p4', cat: 'piano', name: 'Ethereal Grand', genre: 'Ambient', icon: Sparkles, color: 'from-purple-100 to-indigo-300', url: 'GEN_PIANO_ETHEREAL', benefit: 'Slow, long-sustaining keys drifting through a vast hall.' },

  // FOCUS
  { id: 'f1', cat: 'focus', name: 'Deep Work', genre: 'Calm Waves', icon: WavesIcon, color: 'from-blue-50 to-teal-300', url: 'GEN_CALM_WAVES', benefit: 'Rhythmic shore waves for cognitive clarity.' },
  { id: 'f4', cat: 'focus', name: 'Raag Yaman', genre: 'Evening', icon: Music, color: 'from-orange-200 to-amber-600', url: 'GEN_RAAG_YAMAN', benefit: 'Cultivates peace and romantic devotion.' },
  { id: 'f6', cat: 'focus', name: 'Logic Reeds', genre: 'Reed Focus', icon: Wind, color: 'from-amber-100 to-orange-300', url: 'GEN_HARMONIUM_FOCUS', benefit: 'Steady reed drone for rhythmic cognitive flow.' },
  { id: 'f5', cat: 'focus', name: 'Hamsadhwani', genre: 'Bright', icon: Sparkles, color: 'from-yellow-200 to-orange-400', url: 'GEN_RAAG_HAMSADHWANI', benefit: 'Brightens the mind and removes obstacles.' },

  // MEDITATE
  { id: 'm5', cat: 'meditate', name: 'Celestial Voyage', genre: 'Astro-Ambient', icon: Stars, color: 'from-slate-900 via-indigo-950 to-purple-900', url: 'GEN_SPACE_ASTRO', benefit: 'Ethereal cosmic melodies and deep stardust frequencies.' },
  { id: 'm6', cat: 'meditate', name: 'Sacred Bellows', genre: 'Reed Zen', icon: Wind, color: 'from-amber-200 to-orange-700', url: 'GEN_HARMONIUM_MEDITATE', benefit: 'Traditional harmonium drone for spiritual depth.' },
  { id: 'm3', cat: 'meditate', name: 'Raag Bhairavi', genre: 'Healing', icon: Heart, color: 'from-rose-100 to-teal-400', url: 'GEN_RAAG_BHAIRAVI', benefit: 'The Queen of Ragas. Deeply emotional and cathartic.' },
  { id: 'm4', cat: 'meditate', name: 'Shankarabharanam', genre: 'Majestic', icon: Brain, color: 'from-blue-100 to-indigo-500', url: 'GEN_RAAG_SHANKAR', benefit: 'Royal, majestic, and grounded stability.' },
  { id: 'm2', cat: 'meditate', name: 'Bageshri', genre: 'Midnight', icon: Moon, color: 'from-indigo-600 to-slate-900', url: 'GEN_RAAG_BAGESHRI', benefit: 'Soothing longing and quiet meditation.' },

  // RELAX
  { id: 'r4', cat: 'relax', name: 'Malhar', genre: 'Monsoon', icon: Cloud, color: 'from-slate-700 to-blue-900', url: 'GEN_RAAG_MALHAR', benefit: 'The Raga of Rain. Mystical and powerful.' },
  { id: 'r7', cat: 'relax', name: 'Reed Flow', genre: 'Twilight', icon: Music, color: 'from-orange-300 to-red-900', url: 'GEN_HARMONIUM_RELAX', benefit: 'Earthy reed textures for evening relaxation.' },
  { id: 'r2', cat: 'relax', name: 'Darbari', genre: 'Regal', icon: Moon, color: 'from-indigo-900 to-blue-950', url: 'GEN_RAAG_DARBARI', benefit: 'Grave, regal, and deeply grounding.' },
  { id: 'r5', cat: 'relax', name: 'Amritavarshini', genre: 'Rain', icon: Droplets, color: 'from-cyan-400 to-blue-800', url: 'GEN_RAAG_AMRIT', benefit: 'Auspicious Carnatic raga known to bring rain.' },

  // SLEEP
  { id: 's6', cat: 'sleep', name: 'Darbari Sleep', genre: 'Midnight Zen', icon: Moon, color: 'from-blue-950 to-black', url: 'GEN_RAAG_DARBARI_SLEEP', benefit: 'Deep, slow nocturnal variation of the royal raga.' },
  { id: 's7', cat: 'sleep', name: 'Nidra Drone', genre: 'Frequency', icon: Stars, color: 'from-indigo-900 to-slate-950', url: 'GEN_NIDRA', benefit: 'Layered 174Hz and 396Hz Solfeggio for grounding.' },
  { id: 's5', cat: 'sleep', name: 'Celestial Reeds', genre: 'Sleep Delta', icon: Wind, color: 'from-slate-800 to-black', url: 'GEN_HARMONIUM_SLEEP', benefit: 'Low-frequency reeds with integrated Delta waves.' },
  { id: 's1', cat: 'sleep', name: 'Deep Ocean', genre: 'Tides', icon: WavesIcon, color: 'from-blue-900 to-black', url: 'GEN_BROWN_TIDES' },
];

const MusicPlayer: React.FC<Props> = ({ setView }) => {
  const [activeCat, setActiveCat] = useState('focus');
  const [currentTrack, setCurrentTrack] = useState(TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [sessionTime, setSessionTime] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const reverbNodeRef = useRef<ConvolverNode | null>(null);

  const filteredTracks = useMemo(() => {
    if (activeCat === 'all') return TRACKS;
    return TRACKS.filter(t => t.cat === activeCat);
  }, [activeCat]);

  const createImpulseResponse = (ctx: AudioContext, duration: number, decay: number) => {
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const impulse = ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      const envelope = Math.pow(1 - n, decay);
      left[i] = (Math.random() * 2 - 1) * envelope;
      right[i] = (Math.random() * 2 - 1) * envelope;
    }
    return impulse;
  };

  const initAudioEngine = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
        audioContextRef.current = new AudioContextClass();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') await ctx.resume();

      if (!gainNodeRef.current) {
        gainNodeRef.current = ctx.createGain();
        gainNodeRef.current.gain.value = volume;
        gainNodeRef.current.connect(ctx.destination);
      }

      if (!reverbNodeRef.current) {
        const reverb = ctx.createConvolver();
        reverb.buffer = createImpulseResponse(ctx, 4.5, 3.5);
        const reverbGain = ctx.createGain();
        reverbGain.gain.value = 0.35; 
        reverb.connect(reverbGain).connect(gainNodeRef.current);
        reverbNodeRef.current = reverb;
      }

      if (!analyzerRef.current) {
        const analyzer = ctx.createAnalyser();
        analyzer.fftSize = 256;
        analyzer.smoothingTimeConstant = 0.75;
        analyzerRef.current = analyzer;
        analyzer.connect(gainNodeRef.current);
      }
      return true;
    } catch (err) {
      console.warn("Audio Context blocked", err);
      return false;
    }
  }, [volume]);

  const stopGenerator = useCallback(() => {
    if ((window as any).generatorNodeRef) {
      try {
        if ('stop' in (window as any).generatorNodeRef) (window as any).generatorNodeRef.stop();
        (window as any).generatorNodeRef.disconnect();
      } catch (e) {}
      (window as any).generatorNodeRef = null;
    }
    if ((window as any).extraNodes) {
      (window as any).extraNodes.forEach((n: any) => {
        try { 
          if (n.stop) n.stop(); 
          n.disconnect(); 
        } catch (e) {}
      });
      (window as any).extraNodes = [];
    }
  }, []);

  const startGenerator = useCallback((type: string) => {
    if (!audioContextRef.current || !analyzerRef.current) return;
    stopGenerator();
    const ctx = audioContextRef.current;
    const dest = analyzerRef.current;
    const extraNodes: any[] = [];
    let node: AudioNode;

    // PIANO ENGINE
    if (type.startsWith('GEN_PIANO')) {
      const mainGain = ctx.createGain();
      mainGain.connect(dest);
      if (reverbNodeRef.current) mainGain.connect(reverbNodeRef.current);

      const playPianoNote = (freq: number, startTime: number, duration: number, vel: number) => {
        const now = startTime;
        
        // 1. Hammer Impact (Noise burst)
        const hammerBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
        const hammerData = hammerBuffer.getChannelData(0);
        for(let i=0; i<hammerData.length; i++) hammerData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i/hammerData.length, 5);
        const hammerSource = ctx.createBufferSource();
        hammerSource.buffer = hammerBuffer;
        const hammerFilt = ctx.createBiquadFilter();
        hammerFilt.type = 'bandpass';
        hammerFilt.frequency.setValueAtTime(freq * 2, now);
        const hGain = ctx.createGain();
        hGain.gain.setValueAtTime(0.02 * vel, now);
        hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        hammerSource.connect(hammerFilt).connect(hGain).connect(mainGain);
        hammerSource.start(now);
        extraNodes.push(hammerSource, hammerFilt, hGain);

        // 2. Fundamental & Harmonics
        const harmonicRatios = [1, 2, 3.01, 4, 5];
        harmonicRatios.forEach((ratio, idx) => {
          const osc = ctx.createOscillator();
          osc.type = idx === 0 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq * ratio, now);
          
          const g = ctx.createGain();
          g.gain.setValueAtTime(0, now);
          g.gain.linearRampToValueAtTime((0.15 / (idx + 1)) * vel, now + 0.005);
          g.gain.exponentialRampToValueAtTime(0.0001, now + (duration * (1.2 - idx * 0.1)));
          
          osc.connect(g).connect(mainGain);
          osc.start(now);
          osc.stop(now + duration + 1);
          extraNodes.push(osc, g);
        });
      };

      const isMidnight = type.includes('MIDNIGHT');
      const isMorning = type.includes('MORNING');
      const isRain = type.includes('RAIN');
      const isEthereal = type.includes('ETHEREAL');

      const scale = isMidnight ? [0, 3, 7, 8, 10, 12] : // Minor
                   isMorning ? [0, 2, 4, 7, 9, 12] :  // Major Pentatonic
                   isRain ? [0, 2, 3, 7, 9, 12] :     // Melancholic
                   [0, 4, 7, 11, 14, 18];             // Major 13th

      const baseTonic = isMidnight ? 110 : // A2
                        isMorning ? 146.83 : // D3
                        isRain ? 130.81 : // C3
                        98.00; // G2

      if (isRain) {
        // Procedural Rain layer
        const rainBuff = ctx.createBuffer(1, ctx.sampleRate * 5, ctx.sampleRate);
        const rData = rainBuff.getChannelData(0);
        for(let i=0; i<rainBuff.length; i++) rData[i] = Math.random() * 2 - 1;
        const rSrc = ctx.createBufferSource();
        rSrc.buffer = rainBuff;
        rSrc.loop = true;
        const rFilt = ctx.createBiquadFilter();
        rFilt.type = 'lowpass';
        rFilt.frequency.value = 1500;
        const rg = ctx.createGain();
        rg.gain.value = 0.08;
        rSrc.connect(rFilt).connect(rg).connect(mainGain);
        rSrc.start();
        extraNodes.push(rSrc, rFilt, rg);
      }

      const seqInterval = isMidnight ? 5000 : 
                          isMorning ? 3500 :
                          isRain ? 6000 : 8000;

      const runSequence = () => {
        const interval = scale[Math.floor(Math.random() * scale.length)];
        const oct = Math.floor(Math.random() * 2) + (isEthereal ? 1 : 0);
        const f = baseTonic * Math.pow(2, (interval + oct * 12) / 12);
        const dur = isEthereal ? 12 : 5;
        playPianoNote(f, ctx.currentTime, dur, 0.7 + Math.random() * 0.3);
      };

      const seqId = setInterval(runSequence, seqInterval + (Math.random() * 2000));
      runSequence(); // Start first note
      extraNodes.push({ stop: () => clearInterval(seqId) });
      node = mainGain;
    }
    else if (type.startsWith('GEN_WHITE') || type.startsWith('GEN_BROWN') || type === 'GEN_CALM_WAVES') {
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 10, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < buffer.length; i++) {
        const white = Math.random() * 2 - 1;
        if (type.includes('BROWN') || type === 'GEN_CALM_WAVES') {
          lastOut = (lastOut + (0.02 * white)) / 1.02;
          data[i] = lastOut * 3.5;
        } else {
          data[i] = white * 0.4;
        }
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      
      if (type === 'GEN_BROWN_TIDES' || type === 'GEN_CALM_WAVES') {
        const isCalm = type === 'GEN_CALM_WAVES';
        const waveGain = ctx.createGain();
        const lfo = ctx.createOscillator();
        lfo.frequency.value = isCalm ? 0.12 : 0.08; 
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = isCalm ? 0.45 : 0.35;
        lfo.connect(lfoGain).connect(waveGain.gain);
        waveGain.gain.value = 0.5;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = isCalm ? 1200 : 400;
        filter.Q.value = isCalm ? 1 : 5;

        source.connect(filter).connect(waveGain).connect(dest);

        if (!isCalm) {
          const rumbleOsc = ctx.createOscillator();
          rumbleOsc.type = 'sine';
          rumbleOsc.frequency.value = 35;
          const rumbleGain = ctx.createGain();
          rumbleGain.gain.value = 0.15;
          rumbleOsc.connect(rumbleGain).connect(dest);
          rumbleOsc.start();
          extraNodes.push(rumbleOsc, rumbleGain);

          const bubbleOsc = ctx.createOscillator();
          bubbleOsc.type = 'sine';
          bubbleOsc.frequency.value = 150;
          const bubbleLfo = ctx.createOscillator();
          bubbleLfo.frequency.value = 0.2;
          const bubbleGain = ctx.createGain();
          bubbleGain.gain.value = 0;
          const bLfoG = ctx.createGain();
          bLfoG.gain.value = 0.05;
          bubbleLfo.connect(bLfoG).connect(bubbleGain.gain);
          bubbleOsc.connect(bubbleGain).connect(dest);
          bubbleOsc.start();
          bubbleLfo.start();
          extraNodes.push(bubbleOsc, bubbleLfo, bubbleGain);
        }

        if (reverbNodeRef.current) {
          waveGain.connect(reverbNodeRef.current);
        }

        source.start();
        lfo.start();
        
        extraNodes.push(lfo, source);
        node = waveGain;
      } else {
        source.connect(dest);
        source.start();
        node = source;
      }
    } 
    else if (type === 'GEN_NIDRA') {
      const mainGain = ctx.createGain();
      mainGain.connect(dest);
      const freqs = [174, 396, 528, 70]; 
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f;
        const g = ctx.createGain();
        g.gain.value = 0.08 / (i + 1);
        const pulse = ctx.createOscillator();
        pulse.frequency.value = 0.05 + (i * 0.02);
        const pGain = ctx.createGain();
        pGain.gain.value = 0.02;
        pulse.connect(pGain).connect(g.gain);
        pulse.start();
        osc.connect(g).connect(mainGain);
        osc.start();
        extraNodes.push(osc, pulse);
      });
      node = mainGain;
    }
    else if (type === 'GEN_SPACE_ASTRO') {
      const mainGain = ctx.createGain();
      mainGain.connect(dest);
      if (reverbNodeRef.current) mainGain.connect(reverbNodeRef.current);

      // 1. The Deep Void (Low Frequency Drones)
      [40, 62, 85].forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f;
        const g = ctx.createGain();
        g.gain.value = 0.04;
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.01 + (i * 0.005);
        const lg = ctx.createGain();
        lg.gain.value = 0.02;
        lfo.connect(lg).connect(g.gain);
        lfo.start();
        osc.connect(g).connect(mainGain);
        osc.start();
        extraNodes.push(osc, lfo);
      });

      // 2. Cosmic Winds (Sweeping Resonant Filters)
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 5, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseBuffer.length; i++) noiseData[i] = Math.random() * 2 - 1;
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;
      const sweepFilter = ctx.createBiquadFilter();
      sweepFilter.type = 'bandpass';
      sweepFilter.Q.value = 15;
      const sweepLfo = ctx.createOscillator();
      sweepLfo.frequency.value = 0.03;
      const sweepLfoGain = ctx.createGain();
      sweepLfoGain.gain.value = 1000;
      sweepLfo.connect(sweepLfoGain).connect(sweepFilter.frequency);
      sweepFilter.frequency.value = 1200;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.015;
      noiseSource.connect(sweepFilter).connect(noiseGain).connect(mainGain);
      noiseSource.start();
      sweepLfo.start();
      extraNodes.push(noiseSource, sweepLfo);

      // 3. Pulsars & Distant Stars (Random Twinkles)
      const triggerStar = () => {
        const now = ctx.currentTime;
        const starOsc = ctx.createOscillator();
        starOsc.type = 'sine';
        starOsc.frequency.value = 800 + Math.random() * 2500;
        const starGain = ctx.createGain();
        starGain.gain.setValueAtTime(0, now);
        starGain.gain.linearRampToValueAtTime(0.008, now + 3);
        starGain.gain.exponentialRampToValueAtTime(0.0001, now + 12);
        starOsc.connect(starGain).connect(mainGain);
        starOsc.start();
        starOsc.stop(now + 13);
      };
      const starInterval = setInterval(triggerStar, 5000 + Math.random() * 7000);
      extraNodes.push({ stop: () => clearInterval(starInterval) });

      // 4. Celestial Melody (Ethereal Space Harmonies)
      const playSpaceNote = () => {
        const now = ctx.currentTime;
        const root = 130.81; // C3
        const scale = [0, 4, 7, 11, 14, 18, 23]; // C Maj13 (Open, airy harmony)
        const interval = scale[Math.floor(Math.random() * scale.length)];
        const freq = root * Math.pow(2, interval / 12);

        const osc = ctx.createOscillator();
        osc.type = 'sine'; 
        osc.frequency.setValueAtTime(freq, now);
        
        // Add subtle pitch movement for a "floating" effect
        const vibrato = ctx.createOscillator();
        vibrato.frequency.value = 0.4 + Math.random() * 0.2;
        const vGain = ctx.createGain();
        vGain.gain.value = 3;
        vibrato.connect(vGain).connect(osc.frequency);
        vibrato.start();

        const env = ctx.createGain();
        env.gain.setValueAtTime(0, now);
        env.gain.linearRampToValueAtTime(0.02, now + 6); // Slow swell
        env.gain.exponentialRampToValueAtTime(0.001, now + 24); // Long trailing release

        const panner = ctx.createPanner();
        panner.setPosition(Math.random() * 2 - 1, 0, 1);

        osc.connect(env).connect(panner).connect(mainGain);
        osc.start(now);
        osc.stop(now + 25);
        
        // Lifecycle management for internal nodes
        setTimeout(() => {
          vibrato.stop();
          vibrato.disconnect();
          osc.disconnect();
          env.disconnect();
          panner.disconnect();
        }, 26000);
      };
      
      const melodyInterval = setInterval(playSpaceNote, 14000 + Math.random() * 6000);
      playSpaceNote(); // Start first note immediately
      extraNodes.push({ stop: () => clearInterval(melodyInterval) });

      node = mainGain;
    }
    else if (type.startsWith('GEN_HARMONIUM')) {
      const mainGain = ctx.createGain();
      mainGain.connect(dest);
      if (reverbNodeRef.current) mainGain.connect(reverbNodeRef.current);
      const isSleep = type.includes('SLEEP');
      const baseFreq = isSleep ? 55.00 : type.includes('FOCUS') ? 146.83 : 110.00;
      
      const harmonics = [1, 1.01, 1.5, 2, 2.02, 3];
      harmonics.forEach((h, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.value = baseFreq * h;
        const reedFilter = ctx.createBiquadFilter();
        reedFilter.type = 'lowpass';
        reedFilter.frequency.value = isSleep ? 400 : 800 + (h * 100);
        const g = ctx.createGain();
        g.gain.value = isSleep ? 0.03 / h : 0.05 / h;
        const bellowsLfo = ctx.createOscillator();
        bellowsLfo.frequency.value = isSleep ? 0.2 : 0.4 + (Math.random() * 0.1); 
        const bellowsGain = ctx.createGain();
        bellowsGain.gain.value = 0.02;
        bellowsLfo.connect(bellowsGain).connect(g.gain);
        bellowsLfo.start();
        osc.connect(reedFilter).connect(g).connect(mainGain);
        osc.start();
        extraNodes.push(osc, bellowsLfo);
      });

      if (isSleep) {
        const bBase = 100;
        const merger = ctx.createChannelMerger(2);
        const b1 = ctx.createOscillator(); b1.frequency.value = bBase;
        const b2 = ctx.createOscillator(); b2.frequency.value = bBase + 2.5;
        const bg1 = ctx.createGain(); bg1.gain.value = 0.05;
        const bg2 = ctx.createGain(); bg2.gain.value = 0.05;
        b1.connect(bg1).connect(merger, 0, 0); b2.connect(bg2).connect(merger, 0, 1);
        b1.start(); b2.start(); merger.connect(mainGain);
        extraNodes.push(b1, b2);
      }
      
      if (type.includes('MEDITATE') || type.includes('RELAX')) {
        const triggerNote = () => {
          const now = ctx.currentTime;
          const scale = [0, 2, 4, 7, 9, 12];
          const interval = scale[Math.floor(Math.random() * scale.length)];
          const freq = baseFreq * 2 * Math.pow(2, interval / 12);
          const mOsc = ctx.createOscillator();
          mOsc.type = 'sawtooth';
          mOsc.frequency.value = freq;
          const f = ctx.createBiquadFilter();
          f.type = 'lowpass';
          f.frequency.value = 1200;
          const env = ctx.createGain();
          env.gain.setValueAtTime(0, now);
          env.gain.linearRampToValueAtTime(0.04, now + 1.5);
          env.gain.exponentialRampToValueAtTime(0.001, now + 6);
          mOsc.connect(f).connect(env).connect(mainGain);
          mOsc.start();
          mOsc.stop(now + 7);
        };
        const intervalId = setInterval(triggerNote, 8000 + Math.random() * 4000);
        extraNodes.push({ stop: () => clearInterval(intervalId) });
      }
      node = mainGain;
    }
    else if (type.startsWith('GEN_RAAG')) {
      const mainGain = ctx.createGain();
      mainGain.connect(dest);
      if (reverbNodeRef.current) mainGain.connect(reverbNodeRef.current);
      
      const isSleepVariant = type.includes('SLEEP');
      const tonic = (type.includes('DARBARI') || type.includes('BAGESHRI')) ? 110.00 : 146.83;
      
      const config: Record<string, { intervals: number[], tanpura: number[], catchPhrase?: number[] }> = {
        'GEN_RAAG_YAMAN': { 
          intervals: [0, 2, 4, 6, 7, 9, 11, 12], 
          tanpura: [1, 1.5, 2],
          catchPhrase: [-1, 2, 4, 2, 0] // Opening motif: Ni Re Ga Re Sa
        },
        'GEN_RAAG_BHAIRAVI': { 
          intervals: [0, 1, 3, 5, 7, 8, 10, 12], 
          tanpura: [1, 1.33, 2],
          catchPhrase: [0, 1, 3, 1, 0] // Bhairavi catch: Sa Re(k) Ga(k) Re(k) Sa
        },
        'GEN_RAAG_DARBARI': { intervals: [0, 2, 3, 5, 7, 8, 10, 12], tanpura: [1, 1.5, 2] },
        'GEN_RAAG_DARBARI_SLEEP': { intervals: [0, 2, 3, 7, 8, 12], tanpura: [1, 1.5, 2] },
        'GEN_RAAG_BAGESHRI': { intervals: [0, 2, 3, 5, 7, 9, 10, 12], tanpura: [1, 1.33, 2] },
        'GEN_RAAG_SHANKAR': { intervals: [0, 2, 4, 5, 7, 9, 11, 12], tanpura: [1, 1.5, 2] },
        'GEN_RAAG_HAMSADHWANI': { intervals: [0, 2, 4, 7, 11, 12], tanpura: [1, 1.5, 2] },
        'GEN_RAAG_MALHAR': { intervals: [0, 2, 3, 5, 7, 10, 11, 12], tanpura: [1, 1.5, 2] },
        'GEN_RAAG_AMRIT': { intervals: [0, 4, 6, 7, 11, 12], tanpura: [1, 1.5, 2] }
      };
      
      const raag = config[type] || config['GEN_RAAG_DARBARI'];
      raag.tanpura.forEach(h => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = tonic * h;
        const g = ctx.createGain();
        g.gain.value = (isSleepVariant ? 0.02 : 0.04) / h;
        const pluckLfo = ctx.createOscillator();
        pluckLfo.frequency.value = isSleepVariant ? 0.1 : 0.2 + Math.random() * 0.1;
        const pluckGain = ctx.createGain();
        pluckGain.gain.value = 0.01;
        pluckLfo.connect(pluckGain).connect(g.gain);
        pluckLfo.start();
        osc.connect(g).connect(mainGain);
        osc.start();
        extraNodes.push(osc, pluckLfo);
      });

      const playSingleNote = (interval: number, startTime: number, duration: number, volume: number) => {
        const freq = (tonic / (isSleepVariant ? 2 : 1)) * Math.pow(2, interval / 12);
        const osc = ctx.createOscillator();
        osc.type = (type.includes('DARBARI') || type.includes('BAGESHRI')) ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        
        const env = ctx.createGain();
        env.gain.setValueAtTime(0, startTime);
        env.gain.linearRampToValueAtTime(volume, startTime + 1);
        env.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = isSleepVariant ? 300 : 1000;
        
        osc.connect(filter).connect(env).connect(mainGain);
        osc.start(startTime);
        osc.stop(startTime + duration + 1);
        extraNodes.push(osc);
      };

      // Play Opening Catch Phrase if available
      let startOffset = 0;
      if (raag.catchPhrase) {
        raag.catchPhrase.forEach((interval, idx) => {
          playSingleNote(interval, ctx.currentTime + startOffset, isSleepVariant ? 8 : 5, isSleepVariant ? 0.04 : 0.08);
          startOffset += isSleepVariant ? 4 : 2.5;
        });
      }

      const playRandomNote = () => {
        const now = ctx.currentTime;
        const interval = raag.intervals[Math.floor(Math.random() * raag.intervals.length)];
        playSingleNote(interval, now, isSleepVariant ? 12 : 7, isSleepVariant ? 0.04 : 0.08);
      };
      
      const intervalDelay = isSleepVariant ? 10000 + Math.random() * 5000 : 6000 + Math.random() * 2000;
      // Delay start of random notes if phrase is playing
      const melInterval = setInterval(playRandomNote, intervalDelay);
      
      node = mainGain;
      (node as any).stop = () => {
        clearInterval(melInterval);
        extraNodes.forEach(n => { try { n.stop(); } catch(e){} });
      };
    } else {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      let freq = 432;
      if (type === 'GEN_SINE_528') freq = 528;
      else if (type === 'GEN_SINE_174') freq = 174;
      osc.frequency.value = freq;
      osc.connect(dest);
      osc.start();
      node = osc;
    }
    (window as any).generatorNodeRef = node;
    (window as any).extraNodes = extraNodes;
    setIsPlaying(true);
    setIsLoading(false);
  }, [stopGenerator]);

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
    const radiusBase = Math.min(centerX, centerY) * 0.4;
    [0.6, 0.4].forEach((opacity, layer) => {
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * (radiusBase * (0.3 + layer * 0.2));
        const angle = (i / bufferLength) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * (radiusBase + barHeight);
        const y = centerY + Math.sin(angle) * (radiusBase + barHeight);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    });
    animationRef.current = requestAnimationFrame(drawVisualizer);
  }, []);

  useEffect(() => {
    if (isPlaying) drawVisualizer();
    else if (animationRef.current) cancelAnimationFrame(animationRef.current);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isPlaying, drawVisualizer]);

  useEffect(() => {
    let timer: any;
    if (isPlaying) timer = setInterval(() => setSessionTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleTrackSelect = async (track: any) => {
    await initAudioEngine();
    if (currentTrack.id === track.id && isPlaying) {
      stopGenerator();
      setIsPlaying(false);
      return;
    }
    setIsLoading(true);
    setCurrentTrack(track);
    startGenerator(track.url);
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 md:space-y-10 animate-in slide-in-from-bottom-8 duration-1000 px-2 md:px-0 pb-40">
      <div className="flex justify-between items-center px-4 md:px-0">
        <button 
          onClick={() => { stopGenerator(); setView(AppView.DASHBOARD); }}
          className="flex items-center gap-2 text-teal-800 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs hover:gap-3 transition-all"
        >
          <ChevronLeft size={16} /> Exit Sanctuary
        </button>
        <div className="flex items-center gap-3">
           <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-md rounded-lg border border-white shadow-sm">
             <Timer size={14} className="text-teal-600" />
             <span className="text-[10px] font-black uppercase tracking-widest">{formatTime(sessionTime)}</span>
           </div>
           <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white shadow-sm">
            <Volume2 size={14} className="text-teal-700" />
            <input 
              type="range" min="0" max="1" step="0.01" 
              className="w-16 md:w-20 h-1 bg-teal-100 rounded-full appearance-none cursor-pointer accent-teal-700"
              value={volume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setVolume(val);
                if (gainNodeRef.current) gainNodeRef.current.gain.value = val;
              }}
            />
          </div>
        </div>
      </div>

      <div className="relative h-[280px] md:h-[380px] rounded-[2rem] md:rounded-[4rem] overflow-hidden group shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] transition-all duration-1000 ring-1 ring-white/20">
        <div className={`absolute inset-0 bg-gradient-to-br ${currentTrack.color} transition-all duration-[2000ms]`}></div>
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
        <canvas ref={canvasRef} width={600} height={600} className="absolute inset-0 w-full h-full opacity-50 pointer-events-none" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 md:p-8 z-10 text-center space-y-6 md:space-y-8">
          <div className="space-y-3">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-3xl rounded-full border border-white/10">
               <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></span>
               <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white/90">{currentTrack.genre}</p>
             </div>
             <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter drop-shadow-lg text-white leading-tight">
               {currentTrack.name}
             </h2>
             {currentTrack.benefit && (
               <p className="text-sm md:text-base text-white/70 font-medium italic max-w-md mx-auto leading-relaxed animate-in fade-in duration-1000 delay-500">
                 "{currentTrack.benefit}"
               </p>
             )}
          </div>
          <div className="flex items-center gap-8 md:gap-14">
            <button className="text-white/20 hover:text-white transition-all hover:scale-110"><SkipBack size={32} fill="currentColor" /></button>
            <button 
              onClick={() => handleTrackSelect(currentTrack)}
              disabled={isLoading}
              className="w-20 h-20 md:w-32 md:h-32 bg-white text-teal-950 rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all relative"
            >
              {isLoading ? <Loader2 size={36} className="animate-spin text-teal-700" /> : isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} className="ml-2" fill="currentColor" />}
            </button>
            <button className="text-white/20 hover:text-white transition-all hover:scale-110"><SkipForward size={32} fill="currentColor" /></button>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-4 md:px-6">
          <div className="space-y-2">
            <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">Soundscapes</h3>
            <p className="text-slate-500 font-bold text-sm md:text-lg max-w-xl">High-fidelity procedural audio for deep restorative meditation.</p>
          </div>
          <div className="flex p-1.5 bg-slate-100/80 backdrop-blur-3xl rounded-2xl gap-1 border border-white shadow-inner flex-wrap">
            {CATEGORIES.map((cat) => (
              <button 
                key={cat.id} 
                onClick={() => setActiveCat(cat.id)} 
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeCat === cat.id ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <cat.icon size={14} className={activeCat === cat.id ? cat.color : ''} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-6">
          {filteredTracks.map(item => {
            const isActive = currentTrack.id === item.id;
            return (
              <button 
                key={item.id} 
                onClick={() => handleTrackSelect(item)}
                className={`
                  group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 text-left overflow-hidden outline-none
                  ${isActive ? 'bg-slate-900 text-white shadow-lg ring-2 ring-teal-500/20' : 'bg-white hover:bg-slate-50 border border-slate-100'}
                `}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isActive ? 'bg-teal-600/20' : `bg-gradient-to-br ${item.color} text-white shadow-sm group-hover:scale-105`}`}>
                  {isActive && isLoading ? <Loader2 size={20} className="animate-spin text-teal-400" /> : <item.icon size={20} />}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="text-sm md:text-base font-black tracking-tight leading-tight truncate">{item.name}</p>
                  <p className={`text-[9px] uppercase font-black tracking-[0.15em] ${isActive ? 'text-teal-400' : 'text-slate-400'}`}>{item.genre}</p>
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
