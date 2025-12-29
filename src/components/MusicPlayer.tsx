
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
  { id: 'classical', label: 'Classical', icon: Music, color: 'text-rose-600', bg: 'bg-rose-50' },
  { id: 'all', label: 'All', icon: Activity, color: 'text-slate-600', bg: 'bg-slate-50' },
];

const TRACKS = [
  { id: 'f7', cat: 'focus', name: 'Raag Bilawal', genre: 'Morning Focus', icon: Sun, color: 'from-yellow-200 to-orange-400', url: 'GEN_RAAG_BILAWAL', benefit: 'The quintessential morning raga. Bright, uplifting major scales to energize your focus.' },
  { id: 'f4', cat: 'focus', name: 'Raag Yaman', genre: 'Deep Flow', icon: Music, color: 'from-orange-100 to-amber-600', url: 'GEN_RAAG_YAMAN', benefit: 'The raga of peace. Lydian melodies that promote creative devotion and steady attention.' },
  { id: 'f1', cat: 'focus', name: 'Deep Work', genre: 'Alpha Waves', icon: WavesIcon, color: 'from-blue-50 to-teal-300', url: 'GEN_CALM_WAVES', benefit: '10Hz Alpha entrainment layered with brown noise to drown out office distractions.' },
  { id: 'm7', cat: 'meditate', name: 'Ancient Temple', genre: 'Bronze Zen', icon: Brain, color: 'from-amber-220 to-yellow-600', url: 'GEN_BRONZE_ZEN', benefit: 'Multi-layered Tibetan singing bowls with inharmonic overtones and deep grounding drones.' },
  { id: 'm8', cat: 'meditate', name: 'Forest Breath', genre: 'Procedural Flute', icon: Wind, color: 'from-green-100 to-teal-200', url: 'GEN_FLUTE_MEDITATE', benefit: 'Breathtaking Shakuhachi melodies synchronized with procedural birds and rustling leaves.' },
  { id: 'm5', cat: 'meditate', name: 'Celestial Voyage', genre: 'Astro-Ambient', icon: Stars, color: 'from-slate-900 via-indigo-950 to-purple-900', url: 'GEN_SPACE_ASTRO', benefit: 'Ethereal cosmic melodies and deep stardust frequencies for astral projection.' },
  { id: 'r6', cat: 'relax', name: 'Raag Bageshri', genre: 'Midnight Soothing', icon: Moon, color: 'from-indigo-800 to-purple-950', url: 'GEN_RAAG_BAGESHRI', benefit: 'A soothing midnight melody. Evokes deep emotional reflection and sweet tranquility for the evening.' },
  { id: 'p1', cat: 'piano', name: 'Midnight Debug', genre: 'Felt Reflection', icon: Music, color: 'from-slate-950 to-indigo-950', url: 'GEN_PIANO_MIDNIGHT', benefit: 'Deep, felt-damped melodies designed to slow down your racing thoughts after a long sprint.' },
  { id: 'p2', cat: 'piano', name: 'Solar Syntax', genre: 'Bright Prelude', icon: Sun, color: 'from-amber-100 to-orange-200', url: 'GEN_PIANO_MORNING', benefit: 'High-frequency major scales to clear cognitive fog and reset your morning flow state.' },
  // Fix: Removed extraneous '連合' character at the end of the string.
  { id: 'p3', cat: 'piano', name: 'Monsoon Logic', genre: 'Rainy Resonance', icon: Droplets, color: 'from-blue-200 to-slate-400', url: 'GEN_PIANO_RAIN', benefit: 'A steady rhythmic downpour paired with low-octave chords to drown out office chatter.' },
  { id: 'p4', cat: 'piano', name: 'Latency Void', genre: 'Ambient Grand', icon: Zap, color: 'from-slate-900 via-slate-800 to-slate-950', url: 'GEN_PIANO_VOID', benefit: 'Ultra-slow, drifting melodies that create a mental buffer between work and rest.' },
  { id: 'p6', cat: 'piano', name: 'Glass Focus', genre: 'Minimalist Zen', icon: Activity, color: 'from-blue-50 to-teal-100', url: 'GEN_PIANO_GLASS', benefit: 'Precision-timed, minimal notes for entering a state of high-performance flow.' },
  { id: 'r3', cat: 'relax', name: 'Raag Bhairavi', genre: 'Healing', icon: Heart, color: 'from-rose-100 to-teal-400', url: 'GEN_RAAG_BHAIRAVI', benefit: 'The Queen of Ragas. A soul-stirring healing vibration suited for any time of day.' },
  { id: 'r2', cat: 'relax', name: 'Raag Darbari', genre: 'Regal Night', icon: Moon, color: 'from-indigo-900 to-blue-950', url: 'GEN_RAAG_DARBARI', benefit: 'Grave, regal, and deeply grounding melodies for late-night reflection.' },
  { id: 's1', cat: 'sleep', name: 'Lunar Tide', genre: 'Deep Ocean Delta', icon: WavesIcon, color: 'from-[#0b1d2e] to-[#1e3a8a]', url: 'GEN_SLEEP_WAVES', benefit: 'Warm, low-pass ocean frequencies. No high-end noise, just the heavy, rhythmic breath of the sea.' },
  { id: 's4', cat: 'sleep', name: 'Velvet Rain', genre: 'Forest Mist', icon: Droplets, color: 'from-emerald-900 to-slate-950', url: 'GEN_SLEEP_RAINFOREST', benefit: 'Soft tropical rain filtered through thick forest leaves. Strictly low-frequency textures for deep rest.' },
  // New Classical Tracks
  { id: 'sitar1', cat: 'classical', name: 'Sitar Raga: Dawn Serenity', genre: 'Indian Classical', icon: Music, color: 'from-orange-400 to-red-600', url: 'GEN_SITAR_DAWN', benefit: 'Awaken with the soulful melodies of sitar, fostering inner peace and focus.' },
  { id: 'tabla1', cat: 'classical', name: 'Tabla Taal: Rhythmic Flow', genre: 'Indian Percussion', icon: Music, color: 'from-amber-800 to-gray-600', url: 'GEN_TABLA_RHYTHM', benefit: 'Ground yourself with the intricate and meditative rhythms of the tabla.' },
  { id: 'guitar1', cat: 'classical', name: 'Classical Guitar: Forest Echoes', genre: 'Acoustic Serenade', icon: Music, color: 'from-green-400 to-blue-600', url: 'GEN_GUITAR_FOREST', benefit: 'Gentle classical guitar refrains that evoke calm forest landscapes.' },
  { id: 'harmonium1', cat: 'classical', name: 'Harmonium Drone: Inner Sanctum', genre: 'Sustained Harmony', icon: Music, color: 'from-purple-400 to-pink-600', url: 'GEN_HARMONIUM_SANCTUM', benefit: 'Immerse in deep, sustained harmonies for profound meditation and relaxation.' },
];

const CROSSFADE_TIME = 2.5; 

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
      if (ctx.state === 'suspended') await ctx.resume();
      if (!masterGainRef.current) {
        masterGainRef.current = ctx.createGain();
        masterGainRef.current.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime);
        masterGainRef.current.connect(ctx.destination);
      }
      if (!reverbNodeRef.current) {
        const reverb = ctx.createConvolver();
        const length = ctx.sampleRate * 4.0;
        const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
        for (let i = 0; i < length; i++) {
          const env = Math.pow(1 - i / length, 3.5);
          impulse.getChannelData(0)[i] = (Math.random() * 2 - 1) * env;
          impulse.getChannelData(1)[i] = (Math.random() * 2 - 1) * env;
        }
        reverb.buffer = impulse;
        const reverbGain = ctx.createGain();
        reverbGain.gain.setValueAtTime(0.35, ctx.currentTime);
        reverb.connect(reverbGain).connect(masterGainRef.current);
        reverbNodeRef.current = reverb;
      }
      if (!analyzerRef.current) {
        const analyzer = ctx.createAnalyser();
        analyzer.fftSize = 512;
        // Smoother visualization for sleep
        analyzer.smoothingTimeConstant = currentTrack.cat === 'sleep' ? 0.95 : 0.85;
        analyzer.connect(masterGainRef.current);
        analyzerRef.current = analyzer;
      }
      return true;
    } catch (err) { return false; }
  }, [volume, isMuted, currentTrack.cat]);

  const stopAllVoices = useCallback((fade = true) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;
    activeVoicesRef.current.forEach(voice => {
      const now = ctx.currentTime;
      if (fade) {
        voice.gainNode.gain.cancelScheduledValues(now);
        voice.gainNode.gain.linearRampToValueAtTime(0, now + CROSSFADE_TIME);
        setTimeout(() => {
          voice.nodes.forEach(n => { try { if(n.stop) n.stop(); n.disconnect(); } catch(e){} });
          voice.gainNode.disconnect();
        }, CROSSFADE_TIME * 1000 + 100);
      } else {
        voice.nodes.forEach(n => { try { if(n.stop) n.stop(); n.disconnect(); } catch(e){} });
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

    // Robust helper for clamping values to valid AudioParam ranges
    const safeValue = (value: number, min: number, max: number, defaultValue: number) => {
      if (isNaN(value) || !isFinite(value)) {
        return defaultValue;
      }
      return Math.max(min, Math.min(max, value));
    };

    const safeFreq = (value: number) => safeValue(value, 0.001, ctx.sampleRate / 2 - 1, 0.001);
    const safeGain = (value: number) => safeValue(value, 0.0001, 100, 0.0001); // Max gain 100
    const safeQ = (value: number) => safeValue(value, 0.0001, 1000, 0.0001); // Max Q 1000
    const safePan = (value: number) => safeValue(value, -1, 1, 0); // Pan -1 to 1
    const safeDetune = (value: number) => safeValue(value, -12000, 12000, 0); // Detune +/- 12000 cents

    const voiceGain = ctx.createGain();
    voiceGain.gain.setValueAtTime(0, now);
    voiceGain.gain.linearRampToValueAtTime(1, now + CROSSFADE_TIME);
    voiceGain.connect(analyzerRef.current);
    const extraNodes: any[] = [];
    let mainNode: AudioNode;

    if (type.startsWith('GEN_RAAG')) {
      const isBilawal = type.includes('BILAWAL');
      const isYaman = type.includes('YAMAN');
      const isBageshri = type.includes('BAGESHRI');
      const isDarbari = type.includes('DARBARI');
      
      const r_mainGain = ctx.createGain();
      r_mainGain.connect(voiceGain);
      if (reverbNodeRef.current) r_mainGain.connect(reverbNodeRef.current);

      const tonic = (isDarbari || isBageshri) ? safeFreq(110) : (isYaman ? safeFreq(146.83) : safeFreq(130.81));
      
      // Drone strings: Bilawal has a brighter Sa-Pa-Sa' tuning with high Chikari plucks
      const strings = isBilawal 
        ? [safeFreq(tonic * 0.75), tonic, safeFreq(tonic * 1.5), safeFreq(tonic * 2.0), safeFreq(tonic * 4.0)] 
        : [safeFreq((isBageshri ? tonic * 1.334 : tonic * 1.5)), tonic, tonic, safeFreq(tonic * 0.5), safeFreq(tonic * 0.25)];

      strings.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = isBilawal ? 'triangle' : 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        
        const javari = ctx.createBiquadFilter();
        javari.type = 'bandpass';
        // Brighter 'buzzing' bridge harmonics for Bilawal
        javari.frequency.setValueAtTime(safeFreq(isBilawal ? 1800 + (idx * 350) : 1200 + (idx * 200)), now);
        javari.Q.setValueAtTime(safeQ(isBilawal ? 15 : 8), now);
        
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(safeFreq(isBilawal ? 900 : 400), now);
        
        const sg = ctx.createGain();
        sg.gain.setValueAtTime(0, now);
        
        const pan = ctx.createStereoPanner();
        pan.pan.setValueAtTime(safePan((idx - 2) * 0.4), now);
        
        // Pluck cycle: Bilawal follows a tighter, more rhythmic 'Chikari' pulse
        const pluckInterval = isBilawal ? 3.8 : 4.5; 
        const pluck = () => {
          const t = ctx.currentTime;
          sg.gain.cancelScheduledValues(t);
          sg.gain.setValueAtTime(0, t);
          // Sharper attack for Bilawal plucks
          sg.gain.linearRampToValueAtTime(safeGain(isBilawal ? 0.12 : 0.07), t + (isBilawal ? 0.04 : 0.1));
          sg.gain.exponentialRampToValueAtTime(0.0001, t + pluckInterval - 0.1);
        };
        const intervalId = setInterval(pluck, pluckInterval * 1000);
        setTimeout(pluck, idx * (isBilawal ? 600 : 1100));
        
        osc.connect(lp).connect(sg);
        osc.connect(javari).connect(sg);
        sg.connect(pan).connect(r_mainGain);
        osc.start();
        extraNodes.push(osc, lp, javari, sg, pan, { stop: () => clearInterval(intervalId) });
      });

      // Scale definitions
      const scaleB = [0, 2, 4, 5, 7, 9, 11, 12]; // Pure Shuddha Swaras (Major Scale)
      const scaleY = [0, 2, 4, 6, 7, 9, 11, 12];
      const scaleBag = [0, 3, 5, 7, 10, 12];
      const activeScale = isYaman ? scaleY : isBageshri ? scaleBag : scaleB;
      
      const playMelodyNote = () => {
        const t = ctx.currentTime;
        // Bilawal favors ascending movements (Arohana) for an uplifting morning feel
        const intervalIndex = isBilawal 
          ? Math.floor(Math.random() * 4) + 2 // Focus on upper tetrachord
          : Math.floor(Math.random() * activeScale.length);
        
        const interval = activeScale[intervalIndex % activeScale.length];
        const octave = isBilawal ? (Math.random() > 0.4 ? 2 : 1) : (Math.random() > 0.8 ? 2 : 1);
        const freq = safeFreq(tonic * Math.pow(2, (interval + octave * 12) / 12));
        
        const mOsc = ctx.createOscillator();
        // Lead texture: Sitar-like filtered triangle for Bilawal
        mOsc.type = isBilawal ? 'triangle' : (isBageshri ? 'sine' : 'triangle'); 
        mOsc.frequency.setValueAtTime(freq, t);
        
        const mFilter = ctx.createBiquadFilter();
        mFilter.type = 'lowpass';
        mFilter.frequency.setValueAtTime(safeFreq(isBilawal ? 2800 : (isBageshri ? 1000 : 800)), t);
        
        const mGain = ctx.createGain();
        mGain.gain.setValueAtTime(0, t);
        
        // Fast, energetic articulation for Bilawal morning focus
        const attack = isBilawal ? 0.08 : (isBageshri ? 0.6 : 0.2);
        const decay = isBilawal ? 3.2 : (isBageshri ? 5.0 : 4.0);
        mGain.gain.linearRampToValueAtTime(safeGain(isBilawal ? 0.18 : 0.13), t + attack);
        mGain.gain.exponentialRampToValueAtTime(0.0001, t + decay);

        // Slide logic: Bilawal often has 'straight' notes but with crystalline vibrato
        if (Math.random() > 0.6 && isBilawal) {
          const nextInt = activeScale[(intervalIndex + 1) % activeScale.length];
          const nextFreq = safeFreq(tonic * Math.pow(2, (nextInt + octave * 12) / 12));
          mOsc.frequency.exponentialRampToValueAtTime(nextFreq, t + 0.8);
        }

        const vib = ctx.createOscillator();
        vib.frequency.setValueAtTime(safeFreq(isBilawal ? 6.8 : 5.5), t); 
        const vibG = ctx.createGain();
        vibG.gain.setValueAtTime(safeGain(freq * (isBilawal ? 0.006 : 0.012)), t);
        vib.connect(vibG).connect(mOsc.frequency);
        vib.start();

        mOsc.connect(mFilter).connect(mGain).connect(r_mainGain);
        mOsc.start(t); mOsc.stop(t + decay + 0.5);
        vib.stop(t + decay + 0.5);
        extraNodes.push(mOsc, mFilter, mGain, vib, vibG);
      };
      
      const melodyInterval = isBilawal ? 2400 : (isYaman ? 4500 : 4500);
      const mSeqId = setInterval(playMelodyNote, melodyInterval);
      playMelodyNote();
      extraNodes.push({ stop: () => clearInterval(mSeqId) });
      mainNode = r_mainGain;
    }
    else if (type === 'GEN_BRONZE_ZEN') {
      const b_mainGain = ctx.createGain();
      b_mainGain.connect(voiceGain);
      if (reverbNodeRef.current) b_mainGain.connect(reverbNodeRef.current);
      
      const playSingingBowl = (fundamental: number, force: number) => {
        const t = ctx.currentTime;
        const ratios = [1, 2.81, 5.23, 7.9, 10.6]; // Inharmonic ratios for bronze bowls
        ratios.forEach((ratio, i) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(safeFreq(fundamental * ratio), t);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(safeGain((0.15 / (i + 1)) * force), t + 0.1);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 12.0 - (i * 2));
          osc.connect(g).connect(b_mainGain);
          osc.start(t); osc.stop(t + 13);
          extraNodes.push(osc, g);
        });
      };

      const bowlInterval = setInterval(() => {
        const root = [safeFreq(110), safeFreq(164.81), safeFreq(196)][Math.floor(Math.random() * 3)];
        playSingingBowl(root, safeGain(0.6 + Math.random() * 0.4));
      }, 8000);
      playSingingBowl(safeFreq(110), safeGain(0.8));
      extraNodes.push({ stop: () => clearInterval(bowlInterval) });

      // Rim-rubbing texture
      const noise = ctx.createBufferSource();
      const nBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const nData = nBuf.getChannelData(0);
      for(let i=0; i<nBuf.length; i++) nData[i] = Math.random() * 2 - 1;
      noise.buffer = nBuf; noise.loop = true;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass'; 
      bp.frequency.setValueAtTime(safeFreq(440), now); 
      bp.Q.setValueAtTime(safeQ(50), now);
      const rimLfo = ctx.createOscillator(); 
      rimLfo.frequency.setValueAtTime(safeFreq(0.1), now);
      const rimLfoG = ctx.createGain(); 
      rimLfoG.gain.setValueAtTime(safeGain(0.05), now);
      const rimGain = ctx.createGain(); 
      rimGain.gain.setValueAtTime(safeGain(0.05), now);
      rimLfo.connect(rimLfoG).connect(rimGain.gain);
      noise.connect(bp).connect(rimGain).connect(b_mainGain);
      noise.start(); rimLfo.start();
      extraNodes.push(noise, bp, rimLfo, rimLfoG, rimGain);

      mainNode = b_mainGain;
    }
    else if (type === 'GEN_FLUTE_MEDITATE') {
      const f_mainGain = ctx.createGain();
      f_mainGain.connect(voiceGain);
      if (reverbNodeRef.current) f_mainGain.connect(reverbNodeRef.current);

      const playShakuhachi = () => {
        const t = ctx.currentTime;
        const scale = [0, 3, 5, 7, 10, 12];
        const root = 220; // A3
        const freq = safeFreq(root * Math.pow(2, scale[Math.floor(Math.random() * scale.length)] / 12));
        
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        
        // Breathy "Chiff" Noise
        const noise = ctx.createBufferSource();
        const nBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const nData = nBuf.getChannelData(0);
        for(let i=0; i<nBuf.length; i++) nData[i] = Math.random() * 2 - 1;
        noise.buffer = nBuf;
        const nLp = ctx.createBiquadFilter();
        nLp.type = 'lowpass'; 
        nLp.frequency.setValueAtTime(safeFreq(freq * 2), t);
        const nG = ctx.createGain();
        nG.gain.setValueAtTime(0, t);
        nG.gain.linearRampToValueAtTime(safeGain(0.08), t + 0.1);
        nG.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
        noise.connect(nLp).connect(nG).connect(f_mainGain);
        noise.start(t);
        
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(safeGain(0.15), t + 1.2);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 5.0);
        
        const vib = ctx.createOscillator();
        vib.frequency.setValueAtTime(safeFreq(4 + Math.random()), t);
        const vibG = ctx.createGain();
        vibG.gain.setValueAtTime(safeGain(freq * 0.02), t);
        vib.connect(vibG).connect(osc.frequency);
        vib.start(t);

        osc.connect(g).connect(f_mainGain);
        osc.start(t); osc.stop(t + 6);
        vib.stop(t + 6);
        extraNodes.push(osc, g, vib, vibG, noise, nLp, nG);
      };

      const fluteId = setInterval(playShakuhachi, 6000);
      playShakuhachi();
      extraNodes.push({ stop: () => clearInterval(fluteId) });

      // Biophonic Layer (Birds & Wind)
      const playBird = () => {
        const bt = ctx.currentTime;
        const birdOsc = ctx.createOscillator();
        birdOsc.type = 'sine';
        const startF = safeFreq(3000 + Math.random() * 2000);
        birdOsc.frequency.setValueAtTime(startF, bt);
        birdOsc.frequency.exponentialRampToValueAtTime(safeFreq(startF + 500), bt + 0.1);
        const birdG = ctx.createGain();
        birdG.gain.setValueAtTime(0, bt);
        birdG.gain.linearRampToValueAtTime(safeGain(0.015), bt + 0.05);
        birdG.gain.exponentialRampToValueAtTime(0.0001, bt + 0.2);
        birdOsc.connect(birdG).connect(f_mainGain);
        birdOsc.start(bt); birdOsc.stop(bt + 0.3);
      };
      const birdInterval = setInterval(() => { if(Math.random() > 0.6) playBird(); }, 3000);
      extraNodes.push({ stop: () => clearInterval(birdInterval) });

      mainNode = f_mainGain;
    }
    else if (type === 'GEN_SPACE_ASTRO') {
      const s_mainGain = ctx.createGain();
      s_mainGain.connect(voiceGain);
      if (reverbNodeRef.current) s_mainGain.connect(reverbNodeRef.current);
      const hum = ctx.createOscillator();
      hum.type = 'sine';
      hum.frequency.setValueAtTime(safeFreq(32.7), now);
      const humG = ctx.createGain();
      const humLfo = ctx.createOscillator();
      humLfo.frequency.setValueAtTime(safeFreq(0.05), now);
      const humLfoG = ctx.createGain();
      humLfoG.gain.setValueAtTime(safeGain(0.05), now);
      humLfo.connect(humLfoG).connect(humG.gain);
      humG.gain.setValueAtTime(safeGain(0.12), now);
      hum.connect(humG).connect(s_mainGain);
      hum.start(); humLfo.start();
      extraNodes.push(hum, humG, humLfo, humLfoG);
      const nebulaFreqs = [safeFreq(130.81), safeFreq(164.81), safeFreq(196.00), safeFreq(246.94), safeFreq(329.63)];
      nebulaFreqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now);
        const detuneLfo = ctx.createOscillator();
        detuneLfo.frequency.setValueAtTime(safeFreq(0.02 + i * 0.005), now);
        const detuneG = ctx.createGain();
        detuneG.gain.setValueAtTime(safeGain(5), now);
        detuneLfo.connect(detuneG).connect(osc.detune);
        const g = ctx.createGain();
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(safeFreq(0.03 + (i * 0.01)), now);
        const lfoG = ctx.createGain();
        lfoG.gain.setValueAtTime(safeGain(0.03), now);
        lfo.connect(lfoG).connect(g.gain);
        g.gain.setValueAtTime(safeGain(0.05), now);
        const pan = ctx.createStereoPanner();
        pan.pan.setValueAtTime(safePan(Math.sin(i)), now);
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(safeFreq(600 + i * 100), now);
        osc.connect(lp).connect(g).connect(pan).connect(s_mainGain);
        osc.start(); lfo.start(); detuneLfo.start();
        extraNodes.push(osc, lp, g, lfo, lfoG, pan, detuneLfo, detuneG);
      });
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 10, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noiseBuffer.length; i++) noiseData[i] = Math.random() * 2 - 1;
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = noiseBuffer; noiseSrc.loop = true;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(safeFreq(1000), now);
      const bpLfo = ctx.createOscillator();
      bpLfo.frequency.setValueAtTime(safeFreq(0.04), now);
      const bpLfoG = ctx.createGain();
      bpLfoG.gain.setValueAtTime(safeGain(600), now);
      bpLfo.connect(bpLfoG).connect(bp.frequency);
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(safeGain(0.04), now);
      noiseSrc.connect(bp).connect(nGain).connect(s_mainGain);
      noiseSrc.start(); bpLfo.start();
      extraNodes.push(noiseSrc, bp, bpLfo, bpLfoG, nGain);
      const playStarPing = () => {
        const t = ctx.currentTime;
        const pOsc = ctx.createOscillator();
        pOsc.type = 'sine';
        pOsc.frequency.setValueAtTime(safeFreq(2000 + Math.random() * 3000), t);
        const pG = ctx.createGain();
        pG.gain.setValueAtTime(0, t);
        pG.gain.linearRampToValueAtTime(safeGain(0.015), t + 0.1);
        pG.gain.exponentialRampToValueAtTime(0.0001, t + 6.0);
        const pPan = ctx.createStereoPanner();
        pPan.pan.setValueAtTime(safePan(Math.random() * 2 - 1), t);
        pOsc.connect(pG).connect(pPan).connect(s_mainGain);
        pOsc.start(t); pOsc.stop(t + 6.5);
      };
      const pulsarId = setInterval(playStarPing, 7500);
      playStarPing();
      extraNodes.push({ stop: () => clearInterval(pulsarId) });
      mainNode = s_mainGain;
    }
    else if (type.startsWith('GEN_SLEEP_WAVES')) {
      const w_mainGain = ctx.createGain();
      w_mainGain.connect(voiceGain);
      
      // Brownian Noise (Deep, bass-heavy noise)
      const bufferSize = ctx.sampleRate * 5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + (safeGain(0.02) * white)) / 1.02; // Simple brownian filter
        data[i] = lastOut * 4.0;
      }
      
      const bSource = ctx.createBufferSource();
      bSource.buffer = buffer; bSource.loop = true;
      
      // Strict Low-pass filter (no high notes)
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(safeFreq(150), now);
      lp.Q.setValueAtTime(safeQ(1), now);
      
      // Rhythmic gain LFO for breathing effect
      const bLfo = ctx.createOscillator();
      bLfo.frequency.setValueAtTime(safeFreq(0.08), now); // 12.5s cycle
      const bLfoG = ctx.createGain();
      bLfoG.gain.setValueAtTime(safeGain(0.3), now);
      bLfo.connect(bLfoG).connect(w_mainGain.gain);
      w_mainGain.gain.setValueAtTime(safeGain(0.4), now);
      
      // Deep sub-bass pulse
      const sub = ctx.createOscillator();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(safeFreq(40), now);
      const subG = ctx.createGain();
      subG.gain.setValueAtTime(safeGain(0.15), now);
      sub.connect(subG).connect(w_mainGain);
      sub.start();
      
      bSource.connect(lp).connect(w_mainGain);
      bSource.start(); bLfo.start();
      extraNodes.push(bSource, lp, bLfo, bLfoG, sub, subG);
      mainNode = w_mainGain;
    }
    else if (type.startsWith('GEN_SLEEP_RAINFOREST')) {
      const r_mainGain = ctx.createGain();
      r_mainGain.connect(voiceGain);
      
      // Muffled Rain Engine (Brownian noise + aggressive low-pass)
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lo = 0;
      for (let i = 0; i < bufferSize; i++) {
        const w = Math.random() * 2 - 1;
        lo = (lo + (safeGain(0.025) * w)) / 1.025;
        data[i] = lo * 3.0;
      }
      const rSrc = ctx.createBufferSource();
      rSrc.buffer = buffer; rSrc.loop = true;
      const rLp = ctx.createBiquadFilter();
      rLp.type = 'lowpass'; 
      rLp.frequency.setValueAtTime(safeFreq(220), now); // Low only
      
      // Volume LFO for "intensity shifts" in rain
      const rainLfo = ctx.createOscillator();
      rainLfo.frequency.setValueAtTime(safeFreq(0.04), now);
      const rainLfoG = ctx.createGain();
      rainLfoG.gain.setValueAtTime(safeGain(0.15), now);
      rainLfo.connect(rainLfoG).connect(r_mainGain.gain);
      r_mainGain.gain.setValueAtTime(safeGain(0.4), now);
      
      rSrc.connect(rLp).connect(r_mainGain);
      rSrc.start(); rainLfo.start();
      extraNodes.push(rSrc, rLp, rainLfo, rainLfoG);
      
      // Distant Forest "Thumps" (Grounding Low Notes)
      const playDistantDrop = () => {
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(safeFreq(60 + Math.random() * 40), t);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(safeGain(0.08), t + 0.1);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);
        osc.connect(g).connect(r_mainGain);
        osc.start(t); osc.stop(t + 3);
      };
      const dropId = setInterval(() => { if(Math.random() > 0.4) playDistantDrop(); }, 4000);
      extraNodes.push({ stop: () => clearInterval(dropId) });

      mainNode = r_mainGain;
    }
    else if (type.startsWith('GEN_CALM_WAVES')) {
      const w_mainGain = ctx.createGain();
      w_mainGain.connect(voiceGain);
      const bufferSize = ctx.sampleRate * 10;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let bLastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        bLastOut = (bLastOut + (safeGain(0.02) * white)) / 1.02;
        data[i] = bLastOut * 4.5; 
      }
      const bSource = ctx.createBufferSource();
      bSource.buffer = buffer; bSource.loop = true;
      const bLp = ctx.createBiquadFilter();
      bLp.type = 'lowpass'; bLp.frequency.setValueAtTime(safeFreq(450), now);
      const bLfo = ctx.createOscillator();
      bLfo.frequency.setValueAtTime(safeFreq(0.08), now); 
      const bLfoG = ctx.createGain();
      bLfoG.gain.setValueAtTime(safeGain(0.4), now);
      bLfo.connect(bLfoG).connect(w_mainGain.gain);
      w_mainGain.gain.setValueAtTime(safeGain(0.5), now);
      bSource.connect(bLp).connect(w_mainGain);
      bSource.start(); bLfo.start();
      extraNodes.push(bSource, bLp, bLfo, bLfoG);
      const carrier = safeFreq(100);
      const lOsc = ctx.createOscillator();
      lOsc.frequency.setValueAtTime(carrier, now);
      const rOsc = ctx.createOscillator();
      rOsc.frequency.setValueAtTime(safeFreq(carrier + 10), now);
      const lPan = ctx.createStereoPanner(); lPan.pan.setValueAtTime(safePan(-1), now);
      const rPan = ctx.createStereoPanner(); rPan.pan.setValueAtTime(safePan(1), now);
      const bGain = ctx.createGain();
      bGain.gain.setValueAtTime(safeGain(0.06), now); 
      lOsc.connect(lPan).connect(bGain);
      rOsc.connect(rPan).connect(bGain);
      bGain.connect(voiceGain);
      lOsc.start(); rOsc.start();
      extraNodes.push(lOsc, rOsc, lPan, rPan, bGain);
      mainNode = w_mainGain;
    }
    else if (type.startsWith('GEN_PIANO')) {
      const p_mainGain = ctx.createGain();
      p_mainGain.connect(voiceGain);
      if (reverbNodeRef.current) p_mainGain.connect(reverbNodeRef.current);
      const playPianoNote = (freq: number, startTime: number, duration: number, vel: number) => {
        const harmonicRatios = [1, 2, 3.01, 4, 5.02];
        harmonicRatios.forEach((ratio, idx) => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(safeFreq(freq * ratio), startTime);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0, startTime);
          g.gain.linearRampToValueAtTime(safeGain((0.25 / (idx + 1)) * vel), startTime + 0.005);
          g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * (1.5 - idx * 0.1));
          osc.connect(g).connect(p_mainGain);
          osc.start(startTime);
          osc.stop(startTime + duration + 1);
          extraNodes.push(osc, g);
        });
      };
      const scale = [0, 2, 4, 7, 9, 12];
      const runSeq = () => {
        const interval = scale[Math.floor(Math.random() * scale.length)];
        const f = safeFreq(130.81 * Math.pow(2, (interval + (Math.random() > 0.5 ? 12 : 0)) / 12));
        playPianoNote(f, ctx.currentTime, 4.0, 0.8);
      };
      const seqId = setInterval(runSeq, 3000);
      runSeq();
      extraNodes.push({ stop: () => clearInterval(seqId) });
      mainNode = p_mainGain;
    } 
    // NEW CLASSICAL INSTRUMENTS START HERE
    else if (type === 'GEN_SITAR_DAWN') {
      const s_mainGain = ctx.createGain();
      s_mainGain.gain.setValueAtTime(safeGain(0.3), now);
      s_mainGain.connect(voiceGain);
      if (reverbNodeRef.current) s_mainGain.connect(reverbNodeRef.current);

      const tonic = safeFreq(130.81); // C3
      const scale = [0, 2, 4, 5, 7, 9, 11, 12]; // Major scale for uplifting feel

      // Tanpura-like drone
      [tonic, safeFreq(tonic * 1.5), safeFreq(tonic * 2.0)].forEach((freqVal, idx) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freqVal, now);
        const g = ctx.createGain();
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(safeFreq(0.01 + Math.random() * 0.005), now);
        const lfoG = ctx.createGain();
        lfoG.gain.setValueAtTime(safeGain(0.1 + Math.random() * 0.05), now);
        lfo.connect(lfoG).connect(g.gain);
        g.gain.setValueAtTime(safeGain(0.1 / (idx + 1)), now);
        osc.connect(g).connect(s_mainGain);
        osc.start(); lfo.start();
        extraNodes.push(osc, g, lfo, lfoG);
      });

      const playSitarNote = () => {
        const t = ctx.currentTime;
        const interval = scale[Math.floor(Math.random() * scale.length)];
        const octave = Math.random() > 0.5 ? 1 : 2;
        const freq = safeFreq(tonic * Math.pow(2, (interval + octave * 12) / 12));

        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        const javariFilter = ctx.createBiquadFilter();
        javariFilter.type = 'bandpass';
        javariFilter.frequency.setValueAtTime(safeFreq(freq * (2 + Math.random())), t); // Dynamic buzz point
        javariFilter.Q.setValueAtTime(safeQ(15 + Math.random() * 10), t); // Sharp resonance for buzz

        const lpFilter = ctx.createBiquadFilter();
        lpFilter.type = 'lowpass';
        lpFilter.frequency.setValueAtTime(safeFreq(4000 + Math.random() * 2000), t);

        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(safeGain(0.2), t + 0.05); // Fast attack
        g.gain.exponentialRampToValueAtTime(0.0001, t + 4.0 + Math.random() * 2); // Long decay

        const vib = ctx.createOscillator(); // Vibrato
        vib.frequency.setValueAtTime(safeFreq(4 + Math.random() * 2), t);
        const vibG = ctx.createGain();
        vibG.gain.setValueAtTime(safeGain(freq * 0.01 + Math.random() * 0.005), t);
        vib.connect(vibG).connect(osc.frequency);
        vib.start(t);

        osc.connect(javariFilter).connect(g);
        osc.connect(lpFilter).connect(g); // Mix filtered and buzzy sounds
        g.connect(s_mainGain);
        osc.start(t);
        osc.stop(t + 6.5); // Ensure all nodes stop
        vib.stop(t + 6.5);

        extraNodes.push(osc, javariFilter, lpFilter, g, vib, vibG);
      };
      const sitarInterval = setInterval(playSitarNote, 3500 + Math.random() * 1500); 
      playSitarNote();
      extraNodes.push({ stop: () => clearInterval(sitarInterval) });
      mainNode = s_mainGain;
    }
    else if (type === 'GEN_TABLA_RHYTHM') {
      const t_mainGain = ctx.createGain();
      t_mainGain.gain.setValueAtTime(safeGain(0.4), now);
      t_mainGain.connect(voiceGain);
      if (reverbNodeRef.current) t_mainGain.connect(reverbNodeRef.current);

      const playBayan = (volume: number, freqOffset = 0) => {
        const t = ctx.currentTime;
        const baseFreq = safeFreq(60 + freqOffset);

        // Two slightly detuned sines for richer bass
        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(baseFreq, t);

        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(safeFreq(baseFreq * 1.005), t); // Slight detune

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(safeGain(0.8 * volume), t + 0.02); // Fast attack
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8); // Slightly longer decay

        const pitchEnv = ctx.createOscillator();
        pitchEnv.type = 'sine';
        pitchEnv.frequency.setValueAtTime(safeFreq(4), t); // LFO for pitch sweep
        const pitchGain = ctx.createGain();
        pitchGain.gain.setValueAtTime(safeGain(80), t); // Increased pitch sweep depth
        pitchEnv.connect(pitchGain).connect(osc1.frequency);
        pitchEnv.connect(pitchGain).connect(osc2.frequency); // Apply to both

        // Low-pass filter with envelope
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(safeFreq(2000), t); // Start open
        filter.frequency.exponentialRampToValueAtTime(safeFreq(100), t + 0.8); // Decay filter frequency
        filter.Q.setValueAtTime(safeQ(2), t); // Slight resonance

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain).connect(t_mainGain);

        osc1.start(t); osc2.start(t); pitchEnv.start(t);
        osc1.stop(t + 1.2); osc2.stop(t + 1.2); pitchEnv.stop(t + 1.2); // Stop all related nodes
        extraNodes.push(osc1, osc2, gain, pitchEnv, pitchGain, filter);
      };

      const playDayan = (volume: number, type: 'resonant' | 'sharp' | 'open') => {
        const t = ctx.currentTime;
        const baseFreq = type === 'sharp' ? safeFreq(800) : safeFreq(400);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(safeGain(0.7 * volume), t + 0.01); // Very fast attack
        let decayTime = type === 'sharp' ? 0.2 : (type === 'open' ? 0.6 : 0.4);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + decayTime);

        // Core tone
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq, t);

        // Noise transient
        const noise = ctx.createBufferSource();
        const nBuf = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
        const nData = nBuf.getChannelData(0);
        for(let i=0; i<nBuf.length; i++) nData[i] = Math.random() * 2 - 1;
        noise.buffer = nBuf;
        
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(safeFreq(5000), t);
        noiseFilter.Q.setValueAtTime(safeQ(type === 'sharp' ? 30 : 10), t); // Sharper Q for sharp hits
        noiseFilter.frequency.exponentialRampToValueAtTime(safeFreq(2000), t + 0.1); // Quick sweep
        
        // High-frequency ping for sharp attacks
        if (type === 'sharp') {
          const pingOsc = ctx.createOscillator();
          pingOsc.type = 'sine';
          pingOsc.frequency.setValueAtTime(safeFreq(6000 + Math.random() * 2000), t);
          const pingGain = ctx.createGain();
          pingGain.gain.setValueAtTime(0, t);
          pingGain.gain.linearRampToValueAtTime(safeGain(0.15 * volume), t + 0.005);
          pingGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
          pingOsc.connect(pingGain).connect(gain);
          pingOsc.start(t);
          pingOsc.stop(t + 0.2);
          extraNodes.push(pingOsc, pingGain);
        }

        osc.connect(gain);
        noise.connect(noiseFilter).connect(gain);
        gain.connect(t_mainGain);

        osc.start(t); noise.start(t);
        osc.stop(t + 0.8); noise.stop(t + 0.8);
        extraNodes.push(osc, noise, noiseFilter, gain);
      };

      // Teentaal rhythmic pattern (16 beats, 4-beat cycles)
      const rhythmPatternTeentaal = [
        { type: 'dha', time: 0, vol: 1.0 },   // Dha
        { type: 'dhin', time: 1, vol: 0.8 }, // Dhin
        { type: 'dhin', time: 2, vol: 0.8 }, // Dhin
        { type: 'dha', time: 3, vol: 1.0 }, // Dha

        { type: 'dha', time: 4, vol: 0.9 },   // Dha
        { type: 'dhin', time: 5, vol: 0.7 }, // Dhin
        { type: 'dhin', time: 6, vol: 0.7 }, // Dhin
        { type: 'dha', time: 7, vol: 0.9 }, // Dha

        { type: 'na', time: 8, vol: 0.8 },   // Na
        { type: 'tin', time: 9, vol: 0.6 }, // Tin
        { type: 'tin', time: 10, vol: 0.6 }, // Tin
        { type: 'na', time: 11, vol: 0.8 }, // Na

        { type: 'dha', time: 12, vol: 1.0 },   // Dha
        { type: 'dhin', time: 13, vol: 0.8 }, // Dhin
        { type: 'dhin', time: 14, vol: 0.8 }, // Dhin
        { type: 'dha', time: 15, vol: 1.0 }, // Dha
      ];

      const beatDuration = 0.25; // Each sub-beat is 0.25 seconds for a meditative pace
      const intervalLength = rhythmPatternTeentaal.length * beatDuration * 1000; // Total duration in ms (16 * 0.25 * 1000 = 4000ms = 4 seconds)

      const playRhythm = () => {
        const t = ctx.currentTime;
        rhythmPatternTeentaal.forEach(beat => {
          const beatStartTime = t + beat.time * beatDuration;
          switch (beat.type) {
            case 'dha': // Bayan + Resonant Dayan
              playBayan(beat.vol);
              playDayan(beat.vol, 'resonant');
              break;
            case 'dhin': // Resonant Dayan
              playDayan(beat.vol, 'resonant');
              break;
            case 'na': // Open Dayan
              playDayan(beat.vol, 'open');
              break;
            case 'tin': // Sharp Dayan
              playDayan(beat.vol, 'sharp');
              break;
          }
        });
      };
      
      const rhythmInterval = setInterval(playRhythm, intervalLength);
      playRhythm(); // Play immediately on start
      extraNodes.push({ stop: () => clearInterval(rhythmInterval) });
      mainNode = t_mainGain;
    }
    else if (type === 'GEN_GUITAR_FOREST') {
      const g_mainGain = ctx.createGain();
      g_mainGain.gain.setValueAtTime(safeGain(0.4), now);
      g_mainGain.connect(voiceGain);
      if (reverbNodeRef.current) g_mainGain.connect(reverbNodeRef.current);

      const scale = [0, 2, 3, 5, 7, 8, 10, 12]; // Natural minor scale
      const rootFreq = safeFreq(164.81); // E3

      const playGuitarNote = (freqVal: number, velocity: number) => {
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freqVal, t);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(safeGain(0.3 * velocity), t + 0.01); // Fast attack
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 3.0 + Math.random() * 1.5); // Medium-long decay

        // Subtle finger noise
        if (Math.random() > 0.7) {
          const noise = ctx.createBufferSource();
          const nBuf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
          const nData = nBuf.getChannelData(0);
          for(let i=0; i<nBuf.length; i++) nData[i] = Math.random() * 2 - 1;
          noise.buffer = nBuf;
          const nLp = ctx.createBiquadFilter();
          nLp.type = 'highpass'; 
          nLp.frequency.setValueAtTime(safeFreq(4000), t);
          const nG = ctx.createGain(); 
          nG.gain.setValueAtTime(safeGain(0.05), t);
          noise.connect(nLp).connect(nG).connect(g_mainGain);
          noise.start(t); noise.stop(t + 0.1);
          extraNodes.push(noise, nLp, nG);
        }

        osc.connect(gain).connect(g_mainGain);
        osc.start(t);
        osc.stop(t + 5);
        extraNodes.push(osc, gain);
      };

      const sequence = [
        { note: 0, octave: 0, delay: 0 },
        { note: 3, octave: 0, delay: 0.4 },
        { note: 7, octave: 0, delay: 0.8 },
        { note: 10, octave: 0, delay: 1.2 },
        { note: 7, octave: 0, delay: 1.8 },
        { note: 5, octave: 0, delay: 2.2 },
        { note: 2, octave: 1, delay: 2.6 },
        { note: 0, octave: 1, delay: 3.0 },
      ];

      const playArpeggio = () => {
        const t = ctx.currentTime;
        sequence.forEach(s => {
          const freq = safeFreq(rootFreq * Math.pow(2, (scale[s.note] + s.octave * 12) / 12));
          playGuitarNote(freq, safeGain(0.6 + Math.random() * 0.4));
        });
      };
      
      const arpeggioInterval = setInterval(playArpeggio, 6000 + Math.random() * 2000); 
      playArpeggio();
      extraNodes.push({ stop: () => clearInterval(arpeggioInterval) });
      mainNode = g_mainGain;
    }
    else if (type === 'GEN_HARMONIUM_SANCTUM') {
      const h_mainGain = ctx.createGain();
      h_mainGain.gain.setValueAtTime(safeGain(0.35), now);
      h_mainGain.connect(voiceGain);
      if (reverbNodeRef.current) h_mainGain.connect(reverbNodeRef.current);

      const rootFreq = safeFreq(110); // A2
      const chord = [rootFreq, safeFreq(rootFreq * 1.5), safeFreq(rootFreq * 2)]; // A minor triad (A, E, A)

      chord.forEach((freqVal, idx) => {
        const osc1 = ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freqVal, now);
        
        const osc2 = ctx.createOscillator(); // Slightly detuned for richness
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(safeFreq(freqVal * 1.005), now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(safeGain(0.15 / (idx + 1)), now + 2.0); // Slow attack
        gain.gain.linearRampToValueAtTime(safeGain(0.1 / (idx + 1)), now + 10.0); // Long sustain
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 20.0); // Slow release

        const vib = ctx.createOscillator(); // Vibrato
        vib.type = 'sine';
        vib.frequency.setValueAtTime(safeFreq(2 + Math.random() * 1), now);
        const vibG = ctx.createGain();
        vibG.gain.setValueAtTime(safeGain(freqVal * 0.005), now);
        vib.connect(vibG).connect(osc1.frequency);
        vib.connect(vibG).connect(osc2.frequency);
        vib.start(now);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(h_mainGain);
        osc1.start(now); osc2.start(now);
        extraNodes.push(osc1, osc2, gain, vib, vibG);
      });

      // Bellows noise
      const noise = ctx.createBufferSource();
      const nBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const nData = nBuf.getChannelData(0);
      for(let i=0; i<nBuf.length; i++) nData[i] = Math.random() * 2 - 1;
      noise.buffer = nBuf; noise.loop = true;

      const lpFilter = ctx.createBiquadFilter();
      lpFilter.type = 'lowpass';
      lpFilter.frequency.setValueAtTime(safeFreq(200), now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(safeGain(0.05), now);

      const noiseLfo = ctx.createOscillator(); // Slow volume modulation for bellows
      noiseLfo.type = 'sine';
      noiseLfo.frequency.setValueAtTime(safeFreq(0.05), now);
      const noiseLfoG = ctx.createGain();
      noiseLfoG.gain.setValueAtTime(safeGain(0.02), now);
      noiseLfo.connect(noiseLfoG).connect(noiseGain.gain);
      noiseLfo.start(now);

      noise.connect(lpFilter).connect(noiseGain).connect(h_mainGain);
      noise.start(now);
      extraNodes.push(noise, lpFilter, noiseGain, noiseLfo, noiseLfoG);
      mainNode = h_mainGain;
    }
    // NEW CLASSICAL INSTRUMENTS END HERE
    else {
      const dummy = ctx.createOscillator();
      dummy.frequency.setValueAtTime(safeFreq(432), now);
      dummy.connect(voiceGain);
      dummy.start();
      mainNode = dummy;
    }

    activeVoicesRef.current.push({ id: trackId, gainNode: voiceGain, nodes: [...extraNodes, mainNode] });
    setIsPlaying(true);
    setIsAnyTrackPlaying(true);
    setIsLoading(false);
  }, [isMuted, setIsAnyTrackPlaying, currentTrack.cat]);

  const handleTrackSelect = async (track: any) => {
    if (isLoading) return;
    const success = await initAudioEngine();
    if (!success) return;
    if (activeVoicesRef.current.some(v => v.id === track.id) && isPlaying && !isMuted) {
      stopAllVoices(true); return;
    }
    setIsLoading(true);
    stopAllVoices(true);
    if (isMuted) setIsMuted(false);
    setCurrentTrack(track);
    setTimeout(() => startGenerator(track.url, track.id), 200);
  };

  const toggleMute = useCallback(() => {
    const next = !isMuted; setIsMuted(next);
    if (masterGainRef.current && audioContextRef.current) {
      masterGainRef.current.gain.linearRampToValueAtTime(next ? 0 : volume, audioContextRef.current.currentTime + 0.5);
    }
  }, [isMuted, volume]);

  const drawVisualizer = useCallback(() => {
    if (!canvasRef.current || !analyzerRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ensure canvas drawing resolution matches display size for clarity
    const displayWidth = canvas.offsetWidth;
    const displayHeight = canvas.offsetHeight;
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    const data = new Uint8Array(analyzerRef.current.frequencyBinCount);
    analyzerRef.current.getByteFrequencyData(data);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    
    // Different visualizer logic for sleep: larger, slower circles
    const isSleep = currentTrack.cat === 'sleep';
    const rb = Math.min(cx, cy) * (isSleep ? 0.5 : 0.4);
    
    ctx.beginPath(); 
    ctx.lineWidth = isSleep ? 6 : 3; 
    ctx.strokeStyle = isSleep ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255,255,255,0.6)';
    
    for (let i = 0; i < data.length; i++) {
      const h = (data[i] / 255) * rb * (isSleep ? 0.3 : 0.6);
      const a = (i / data.length) * Math.PI * 2;
      const x = cx + Math.cos(a) * (rb + h);
      const y = cy + Math.sin(a) * (rb + h);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.stroke();
    animationRef.current = requestAnimationFrame(drawVisualizer);
  }, [currentTrack.cat]);

  useEffect(() => {
    if (isPlaying && !isMuted) drawVisualizer();
    else if (animationRef.current) cancelAnimationFrame(animationRef.current);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isPlaying, isMuted, drawVisualizer]);

  useEffect(() => {
    let t: any;
    if (isPlaying && !isMuted) t = setInterval(() => setSessionTime(p => p + 1), 1000);
    return () => clearInterval(t);
  }, [isPlaying, isMuted]);

  useEffect(() => {
    return () => { stopAllVoices(false); setIsAnyTrackPlaying(false); };
  }, [setIsAnyTrackPlaying, stopAllVoices]);

  return (
    <div className="space-y-6 md:space-y-10 animate-in slide-in-from-bottom-8 duration-1000 px-2 md:px-0 pb-40">
      <div className="flex justify-between items-center px-4 md:px-0">
        <button onClick={() => { stopAllVoices(true); setView(AppView.DASHBOARD); }} className="flex items-center gap-2 text-teal-800 label-caps text-[10px] md:text-xs hover:gap-3 transition-all outline-none">
          <ChevronLeft size={16} /> Exit Sanctuary
        </button>
        <div className="flex items-center gap-3">
           <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-3xl rounded-lg border border-white shadow-sm">
             <Timer size={14} className="text-teal-600" />
             <span className="text-[10px] font-black uppercase tracking-widest">{Math.floor(sessionTime/60)}:{(sessionTime%60).toString().padStart(2,'0')}</span>
           </div>
           <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white shadow-sm">
            <button onClick={toggleMute} className={`transition-colors outline-none ${isMuted ? 'text-slate-400' : 'text-teal-700'}`}>
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <input type="range" min="0" max="1" step="0.01" className="w-16 md:w-20 h-1 bg-teal-100 rounded-full appearance-none cursor-pointer accent-teal-700" value={volume} onChange={(e) => {
                const val = parseFloat(e.target.value); setVolume(val);
                if (masterGainRef.current && audioContextRef.current && !isMuted) masterGainRef.current.gain.setValueAtTime(val, audioContextRef.current.currentTime);
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
            <button onClick={() => handleTrackSelect(currentTrack)} disabled={isLoading} className={`w-14 h-14 md:w-20 md:h-20 bg-white text-teal-950 rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all ${isLoading ? 'opacity-50' : ''}`}>
              {isLoading ? <Loader2 size={24} className="animate-spin text-teal-700" /> : isPlaying && !isMuted ? <Pause size={32} fill="currentColor" /> : <Play size={32} className="ml-1" fill="currentColor" />}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 px-4 md:px-6">
          <div className="space-y-1">
            <h3 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">Meditation Library</h3>
            <p className="text-slate-500 font-bold text-xs md:text-sm">Clinical-grade procedural audio for neural reset.</p>
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
                  <p className="text-sm font-black tracking-tight leading-tight truncate">{item.name}</p>
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
