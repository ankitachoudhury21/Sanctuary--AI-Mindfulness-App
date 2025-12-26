import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppView } from '../types';
import { 
  ChevronLeft, Play, Pause, Rocket, Sun as SunIcon, Globe, Moon, 
  Stars, Loader2, Volume2, VolumeX, Timer, Sparkles, Activity, Shield, Zap, Music
} from 'lucide-react';

interface Planet {
  id: string;
  name: string;
  desc: string;
  color: string;
  videoUrl: string;
  imageUrl: string; 
  synthesis: string;
  mission: string;
  audioTrackName: string;
  metrics: {
    temp: string;
    distance: string;
    hazard: string;
  };
}

const PLANETS: Planet[] = [
  { 
    id: 'sun', 
    name: 'Sun', 
    desc: 'Solar Core: G-Type Star', 
    color: 'from-orange-500 to-yellow-600', 
    videoUrl: 'https://cdn.pixabay.com/vimeo/312061265/sun-1358.mp4?width=1280', 
    imageUrl: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&q=80&w=2000',
    synthesis: 'SUN', 
    mission: 'Harness the raw energy of existence.', 
    audioTrackName: 'Solar Flare',
    metrics: { temp: '5,500°C', distance: '0.0 AU', hazard: 'EXTREME' } 
  },
  { 
    id: 'mercury', 
    name: 'Mercury', 
    desc: 'Craters: Metallic Core', 
    color: 'from-slate-400 to-slate-600', 
    videoUrl: '', 
    imageUrl: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=2000',
    synthesis: 'MERCURY', 
    mission: 'Endure the extremes of the inner circle.', 
    audioTrackName: 'Core Resonance',
    metrics: { temp: '430°C', distance: '0.39 AU', hazard: 'HIGH' } 
  },
  { 
    id: 'venus', 
    name: 'Venus', 
    desc: 'Dense: Sulfuric Greenhouse', 
    color: 'from-pink-300 to-rose-400', 
    videoUrl: 'https://cdn.pixabay.com/vimeo/186596918/venus-5743.mp4?width=1280', 
    imageUrl: 'https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?auto=format&fit=crop&q=80&w=2000',
    synthesis: 'VENUS', 
    mission: 'Navigate the pressure of the eternal storm.', 
    audioTrackName: "Acid Rain's Whisper",
    metrics: { temp: '462°C', distance: '0.72 AU', hazard: 'CRITICAL' } 
  },
  { 
    id: 'earth', 
    name: 'Earth', 
    desc: 'Organic: Pale Blue Dot', 
    color: 'from-blue-500 to-emerald-600', 
    videoUrl: 'https://cdn.pixabay.com/vimeo/158300267/earth-2384.mp4?width=1280', 
    imageUrl: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bac4?auto=format&fit=crop&q=80&w=2000',
    synthesis: 'EARTH', 
    mission: 'Rediscover the heartbeat of home.', 
    audioTrackName: "Gaia's Resonant Heartbeat",
    metrics: { temp: '15°C', distance: '1.0 AU', hazard: 'MINIMAL' } 
  },
  { 
    id: 'moon', 
    name: 'The Moon', 
    desc: 'Satellite: Lunar Stillness', 
    color: 'from-slate-200 to-slate-400', 
    videoUrl: 'https://cdn.pixabay.com/vimeo/186596954/moon-5744.mp4?width=1280', 
    imageUrl: 'https://images.unsplash.com/photo-1446941611759-ad1672d58dd3?auto=format&fit=crop&q=80&w=2000',
    synthesis: 'MOON', 
    mission: 'Embrace the silence of the cosmic mirror.', 
    audioTrackName: 'Lunar Echo',
    metrics: { temp: '-173°C', distance: '384k km', hazard: 'LOW' } 
  },
  { 
    id: 'mars', 
    name: 'Mars', 
    desc: 'Rust: The Crimson Frontier', 
    color: 'from-red-600 to-orange-800', 
    videoUrl: 'https://cdn.pixabay.com/vimeo/312061108/mars-1357.mp4?width=1280', 
    imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&q=80&w=2000',
    synthesis: 'MARS', 
    mission: 'Chart the path across the crimson dust.', 
    audioTrackName: 'Crimson Winds',
    metrics: { temp: '-63°C', distance: '1.52 AU', hazard: 'MODERATE' } 
  },
  { 
    id: 'jupiter', 
    name: 'Jupiter', 
    desc: 'Banded: Gas Colossus', 
    color: 'from-amber-800 to-orange-900', 
    videoUrl: 'https://cdn.pixabay.com/vimeo/186596931/jupiter-5742.mp4?width=1280', 
    imageUrl: 'https://images.unsplash.com/photo-1630839437035-dac17da580d0?auto=format&fit=crop&q=80&w=2000',
    synthesis: 'JUPITER', 
    mission: 'Witness the majesty of the Great Red Spot.', 
    audioTrackName: 'Great Red Resonance',
    metrics: { temp: '-108°C', distance: '5.20 AU', hazard: 'HIGH' } 
  },
  { 
    id: 'saturn', 
    name: 'Saturn', 
    desc: 'Ringed: Lord of the Ice', 
    color: 'from-yellow-200 to-amber-500', 
    videoUrl: '', 
    imageUrl: 'https://images.unsplash.com/photo-1614727503920-561b3658510a?auto=format&fit=crop&q=80&w=2000',
    synthesis: 'SATURN', 
    mission: 'Listen to the shimmering songs of the rings.', 
    audioTrackName: 'Ring Resonance',
    metrics: { temp: '-138°C', distance: '9.58 AU', hazard: 'MODERATE' } 
  },
  { 
    id: 'uranus', 
    name: 'Uranus', 
    desc: 'Ice Giant: Aquamarine Veil', 
    color: 'from-cyan-300 to-blue-500', 
    videoUrl: '', 
    imageUrl: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&q=80&w=2000',
    synthesis: 'URANUS', 
    mission: 'Plunge into the crystalline turquoise depths.', 
    audioTrackName: 'Azure Ice Echo',
    metrics: { temp: '-195°C', distance: '19.2 AU', hazard: 'HIGH' } 
  },
  { 
    id: 'neptune', 
    name: 'Neptune', 
    desc: 'Deep Blue: Wind Master', 
    color: 'from-blue-800 to-indigo-950', 
    videoUrl: 'https://cdn.pixabay.com/vimeo/186596931/neptune-5742.mp4?width=1280', 
    imageUrl: 'https://images.unsplash.com/photo-1614314104100-20516766624e?auto=format&fit=crop&q=80&w=2000',
    synthesis: 'NEPTUNE', 
    mission: 'Surrender to the ultra-sonic azure winds.', 
    audioTrackName: 'Supersonic Azure Winds',
    metrics: { temp: '-201°C', distance: '30.1 AU', hazard: 'HIGH' } 
  },
  { 
    id: 'pluto', 
    name: 'Pluto', 
    desc: 'Dwarf: Glacial Heart', 
    color: 'from-slate-800 to-black', 
    videoUrl: '', 
    imageUrl: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=2000',
    synthesis: 'PLUTO', 
    mission: 'Reflect at the final frontier of home.', 
    audioTrackName: 'Glacial Void Stillness',
    metrics: { temp: '-232°C', distance: '39.5 AU', hazard: 'LOW' } 
  },
];

type SynthesizerFunc = (ctx: AudioContext, dest: AudioNode) => any[];

const PLANET_SYNTHESIZERS: Record<string, SynthesizerFunc> = {
  SUN: (ctx, dest) => {
    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0.25, ctx.currentTime);
    mainGain.connect(dest);
    const nodes: any[] = [mainGain];
    const coreOsc = ctx.createOscillator();
    coreOsc.type = 'sawtooth';
    coreOsc.frequency.setValueAtTime(32.7, ctx.currentTime);
    const coreLowpass = ctx.createBiquadFilter();
    coreLowpass.type = 'lowpass';
    coreLowpass.frequency.setValueAtTime(80, ctx.currentTime);
    const coreG = ctx.createGain();
    coreG.gain.setValueAtTime(0.3, ctx.currentTime);
    coreOsc.connect(coreLowpass).connect(coreG).connect(mainGain);
    coreOsc.start();
    nodes.push(coreOsc, coreLowpass, coreG);
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) noiseData[i] = Math.random() * 2 - 1;
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer; noiseSrc.loop = true;
    const turbulenceFilter = ctx.createBiquadFilter();
    turbulenceFilter.type = 'bandpass';
    turbulenceFilter.frequency.setValueAtTime(400, ctx.currentTime);
    const turbulenceLfo = ctx.createOscillator();
    turbulenceLfo.frequency.setValueAtTime(0.4, ctx.currentTime);
    const turbulenceLfoG = ctx.createGain();
    turbulenceLfoG.gain.setValueAtTime(300, ctx.currentTime);
    turbulenceLfo.connect(turbulenceLfoG).connect(turbulenceFilter.frequency);
    const turbGain = ctx.createGain();
    turbGain.gain.setValueAtTime(0.12, ctx.currentTime);
    noiseSrc.connect(turbulenceFilter).connect(turbGain).connect(mainGain);
    noiseSrc.start(); turbulenceLfo.start();
    nodes.push(noiseSrc, turbulenceFilter, turbulenceLfo, turbulenceLfoG, turbGain);
    const flareInterval = setInterval(() => {
      const now = ctx.currentTime;
      const fOsc = ctx.createOscillator();
      fOsc.type = 'sine';
      fOsc.frequency.setValueAtTime(800 + Math.random() * 2000, now);
      const fEnv = ctx.createGain();
      fEnv.gain.setValueAtTime(0, now);
      fEnv.gain.linearRampToValueAtTime(0.05, now + 0.5);
      fEnv.gain.exponentialRampToValueAtTime(0.0001, now + 5);
      fOsc.connect(fEnv).connect(mainGain);
      fOsc.start(now); fOsc.stop(now + 6);
    }, 4500);
    nodes.push({ stop: () => clearInterval(flareInterval) });
    return nodes;
  },
  MERCURY: (ctx, dest) => {
    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0.18, ctx.currentTime);
    mainGain.connect(dest);
    const nodes: any[] = [mainGain];
    
    // Solid Metallic Core (Fundamental)
    const core = ctx.createOscillator();
    core.type = 'sine';
    core.frequency.setValueAtTime(48.99, ctx.currentTime); // Low G
    const coreG = ctx.createGain();
    coreG.gain.setValueAtTime(0.35, ctx.currentTime);
    core.connect(coreG).connect(mainGain);
    core.start();
    nodes.push(core, coreG);

    // Resonant Metallic "Overtones" simulating a dense iron interior
    [2.01, 3.52, 5.03, 7.91].forEach((ratio, i) => {
      const harmonic = ctx.createOscillator();
      harmonic.type = 'sine';
      harmonic.frequency.setValueAtTime(48.99 * ratio, ctx.currentTime);
      
      const hGain = ctx.createGain();
      const hLfo = ctx.createOscillator();
      hLfo.frequency.setValueAtTime(0.1 + (i * 0.05), ctx.currentTime);
      const hLfoG = ctx.createGain();
      hLfoG.gain.setValueAtTime(0.05, ctx.currentTime);
      hLfo.connect(hLfoG).connect(hGain.gain);
      
      hGain.gain.setValueAtTime(0.1 / (i + 1), ctx.currentTime);
      harmonic.connect(hGain).connect(mainGain);
      
      harmonic.start(); hLfo.start();
      nodes.push(harmonic, hGain, hLfo, hLfoG);
    });

    // Craters & Thin Exosphere: Shimmering Noise
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const nData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) nData[i] = Math.random() * 2 - 1;
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer; noiseSrc.loop = true;
    
    const hpFilter = ctx.createBiquadFilter();
    hpFilter.type = 'highpass';
    hpFilter.frequency.setValueAtTime(6000, ctx.currentTime);
    
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.04, ctx.currentTime);
    
    noiseSrc.connect(hpFilter).connect(nGain).connect(mainGain);
    noiseSrc.start();
    nodes.push(noiseSrc, hpFilter, nGain);
    
    return nodes;
  },
  VENUS: (ctx, dest) => {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer; src.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(5000, ctx.currentTime);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.04, ctx.currentTime);
    src.connect(hp).connect(g).connect(dest);
    src.start();
    return [src, hp, g];
  },
  EARTH: (ctx, dest) => {
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.18, ctx.currentTime);
    masterGain.connect(dest);
    const nodes: any[] = [masterGain];
    const heart = ctx.createOscillator();
    heart.type = 'sine';
    heart.frequency.setValueAtTime(55, ctx.currentTime);
    const heartG = ctx.createGain();
    const heartLfo = ctx.createOscillator();
    heartLfo.frequency.setValueAtTime(0.66, ctx.currentTime);
    const heartLfoG = ctx.createGain();
    heartLfoG.gain.setValueAtTime(0.1, ctx.currentTime);
    heartLfo.connect(heartLfoG).connect(heartG.gain);
    heartG.gain.setValueAtTime(0.2, ctx.currentTime);
    heart.connect(heartG).connect(masterGain);
    heart.start(); heartLfo.start();
    nodes.push(heart, heartG, heartLfo, heartLfoG);
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 5, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < buffer.length; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + (0.02 * white)) / 1.02;
        data[i] = lastOut * 3.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer; noise.loop = true;
    const windFilter = ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.setValueAtTime(400, ctx.currentTime);
    const windLfo = ctx.createOscillator();
    windLfo.frequency.setValueAtTime(0.05, ctx.currentTime);
    const windLfoG = ctx.createGain();
    windLfoG.gain.setValueAtTime(300, ctx.currentTime);
    windLfo.connect(windLfoG).connect(windFilter.frequency);
    const windG = ctx.createGain();
    windG.gain.setValueAtTime(0.08, ctx.currentTime);
    noise.connect(windFilter).connect(windG).connect(masterGain);
    noise.start(); windLfo.start();
    nodes.push(noise, windFilter, windLfo, windLfoG, windG);
    [432, 528].forEach((f, i) => {
        const shimmer = ctx.createOscillator();
        shimmer.frequency.setValueAtTime(f, ctx.currentTime);
        const sG = ctx.createGain();
        sG.gain.setValueAtTime(0, ctx.currentTime);
        const sLfo = ctx.createOscillator();
        sLfo.frequency.setValueAtTime(0.1 + (i * 0.05), ctx.currentTime);
        const sLfoG = ctx.createGain();
        sLfoG.gain.setValueAtTime(0.02, ctx.currentTime);
        sLfo.connect(sLfoG).connect(sG.gain);
        shimmer.connect(sG).connect(masterGain);
        shimmer.start(); sLfo.start();
        nodes.push(shimmer, sG, sLfo, sLfoG);
    });
    return nodes;
  },
  MOON: (ctx, dest) => {
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.1, ctx.currentTime);
    osc.connect(g).connect(dest);
    osc.start();
    return [osc, g];
  },
  MARS: (ctx, dest) => {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer; src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.1, ctx.currentTime);
    src.connect(filter).connect(g).connect(dest);
    src.start();
    return [src, filter, g];
  },
  JUPITER: (ctx, dest) => {
    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0.2, ctx.currentTime);
    mainGain.connect(dest);
    const nodes: any[] = [mainGain];
    const sub = ctx.createOscillator();
    sub.type = 'sawtooth';
    sub.frequency.setValueAtTime(32.7, ctx.currentTime); 
    const subFilter = ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(60, ctx.currentTime);
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.4, ctx.currentTime);
    sub.connect(subFilter).connect(subGain).connect(mainGain);
    sub.start();
    nodes.push(sub, subFilter, subGain);
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 5, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) noiseData[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer; noise.loop = true;
    const stormFilter = ctx.createBiquadFilter();
    stormFilter.type = 'lowpass';
    stormFilter.frequency.setValueAtTime(150, ctx.currentTime);
    stormFilter.Q.setValueAtTime(10, ctx.currentTime);
    const stormLfo = ctx.createOscillator();
    stormLfo.frequency.setValueAtTime(0.05, ctx.currentTime);
    const stormLfoG = ctx.createGain();
    stormLfoG.gain.setValueAtTime(100, ctx.currentTime);
    stormLfo.connect(stormLfoG).connect(stormFilter.frequency);
    const stormG = ctx.createGain();
    stormG.gain.setValueAtTime(0.15, ctx.currentTime);
    noise.connect(stormFilter).connect(stormG).connect(mainGain);
    noise.start(); stormLfo.start();
    nodes.push(noise, stormFilter, stormLfo, stormLfoG, stormG);
    const staticG = ctx.createGain();
    staticG.gain.setValueAtTime(0.02, ctx.currentTime);
    const staticFilter = ctx.createBiquadFilter();
    staticFilter.type = 'highpass';
    staticFilter.frequency.setValueAtTime(8000, ctx.currentTime);
    const staticLfo = ctx.createOscillator();
    staticLfo.frequency.setValueAtTime(8, ctx.currentTime);
    staticLfo.connect(staticG.gain);
    noise.connect(staticFilter).connect(staticG).connect(mainGain);
    staticLfo.start();
    nodes.push(staticFilter, staticG, staticLfo);
    return nodes;
  },
  SATURN: (ctx, dest) => {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.connect(dest);
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.connect(g);
    osc.start();
    return [g, osc];
  },
  URANUS: (ctx, dest) => {
    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0.15, ctx.currentTime);
    mainGain.connect(dest);
    const nodes: any[] = [mainGain];
    
    // Icy FM Synthesis
    const carrier = ctx.createOscillator();
    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(110, ctx.currentTime);
    
    const modulator = ctx.createOscillator();
    modulator.type = 'sine';
    modulator.frequency.setValueAtTime(2.5, ctx.currentTime);
    
    const modGain = ctx.createGain();
    modGain.gain.setValueAtTime(30, ctx.currentTime);
    
    modulator.connect(modGain).connect(carrier.frequency);
    
    const cGain = ctx.createGain();
    cGain.gain.setValueAtTime(0.2, ctx.currentTime);
    carrier.connect(cGain).connect(mainGain);
    
    carrier.start(); modulator.start();
    nodes.push(carrier, modulator, modGain, cGain);
    
    // Shimmering High-Pass Noise
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) noiseData[i] = Math.random() * 2 - 1;
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer; noiseSrc.loop = true;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(8000, ctx.currentTime);
    
    const nGain = ctx.createGain();
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.1, ctx.currentTime);
    lfo.connect(nGain.gain);
    nGain.gain.setValueAtTime(0.05, ctx.currentTime);
    
    noiseSrc.connect(filter).connect(nGain).connect(mainGain);
    noiseSrc.start(); lfo.start();
    nodes.push(noiseSrc, filter, nGain, lfo);
    
    return nodes;
  },
  NEPTUNE: (ctx, dest) => {
    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0.18, ctx.currentTime);
    mainGain.connect(dest);
    const nodes: any[] = [mainGain];
    
    // Supersonic Wind Layers
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) data[i] = Math.random() * 2 - 1;
    const wind = ctx.createBufferSource();
    wind.buffer = buffer; wind.loop = true;
    
    const bpFilter = ctx.createBiquadFilter();
    bpFilter.type = 'bandpass';
    bpFilter.frequency.setValueAtTime(1500, ctx.currentTime);
    bpFilter.Q.setValueAtTime(5, ctx.currentTime);
    
    const sweepLfo = ctx.createOscillator();
    sweepLfo.frequency.setValueAtTime(0.08, ctx.currentTime);
    const sweepG = ctx.createGain();
    sweepG.gain.setValueAtTime(1200, ctx.currentTime);
    sweepLfo.connect(sweepG).connect(bpFilter.frequency);
    
    const windG = ctx.createGain();
    windG.gain.setValueAtTime(0.12, ctx.currentTime);
    wind.connect(bpFilter).connect(windG).connect(mainGain);
    
    wind.start(); sweepLfo.start();
    nodes.push(wind, bpFilter, sweepLfo, sweepG, windG);
    
    // Abyssal Sub-Bass Rumble
    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(27.5, ctx.currentTime); // A0
    const subG = ctx.createGain();
    subG.gain.setValueAtTime(0.25, ctx.currentTime);
    sub.connect(subG).connect(mainGain);
    sub.start();
    nodes.push(sub, subG);
    
    // Ultra-Sonic Flutter
    const flutter = ctx.createOscillator();
    flutter.type = 'sine';
    flutter.frequency.setValueAtTime(14000, ctx.currentTime);
    const fG = ctx.createGain();
    const fLfo = ctx.createOscillator();
    fLfo.frequency.setValueAtTime(12, ctx.currentTime);
    fLfo.connect(fG.gain);
    fG.gain.setValueAtTime(0.01, ctx.currentTime);
    flutter.connect(fG).connect(mainGain);
    flutter.start(); fLfo.start();
    nodes.push(flutter, fG, fLfo);
    
    return nodes;
  },
  PLUTO: (ctx, dest) => {
    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0.12, ctx.currentTime);
    mainGain.connect(dest);
    const nodes: any[] = [mainGain];
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 5, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) data[i] = Math.random() * 2 - 1;
    const voidSrc = ctx.createBufferSource();
    voidSrc.buffer = buffer; voidSrc.loop = true;
    const notch = ctx.createBiquadFilter();
    notch.type = 'notch';
    notch.frequency.setValueAtTime(400, ctx.currentTime);
    notch.Q.setValueAtTime(1, ctx.currentTime);
    const vG = ctx.createGain();
    vG.gain.setValueAtTime(0.05, ctx.currentTime);
    voidSrc.connect(notch).connect(vG).connect(mainGain);
    voidSrc.start();
    nodes.push(voidSrc, notch, vG);
    const heart = ctx.createOscillator();
    heart.type = 'sine';
    heart.frequency.setValueAtTime(174, ctx.currentTime); 
    const hG = ctx.createGain();
    hG.gain.setValueAtTime(0, ctx.currentTime);
    const pulseLfo = ctx.createOscillator();
    pulseLfo.frequency.setValueAtTime(0.05, ctx.currentTime);
    const pulseLfoG = ctx.createGain();
    pulseLfoG.gain.setValueAtTime(0.08, ctx.currentTime);
    pulseLfo.connect(pulseLfoG).connect(hG.gain);
    heart.connect(hG).connect(mainGain);
    heart.start(); pulseLfo.start();
    nodes.push(heart, hG, pulseLfo, pulseLfoG);
    const pingInterval = setInterval(() => {
      const pingNow = ctx.currentTime;
      const ping = ctx.createOscillator();
      ping.type = 'sine';
      ping.frequency.setValueAtTime(1200 + Math.random() * 3000, pingNow);
      const pG = ctx.createGain();
      pG.gain.setValueAtTime(0, pingNow);
      pG.gain.linearRampToValueAtTime(0.02, pingNow + 0.1);
      pG.gain.exponentialRampToValueAtTime(0.0001, pingNow + 4);
      ping.connect(pG).connect(mainGain);
      ping.start(pingNow); ping.stop(pingNow + 5);
    }, 15000);
    nodes.push({ stop: () => clearInterval(pingInterval) });
    return nodes;
  }
};

const PlanetaryMission: React.FC<{ setView: (v: AppView) => void; setIsAnyTrackPlaying: (playing: boolean) => void }> = ({ setView, setIsAnyTrackPlaying }) => {
  const [activePlanet, setActivePlanet] = useState<Planet>(PLANETS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<any[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoPromiseRef = useRef<Promise<void> | null>(null);

  const initAudio = useCallback(async () => {
    if (!audioContextRef.current) {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      audioContextRef.current = new AudioContextClass();
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.connect(audioContextRef.current.destination);
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.setValueAtTime(isMuted ? 0 : volume, audioContextRef.current.currentTime);
      gainNodeRef.current.connect(masterGainRef.current);
    }
    if (audioContextRef.current.state === 'suspended') {
      try { await audioContextRef.current.resume(); } catch (e) { console.warn("AudioContext resume failed", e); }
    }
    return true;
  }, [volume, isMuted]);

  const stopSynthesis = useCallback(() => {
    nodesRef.current.forEach(node => {
      try { 
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    nodesRef.current = [];
    setIsPlaying(false);
    setIsAnyTrackPlaying(false);
    setIsLoading(false);
  }, [setIsAnyTrackPlaying]);

  const startSynthesis = useCallback(async (type: string) => {
    if (isMuted) {
      setIsLoading(false);
      return;
    }
    try {
      await initAudio();
      const ctx = audioContextRef.current!;
      const dest = gainNodeRef.current!;
      nodesRef.current.forEach(node => {
        try { 
          if (node.stop) node.stop();
          if (node.disconnect) node.disconnect();
        } catch (e) {}
      });
      nodesRef.current = [];
      const synthesizer = PLANET_SYNTHESIZERS[type];
      if (synthesizer) {
        nodesRef.current = synthesizer(ctx, dest);
        setIsPlaying(true);
        setIsAnyTrackPlaying(true);
      }
    } catch (e) { console.error("Synthesis failed", e); } finally { setIsLoading(false); }
  }, [initAudio, isMuted, setIsAnyTrackPlaying]);

  // Handle Video Guard and source errors
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying && !isMuted && activePlanet.videoUrl && !videoError) {
      videoPromiseRef.current = video.play();
      videoPromiseRef.current.catch(err => {
        if (err.name !== 'AbortError') {
          console.warn("Video playback failed or was interrupted:", err);
          setVideoError(true);
        }
      });
    } else {
      if (videoPromiseRef.current !== null) {
        videoPromiseRef.current.then(() => {
          if (videoRef.current) videoRef.current.pause();
        }).catch(() => {
          if (videoRef.current) videoRef.current.pause();
        });
      } else {
        video.pause();
      }
    }
  }, [isPlaying, isMuted, activePlanet, videoError]);

  const toggleMute = useCallback(() => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (nextMute) {
      stopSynthesis();
    } else if (isPlaying) {
      startSynthesis(activePlanet.synthesis);
    }
  }, [isMuted, isPlaying, stopSynthesis, startSynthesis, activePlanet]);

  const handlePlanetSelect = async (p: Planet) => {
    if (isLoading) return;
    setIsLoading(true);
    setVideoError(false); 

    if (activePlanet.id === p.id && isPlaying && !isMuted) {
      stopSynthesis();
      return;
    }
    setActivePlanet(p);
    if (!isMuted) { await startSynthesis(p.synthesis); } else { stopSynthesis(); }
  };

  useEffect(() => {
    let timer: any;
    if (isPlaying) timer = setInterval(() => setSessionTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      stopSynthesis();
      setIsAnyTrackPlaying(false);
    };
  }, [stopSynthesis, setIsAnyTrackPlaying]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in slide-in-from-bottom-8 duration-1000 pb-40 px-2 md:px-0">
      <div className="flex justify-between items-center">
        <button 
          onClick={() => { stopSynthesis(); setView(AppView.DASHBOARD); }}
          className="flex items-center gap-2 text-amber-700 label-caps text-[10px] md:text-xs hover:gap-3 transition-all"
        >
          <ChevronLeft size={16} /> Return to Home
        </button>
        <div className="flex items-center gap-4">
           <div className="bg-white/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white shadow-sm flex items-center gap-3">
             <div className="flex items-center gap-2">
                <Timer size={14} className="text-amber-600" />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest font-display text-slate-900">{formatTime(sessionTime)}</span>
             </div>
           </div>
           <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white shadow-sm flex items-center gap-3">
            <button 
              onClick={toggleMute}
              className={`transition-colors outline-none ${isMuted ? 'text-slate-400' : 'text-amber-700'}`}
              title={isMuted ? "Unmute" : "Mute & Stop Audio"}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input 
              type="range" min="0" max="1" step="0.01" 
              className="w-20 md:w-32 h-1 bg-amber-100 rounded-full appearance-none cursor-pointer accent-amber-700"
              value={volume}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setVolume(val);
                if (gainNodeRef.current && audioContextRef.current && !isMuted) {
                  gainNodeRef.current.gain.setValueAtTime(val, audioContextRef.current.currentTime);
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className="relative h-[450px] md:h-[650px] rounded-[3rem] md:rounded-[5rem] overflow-hidden group shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] ring-1 ring-white/10">
        <div className="absolute inset-0 bg-black">
          <img 
            src={activePlanet.imageUrl} 
            alt={activePlanet.name}
            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[40000ms] scale-125 group-hover:scale-100 ease-linear opacity-70`}
          />
          {activePlanet.videoUrl && !videoError && (
            <video 
              key={activePlanet.id} 
              ref={videoRef}
              src={activePlanet.videoUrl} 
              loop 
              muted 
              playsInline
              preload="auto"
              onError={() => {
                console.warn("Media source failed to load for planet:", activePlanet.id);
                setVideoError(true);
              }}
              className="absolute inset-0 w-full h-full object-cover opacity-70 transition-transform duration-[40000ms] scale-125 group-hover:scale-100 ease-linear"
            />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-between text-white p-8 md:p-16 z-10 text-center">
          <div className="space-y-3 pt-6 md:pt-10">
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-amber-500/10 backdrop-blur-3xl rounded-full border border-amber-500/30">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-amber-200">Celestial Data Feed</p>
            </div>
            <h2 className="text-6xl md:text-[10rem] font-black tracking-tighter drop-shadow-2xl text-white leading-none">{activePlanet.name}</h2>
            <div className="flex flex-col items-center gap-2">
              <p className="text-base md:text-2xl text-amber-200 font-bold italic tracking-wide max-w-2xl mx-auto drop-shadow-lg opacity-90">"{activePlanet.mission}"</p>
              <div className="flex items-center gap-3 px-5 py-2.5 bg-white/10 backdrop-blur-3xl rounded-full border border-white/20 mt-4 shadow-2xl">
                <Music size={18} className="text-amber-400" />
                <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white">Track: {activePlanet.audioTrackName}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-20 w-full justify-center">
            <div className="hidden lg:flex flex-col items-end gap-6 text-right">
               <div className="space-y-1">
                 <p className="label-caps text-white/40">Temperature</p>
                 <p className="text-3xl font-black text-white font-display">{activePlanet.metrics.temp}</p>
               </div>
               <div className="space-y-1">
                 <p className="label-caps text-white/40">Hazard Rating</p>
                 <p className={`text-xl font-black font-display ${activePlanet.metrics.hazard === 'EXTREME' || activePlanet.metrics.hazard === 'CRITICAL' ? 'text-red-500' : 'text-emerald-500'}`}>{activePlanet.metrics.hazard}</p>
               </div>
            </div>
            <button 
              onClick={() => handlePlanetSelect(activePlanet)}
              disabled={isLoading}
              className="w-28 h-28 md:w-36 md:h-36 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:scale-110 active:scale-95 transition-all z-20"
            >
              {isLoading ? <Loader2 size={40} className="animate-spin text-amber-600" /> : isPlaying && !isMuted ? <Pause size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" className="ml-2" />}
            </button>
            <div className="hidden lg:flex flex-col items-start gap-6 text-left">
               <div className="space-y-1">
                 <p className="label-caps text-white/40">Distance from Earth</p>
                 <p className="text-3xl font-black text-white font-display">{activePlanet.metrics.distance}</p>
               </div>
               <div className="space-y-1">
                 <p className="label-caps text-white/40">Scan Frequency</p>
                 <p className="text-xl font-black text-amber-400 font-display">8.42 kHz</p>
               </div>
            </div>
          </div>
          <div className="pb-4">
             <div className="flex items-center gap-8 justify-center">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-amber-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Neural Pulse Synced</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Atmosphere Filtered</span>
                </div>
             </div>
          </div>
        </div>
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-black/40 to-transparent"></div>
          <div className="absolute inset-0 opacity-10 mix-blend-screen bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <h3 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">Celestial Exploration</h3>
            <p className="text-slate-500 font-bold text-lg md:text-2xl">Escape the atmosphere. Select your next meditation orbit.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {PLANETS.map(p => (
            <button 
              key={p.id}
              onClick={() => handlePlanetSelect(p)}
              className={`group relative flex flex-col items-center justify-center p-6 rounded-[2.5rem] transition-all duration-500 overflow-hidden outline-none ${activePlanet.id === p.id ? 'bg-slate-950 text-white shadow-2xl scale-105 ring-4 ring-amber-500/50' : 'bg-white hover:bg-slate-50 border border-slate-100 hover:scale-105'}`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-500 ${activePlanet.id === p.id ? 'bg-amber-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-110' : 'bg-slate-100 text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-600'}`}>
                {p.id === 'sun' ? <SunIcon size={28} /> : p.id === 'moon' ? <Moon size={28} /> : p.id === 'earth' ? <Globe size={28} /> : <Stars size={28} />}
              </div>
              <div className="text-center space-y-1">
                <h4 className="font-black text-lg tracking-tight leading-none">{p.name}</h4>
                <p className={`text-[9px] uppercase tracking-widest font-black ${activePlanet.id === p.id ? 'text-amber-400' : 'text-slate-400'}`}>{p.desc}</p>
              </div>
              <div className="mt-6 w-full h-1 bg-slate-200/20 rounded-full overflow-hidden">
                 <div className={`h-full bg-amber-500 transition-all duration-1000 ${activePlanet.id === p.id ? 'w-full' : 'w-0'}`}></div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanetaryMission;