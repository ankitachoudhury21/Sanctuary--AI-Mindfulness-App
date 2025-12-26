import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { AppView } from '../types';
import { 
  Play, Pause, SkipBack, SkipForward, Sparkles, 
  ChevronLeft, Loader2, Volume2, VolumeX, Timer, Brain, 
  WavesIcon, Wind, Cloud, Moon,
  Target, Heart, Sun, Activity, Music, Droplets, Stars, Maximize2
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
  { id: 'p1', cat: 'piano', name: 'Nocturnal Nocturne', genre: 'Midnight Piano', icon: Music, color: 'from-slate-900 to-blue-950', url: 'GEN_PIANO_MIDNIGHT', benefit: 'Deep, minor-key melodies for late-night reflection.' },
  { id: 'p2', cat: 'piano', name: 'Dawn Prelude', genre: 'Morning Ivory', icon: Sun, color: 'from-amber-50 to-orange-100', url: 'GEN_PIANO_MORNING', benefit: 'Uplifting major scales to energize your morning ritual.' },
  { id: 'p3', cat: 'piano', name: 'Monsoon Sonata', genre: 'Rainy Keys', icon: Droplets, color: 'from-blue-100 to-slate-400', url: 'GEN_PIANO_RAIN', benefit: 'Melancholic keys layered with a soft procedural rainfall.' },
  { id: 'p4', cat: 'piano', name: 'Nebula Waltz', genre: 'Ethereal Grand', icon: Sparkles, color: 'from-purple-50 to-indigo-200', url: 'GEN_PIANO_ETHEREAL', benefit: 'Slow, drifting chords that feel like floating through space.' },
  { id: 'p5', cat: 'piano', name: 'Emerald Grove', genre: 'Lyrical Piano', icon: Wind, color: 'from-emerald-50 to-teal-100', url: 'GEN_PIANO_LYRICAL', benefit: 'Flowing Lydian melodies for creative inspiration and joy.' },
  { id: 'p6', cat: 'piano', name: 'Glass Reflection', genre: 'Minimalist Keys', icon: Activity, color: 'from-slate-50 to-blue-50', url: 'GEN_PIANO_GLASS', benefit: 'A precise, rhythmic arpeggio pattern for focused deep work.' },
  { id: 'f1', cat: 'focus', name: 'Deep Work', genre: 'Calm Waves', icon: WavesIcon, color: 'from-blue-50 to-teal-300', url: 'GEN_CALM_WAVES', benefit: 'Rhythmic shore waves for cognitive clarity.' },
  { id: 'f7', cat: 'focus', name: 'Raag Bilawal', genre: 'Energizing', icon: Sun, color: 'from-yellow-400 to-orange-400', url: 'GEN_RAAG_BILAWAL', benefit: 'A bright, major-scale Raga to energize your focus.' },
  { id: 'f4', cat: 'focus', name: 'Raag Yaman', genre: 'Evening', icon: Music, color: 'from-orange-200 to-amber-600', url: 'GEN_RAAG_YAMAN', benefit: 'Cultivates peace and romantic devotion.' },
  { id: 'f6', cat: 'focus', name: 'Logic Reeds', genre: 'Reed Focus', icon: Wind, color: 'from-amber-100 to-orange-300', url: 'GEN_HARMONIUM_FOCUS', benefit: 'Steady reed drone for rhythmic cognitive flow.' },
  { id: 'm5', cat: 'meditate', name: 'Celestial Voyage', genre: 'Astro-Ambient', icon: Stars, color: 'from-slate-900 via-indigo-950 to-purple-900', url: 'GEN_SPACE_ASTRO', benefit: 'Ethereal cosmic melodies and deep stardust frequencies.' },
  { id: 'm6', cat: 'meditate', name: 'Sacred Bellows', genre: 'Reed Zen', icon: Wind, color: 'from-amber-200 to-orange-700', url: 'GEN_HARMONIUM_MEDITATE', benefit: 'Traditional harmonium drone for spiritual depth.' },
  { id: 'r3', cat: 'relax', name: 'Raag Bhairavi', genre: 'Healing', icon: Heart, color: 'from-rose-100 to-teal-400', url: 'GEN_RAAG_BHAIRAVI', benefit: 'The Queen of Ragas. Healing vibrations suited for any time of day.' },
  { id: 'r4', cat: 'relax', name: 'Raag Malhar', genre: 'Monsoon', icon: Cloud, color: 'from-slate-700 to-blue-900', url: 'GEN_RAAG_MALHAR', benefit: 'The Raga of Rain. Majestic, surging melodies like a storm.' },
  { id: 'r5', cat: 'relax', name: 'Raag Bihag', genre: 'Sweet, Dreamy', icon: Heart, color: 'from-pink-100 to-amber-200', url: 'GEN_RAAG_BIHAG', benefit: 'Best suited for Evening. Evokes a sweet, romantic, and dreamy atmosphere.' },
  { id: 'r2', cat: 'relax', name: 'Raag Darbari', genre: 'Regal', icon: Moon, color: 'from-indigo-900 to-blue-950', url: 'GEN_RAAG_DARBARI', benefit: 'Grave, regal, and deeply grounding.' },
  { id: 's1', cat: 'sleep', name: 'Lunar Tide', genre: 'Sleep Delta', icon: WavesIcon, color: 'from-[#0b1d2e] to-[#1e3a8a]', url: 'GEN_SLEEP_WAVES', benefit: 'Gentle, slow-moving oceanic rhythms tuned to Delta sleep frequencies.' },
  { id: 's2', cat: 'sleep', name: 'Midnight Rainfall', genre: 'Nature Sleep', icon: Droplets, color: 'from-[#1e1e2e] to-[#312e81]', url: 'GEN_SLEEP_RAIN', benefit: 'A soft, consistent downpour designed to mask distracting corporate noise.' },
  { id: 's4', cat: 'sleep', name: 'Velvet Void', genre: 'Deep Space', icon: Stars, color: 'from-black to-[#111827]', url: 'GEN_SLEEP_SPACE', benefit: 'Warm, low-frequency cosmic hums designed for total mental surrender.' },
];

const CROSSFADE_TIME = 1.8; // Seconds

interface AudioVoice {
  id: string;
  gainNode: GainNode;
  nodes: any[];
}

const MusicPlayer: React.FC<Props> = ({ setView, setIsAnyTrackPlaying }) => {
  const [activeCat, setActiveCat] = useState('focus');
  const [currentTrack, setCurrentTrack] = useState(TRACKS[14]); // Default to Raag Bihag
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
  
  // Track all currently playing synthesis voices for crossfading
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
        try { await ctx.resume(); } catch (e) { console.warn("AudioContext resume interrupted", e); }
      }
      if (!masterGainRef.current) {
        masterGainRef.current = ctx.createGain();
        masterGainRef.current.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime);
        masterGainRef.current.connect(ctx.destination);
      }
      if (!reverbNodeRef.current) {
        const reverb = ctx.createConvolver();
        const sampleRate = ctx.sampleRate;
        const length = sampleRate * 4.5;
        const impulse = ctx.createBuffer(2, length, sampleRate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);
        for (let i = 0; i < length; i++) {
          const envelope = Math.pow(1 - i / length, 3.5);
          left[i] = (Math.random() * 2 - 1) * envelope;
          right[i] = (Math.random() * 2 - 1) * envelope;
        }
        reverb.buffer = impulse;
        const reverbGain = ctx.createGain();
        reverbGain.gain.setValueAtTime(0.35, ctx.currentTime); 
        reverb.connect(reverbGain).connect(masterGainRef.current);
        reverbNodeRef.current = reverb;
      }
      if (!analyzerRef.current) {
        const analyzer = ctx.createAnalyser();
        analyzer.fftSize = 256;
        analyzer.smoothingTimeConstant = 0.75;
        analyzer.connect(masterGainRef.current);
        analyzerRef.current = analyzer;
      }
      return true;
    } catch (err) { console.warn("Audio Engine Initialization failed:", err); return false; }
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
    // Start fading in
    voiceGain.gain.linearRampToValueAtTime(1, now + CROSSFADE_TIME);
    voiceGain.connect(analyzerRef.current);

    const extraNodes: any[] = [];
    let mainNode: AudioNode;

    // PROCEDURAL ENGINE WRAPPER
    if (type.startsWith('GEN_PIANO')) {
      const mainGain = ctx.createGain();
      mainGain.connect(voiceGain);
      if (reverbNodeRef.current) mainGain.connect(reverbNodeRef.current);
      
      const playPianoNote = (freq: number, startTime: number, duration: number, vel: number) => {
        const hammerBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
        const hammerData = hammerBuffer.getChannelData(0);
        for(let i=0; i<hammerData.length; i++) hammerData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i/hammerData.length, 5);
        const hammerSource = ctx.createBufferSource();
        hammerSource.buffer = hammerBuffer;
        const hGain = ctx.createGain();
        hGain.gain.setValueAtTime(0.05 * vel, startTime);
        hGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);
        hammerSource.connect(hGain).connect(mainGain);
        hammerSource.start(startTime);
        extraNodes.push(hammerSource, hGain);
        const harmonicRatios = [1, 2, 3.01, 4, 5];
        harmonicRatios.forEach((ratio, idx) => {
          const osc = ctx.createOscillator();
          osc.type = idx === 0 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq * ratio, startTime);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0, startTime);
          g.gain.linearRampToValueAtTime((0.25 / (idx + 1)) * vel, startTime + 0.005);
          g.gain.exponentialRampToValueAtTime(0.0001, startTime + (duration * (1.2 - idx * 0.1)));
          osc.connect(g).connect(mainGain);
          osc.start(startTime);
          osc.stop(startTime + duration + 1);
          extraNodes.push(osc, g);
        });
      };

      const isMidnight = type.includes('MIDNIGHT');
      const isMorning = type.includes('MORNING');
      const isRain = type.includes('RAIN');
      const isEthereal = type.includes('ETHEREAL');
      const isLyrical = type.includes('LYRICAL');
      const isGlass = type.includes('GLASS');
      const scale = isMidnight ? [0, 3, 7, 8, 10, 12] : 
                   isMorning ? [0, 2, 4, 7, 9, 12] : 
                   isRain ? [0, 2, 3, 7, 9, 12] : 
                   isLyrical ? [0, 2, 4, 6, 7, 9, 11, 12] : 
                   isGlass ? [0, 2, 7, 9, 12, 14] : 
                   [0, 4, 7, 11, 14, 18]; 
      const baseTonic = isMidnight ? 110 : isMorning ? 146.83 : isRain ? 130.81 : isLyrical ? 174.61 : isGlass ? 196.00 : 98.00;

      if (isRain) {
        const rainBuff = ctx.createBuffer(1, ctx.sampleRate * 5, ctx.sampleRate);
        const rData = rainBuff.getChannelData(0);
        for(let i=0; i<rainBuff.length; i++) rData[i] = Math.random() * 2 - 1;
        const rSrc = ctx.createBufferSource();
        rSrc.buffer = rainBuff; rSrc.loop = true;
        const rg = ctx.createGain(); rg.gain.setValueAtTime(0.12, ctx.currentTime);
        rSrc.connect(rg).connect(mainGain);
        rSrc.start();
        extraNodes.push(rSrc, rg);
      }

      const seqInterval = isMidnight ? 5000 : isMorning ? 3500 : isRain ? 6000 : isLyrical ? 2500 : isGlass ? 1200 : 8000;
      let glassIndex = 0;
      const runSequence = () => {
        let interval;
        if (isGlass) { interval = scale[glassIndex % scale.length]; glassIndex++; }
        else { interval = scale[Math.floor(Math.random() * scale.length)]; }
        const oct = isGlass ? (glassIndex % 3) : Math.floor(Math.random() * 2) + (isEthereal ? 1 : 0);
        const f = baseTonic * Math.pow(2, (interval + oct * 12) / 12);
        playPianoNote(f, ctx.currentTime, isEthereal ? 12 : (isGlass ? 3 : 5), 0.7 + Math.random() * 0.3);
      };
      const seqId = setInterval(runSequence, seqInterval + (isGlass ? 0 : Math.random() * 2000));
      runSequence();
      extraNodes.push({ stop: () => clearInterval(seqId) });
      mainNode = mainGain;
    }
    else if (type.startsWith('GEN_RAAG')) {
      const mainGain = ctx.createGain();
      mainGain.connect(voiceGain);
      if (reverbNodeRef.current) mainGain.connect(reverbNodeRef.current);
      const isBhairavi = type.includes('BHAIRAVI');
      const isMalhar = type.includes('MALHAR');
      const isYaman = type.includes('YAMAN');
      const isDarbari = type.includes('DARBARI');
      const isBihag = type.includes('BIHAG');
      const isBilawal = type.includes('BILAWAL');
      const baseTonic = isDarbari ? 110 : isBhairavi ? 130.81 : (isMalhar || isYaman || isBihag || isBilawal) ? 146.83 : 146.83; 
      const scaleBhairavi = [0, 1, 3, 5, 7, 8, 10, 12];
      const scaleMalhar = [0, 2, 5, 7, 10, 12];
      const scaleYaman = [0, 2, 4, 6, 7, 9, 11, 12];
      const scaleDarbari = [0, 2, 3, 5, 7, 8, 10, 12];
      const scaleBihag = [0, 4, 5, 6, 7, 11, 12];
      const scaleBilawal = [0, 2, 4, 5, 7, 9, 11, 12];
      const activeScale = isBhairavi ? scaleBhairavi : isMalhar ? scaleMalhar : isYaman ? scaleYaman : isDarbari ? scaleDarbari : isBihag ? scaleBihag : isBilawal ? scaleBilawal : scaleYaman;
      const droneG = ctx.createGain();
      droneG.gain.setValueAtTime(0.2, ctx.currentTime);
      droneG.connect(mainGain);
      [1, 1.5, 2, 3].forEach((h, i) => {
        const osc = ctx.createOscillator();
        osc.type = (i % 2 === 0 || isBilawal) ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(baseTonic * h, ctx.currentTime);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.08 / (i + 1), ctx.currentTime);
        osc.detune.setValueAtTime(Math.random() * 10 - 5, ctx.currentTime);
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.05 + (i * 0.02), ctx.currentTime);
        const lfoG = ctx.createGain();
        lfoG.gain.setValueAtTime(0.02, ctx.currentTime);
        lfo.connect(lfoG).connect(g.gain);
        osc.connect(g).connect(droneG);
        osc.start(); lfo.start();
        extraNodes.push(osc, lfo, g);
      });
      if (isMalhar) {
        const rainBuff = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
        const rData = rainBuff.getChannelData(0);
        for(let i=0; i<rainBuff.length; i++) rData[i] = Math.random() * 2 - 1;
        const rSrc = ctx.createBufferSource();
        rSrc.buffer = rainBuff; rSrc.loop = true;
        const rFilter = ctx.createBiquadFilter();
        rFilter.type = 'lowpass'; rFilter.frequency.setValueAtTime(400, ctx.currentTime);
        const rg = ctx.createGain(); rg.gain.setValueAtTime(0.06, ctx.currentTime);
        rSrc.connect(rFilter).connect(rg).connect(mainGain);
        rSrc.start();
        extraNodes.push(rSrc, rFilter, rg);
      }
      const playRaagNote = () => {
        const now = ctx.currentTime;
        const interval = activeScale[Math.floor(Math.random() * activeScale.length)];
        const oct = Math.floor(Math.random() * (isDarbari || isBihag || isBilawal ? 1 : 2));
        const freq = baseTonic * Math.pow(2, (interval + oct * 12) / 12);
        const osc = ctx.createOscillator();
        osc.type = (isBhairavi || isBihag || isBilawal) ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(isMalhar || isBihag || isBilawal ? 0.12 : 0.08, now + (isMalhar ? 0.5 : (isBihag || isBilawal ? 1.0 : 2)));
        g.gain.exponentialRampToValueAtTime(0.0001, now + (isMalhar ? 6 : (isBihag ? 10 : 8)));
        if (Math.random() > 0.4 && !isBilawal) {
          const targetInterval = activeScale[Math.floor(Math.random() * activeScale.length)];
          const targetFreq = baseTonic * Math.pow(2, (targetInterval + oct * 12) / 12);
          osc.frequency.exponentialRampToValueAtTime(targetFreq, now + (isBihag ? 1.2 : 1.5));
        }
        osc.connect(g).connect(mainGain);
        osc.start(now); osc.stop(now + 13);
        extraNodes.push(osc, g);
      };
      const noteInterval = isMalhar ? 4000 : (isBilawal ? 3000 : (isBihag ? 5000 : (isBhairavi ? 8000 : 6000)));
      const raagSeqId = setInterval(playRaagNote, noteInterval + (isBilawal ? Math.random() * 1500 : Math.random() * 3000));
      playRaagNote();
      extraNodes.push({ stop: () => clearInterval(raagSeqId) });
      mainNode = mainGain;
    }
    else if (type.startsWith('GEN_WHITE') || type.startsWith('GEN_BROWN') || type === 'GEN_CALM_WAVES' || type === 'GEN_SLEEP_WAVES') {
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 10, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < buffer.length; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + (0.02 * white)) / 1.02;
        data[i] = lastOut * 3.5;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer; source.loop = true;
      const isSleep = type === 'GEN_SLEEP_WAVES';
      const waveGain = ctx.createGain();
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(isSleep ? 0.05 : 0.12, ctx.currentTime); 
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(isSleep ? 0.25 : 0.45, ctx.currentTime);
      lfo.connect(lfoGain).connect(waveGain.gain);
      waveGain.gain.setValueAtTime(0.4, ctx.currentTime);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isSleep ? 250 : 800, ctx.currentTime);
      source.connect(filter).connect(waveGain).connect(voiceGain);
      source.start(); lfo.start();
      extraNodes.push(lfo, source, filter);
      mainNode = waveGain;
    } 
    else if (type === 'GEN_SLEEP_RAIN') {
      const rainMainGain = ctx.createGain();
      rainMainGain.connect(voiceGain);
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 5, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < buffer.length; i++) data[i] = Math.random() * 2 - 1;
      const source = ctx.createBufferSource();
      source.buffer = buffer; source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass'; filter.frequency.setValueAtTime(350, ctx.currentTime);
      const rumble = ctx.createOscillator();
      rumble.frequency.setValueAtTime(55, ctx.currentTime);
      const rumbleG = ctx.createGain();
      rumbleG.gain.setValueAtTime(0.08, ctx.currentTime);
      rumble.connect(rumbleG).connect(rainMainGain);
      const rainG = ctx.createGain(); rainG.gain.setValueAtTime(0.15, ctx.currentTime);
      source.connect(filter).connect(rainG).connect(rainMainGain);
      source.start(); rumble.start();
      extraNodes.push(source, filter, rainG, rumble);
      mainNode = rainMainGain;
    }
    else {
      const osc = ctx.createOscillator(); osc.frequency.setValueAtTime(432, ctx.currentTime);
      osc.connect(voiceGain); osc.start();
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
    [0.7, 0.5, 0.3].forEach((opacity, layer) => {
      ctx.beginPath(); ctx.lineWidth = 1.5 + (layer * 0.5);
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * (radiusBase * (0.2 + layer * 0.3));
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

    // Case: Toggle Off
    if (activeVoicesRef.current.some(v => v.id === track.id) && isPlaying && !isMuted) {
      stopAllVoices(true);
      return;
    }

    setIsLoading(true);

    // Fade out previous voices
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
    <div className="space-y-8 md:space-y-12 animate-in slide-in-from-bottom-8 duration-1000 px-2 md:px-0 pb-40">
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
      <div className="relative h-[450px] md:h-[650px] rounded-[3.5rem] md:rounded-[6rem] overflow-hidden group shadow-[0_40px_100px_-20px_rgba(0,0,0,0.35)] transition-all duration-1000 ring-1 ring-white/15">
        <div className={`absolute inset-0 bg-gradient-to-br ${currentTrack.color} transition-all duration-[2500ms] scale-105 group-hover:scale-100`}></div>
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"></div>
        <canvas ref={canvasRef} width={1000} height={1000} className="absolute inset-0 w-full h-full opacity-60 pointer-events-none mix-blend-screen" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 md:p-16 z-10 text-center">
          <div className="space-y-6 md:space-y-8 animate-in zoom-in-95 duration-1000 max-w-4xl">
             <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/10 backdrop-blur-3xl rounded-full border border-white/20 mx-auto">
               <Sparkles size={16} className="text-teal-300" />
               <p className="text-[11px] md:text-sm font-black uppercase tracking-[0.4em] text-white/90">Environment: {currentTrack.genre}</p>
             </div>
             <div className="space-y-4">
               <h2 className="text-5xl sm:text-6xl md:text-9xl font-black tracking-tighter drop-shadow-2xl text-white leading-[0.85]">{currentTrack.name}</h2>
               {currentTrack.benefit && <p className="text-xl md:text-3xl text-teal-50 font-medium italic drop-shadow-lg opacity-90 leading-relaxed max-w-2xl mx-auto">"{currentTrack.benefit}"</p>}
             </div>
          </div>
          <div className="absolute bottom-10 md:bottom-16 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-4 md:gap-8 px-8 py-3 bg-white/10 backdrop-blur-3xl rounded-full border border-white/20 shadow-2xl animate-in slide-in-from-bottom-6 duration-700">
              <button className="text-white/30 hover:text-white transition-all hover:scale-110 active:scale-90 p-2"><SkipBack size={20} fill="currentColor" /></button>
              <button onClick={() => handleTrackSelect(currentTrack)} disabled={isLoading} className={`w-14 h-14 md:w-16 md:h-16 bg-white text-teal-950 rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all ${isLoading ? 'opacity-50' : ''}`}>
                {isLoading ? <Loader2 size={24} className="animate-spin text-teal-700" /> : isPlaying && !isMuted ? <Pause size={24} fill="currentColor" /> : <Play size={24} className="ml-1" fill="currentColor" />}
              </button>
              <button className="text-white/30 hover:text-white transition-all hover:scale-110 active:scale-90 p-2"><SkipForward size={20} fill="currentColor" /></button>
            </div>
          </div>
          <button className="absolute top-10 right-10 p-4 bg-white/10 backdrop-blur-md rounded-2xl text-white/20 hover:text-white transition-all hover:bg-white/20 hidden md:block"><Maximize2 size={20} /></button>
        </div>
        <div className="absolute inset-0 pointer-events-none z-0 opacity-15 mix-blend-overlay">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"></div>
        </div>
      </div>
      <div className="space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 px-4 md:px-6">
          <div className="space-y-2">
            <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">Meditation Library</h3>
            <p className="text-slate-500 font-bold text-sm md:text-lg max-w-xl">Hand-crafted procedural audio with seamless crossfades.</p>
          </div>
          <div className="flex p-1.5 bg-slate-100/80 backdrop-blur-3xl rounded-2xl gap-1 border border-white shadow-inner flex-wrap">
            {CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCat(cat.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeCat === cat.id ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
                <cat.icon size={14} className={activeCat === cat.id ? cat.color : ''} />{cat.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-6">
          {filteredTracks.map(item => {
            const isActive = currentTrack.id === item.id;
            return (
              <button key={item.id} onClick={() => handleTrackSelect(item)} className={`group relative flex items-center gap-4 p-5 rounded-3xl transition-all duration-300 text-left overflow-hidden outline-none ${isActive && !isMuted ? 'bg-slate-950 text-white shadow-xl ring-2 ring-teal-500/30' : 'bg-white hover:bg-slate-50 border border-slate-100'}`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isActive && !isMuted ? 'bg-teal-600/20' : `bg-gradient-to-br ${item.color} text-white shadow-sm group-hover:scale-105`}`}>
                  {isActive && isLoading ? <Loader2 size={24} className="animate-spin text-teal-400" /> : isActive && isPlaying && !isMuted ? <Pause size={24} fill="currentColor" className="text-teal-400" /> : <item.icon size={24} />}
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-base md:text-lg font-black tracking-tight leading-tight truncate">{item.name}</p>
                    {isActive && isPlaying && !isMuted && <PlayingIndicator />}
                  </div>
                  <p className={`text-[10px] uppercase font-black tracking-[0.2em] ${isActive && !isMuted ? 'text-teal-400' : 'text-slate-400'}`}>{item.genre}</p>
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