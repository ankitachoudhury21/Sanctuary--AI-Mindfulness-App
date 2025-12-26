import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppView } from '../types';
import { 
  ChevronLeft, Play, Pause, Rocket, Loader2, Volume2, VolumeX, 
  Timer, Sparkles, Activity, Shield, Zap, Music, Radio, Map, Eye
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
    diameter: string;
  };
}

const PLANETS: Planet[] = [
  { 
    id: 'sun', 
    name: 'The Sun', 
    desc: 'Solar Core: G-Type Star', 
    color: 'from-orange-500 to-yellow-600', 
    videoUrl: 'https://cdn.pixabay.com/vimeo/312061265/sun-1358.mp4?width=1280', 
    imageUrl: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&q=80&w=2000',
    synthesis: 'SUN', 
    mission: 'Harness the raw energy of existence.', 
    audioTrackName: 'Solar Flare Resonance',
    metrics: { temp: '5,500°C', distance: '0.0 AU', hazard: 'EXTREME', diameter: '1.39M km' } 
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
    audioTrackName: 'Core Vibrations',
    metrics: { temp: '430°C', distance: '0.39 AU', hazard: 'HIGH', diameter: '4,879 km' } 
  },
  { 
    id: 'venus', 
    name: 'Venus', 
    desc: 'Dense: Sulfuric Greenhouse', 
    color: 'from-orange-300 to-amber-600', 
    videoUrl: 'https://cdn.pixabay.com/vimeo/186596918/venus-5743.mp4?width=1280', 
    imageUrl: 'https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?auto=format&fit=crop&q=80&w=2000',
    synthesis: 'VENUS', 
    mission: 'Navigate the pressure of the eternal storm.', 
    audioTrackName: "Acid Cloud Echo",
    metrics: { temp: '462°C', distance: '0.72 AU', hazard: 'CRITICAL', diameter: '12,104 km' } 
  },
  { 
    id: 'earth', 
    name: 'Earth', 
    desc: 'Organic: Pale Blue Dot', 
    color: 'from-blue-400 to-emerald-500', 
    videoUrl: 'https://cdn.pixabay.com/vimeo/158300267/earth-2384.mp4?width=1280', 
    imageUrl: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bac4?auto=format&fit=crop&q=80&w=2000',
    synthesis: 'EARTH', 
    mission: 'Rediscover the heartbeat of home.', 
    audioTrackName: "Gaia's Resonant Heartbeat",
    metrics: { temp: '15°C', distance: '1.0 AU', hazard: 'MINIMAL', diameter: '12,742 km' } 
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
    audioTrackName: 'Regolith Echo',
    metrics: { temp: '-173°C', distance: '384k km', hazard: 'LOW', diameter: '3,474 km' } 
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
    audioTrackName: 'Sol 1 Winds',
    metrics: { temp: '-63°C', distance: '1.52 AU', hazard: 'MODERATE', diameter: '6,779 km' } 
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
    metrics: { temp: '-108°C', distance: '5.20 AU', hazard: 'HIGH', diameter: '139,820 km' } 
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
    audioTrackName: 'Orbital Crystalline Chant',
    metrics: { temp: '-138°C', distance: '9.58 AU', hazard: 'MODERATE', diameter: '116,460 km' } 
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
    metrics: { temp: '-195°C', distance: '19.2 AU', hazard: 'HIGH', diameter: '50,724 km' } 
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
    audioTrackName: 'Great Dark Spot Hums',
    metrics: { temp: '-201°C', distance: '30.1 AU', hazard: 'HIGH', diameter: '49,244 km' } 
  },
  { 
    id: 'pluto', 
    name: 'Pluto', 
    desc: 'Dwarf: Glacial Heart', 
    color: 'from-slate-700 to-slate-900', 
    videoUrl: '', 
    imageUrl: 'https://images.unsplash.com/photo-1502139173938-c782ad215302?auto=format&fit=crop&q=80&w=2000',
    synthesis: 'PLUTO', 
    mission: 'Reflect at the final frontier of home.', 
    audioTrackName: 'Kuiper Belt Void',
    metrics: { temp: '-232°C', distance: '39.5 AU', hazard: 'LOW', diameter: '2,376 km' } 
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
    const core = ctx.createOscillator();
    core.type = 'sine';
    core.frequency.setValueAtTime(48.99, ctx.currentTime); 
    const coreG = ctx.createGain();
    coreG.gain.setValueAtTime(0.35, ctx.currentTime);
    core.connect(coreG).connect(mainGain);
    core.start();
    nodes.push(core, coreG);
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
    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(27.5, ctx.currentTime); 
    const subG = ctx.createGain();
    subG.gain.setValueAtTime(0.25, ctx.currentTime);
    sub.connect(subG).connect(mainGain);
    sub.start();
    nodes.push(sub, subG);
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
  const [activePlanet, setActivePlanet] = useState<Planet>(PLANETS[3]); // Default to Earth
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

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
    setIsScanning(true);
    setVideoError(false); 

    setTimeout(() => setIsScanning(false), 2000);

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
    <div className="space-y-8 md:space-y-12 animate-in slide-in-from-bottom-8 duration-1000 pb-40 px-2 md:px-0 max-w-7xl mx-auto">
      <div className="flex justify-between items-center px-4">
        <div className="space-y-1">
          <button 
            onClick={() => { stopSynthesis(); setView(AppView.DASHBOARD); }}
            className="flex items-center gap-2 text-teal-800 label-caps text-[10px] md:text-xs hover:gap-3 transition-all mb-2"
          >
            <ChevronLeft size={16} /> Exit Observation Deck
          </button>
          <h2 className="text-3xl md:text-6xl font-black text-slate-950 tracking-tighter leading-none">Observation Deck</h2>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden sm:flex bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-slate-200 shadow-xl items-center gap-3">
             <Radio size={14} className="text-teal-600 animate-pulse" />
             <span className="text-[10px] md:text-xs font-black uppercase tracking-widest font-display text-slate-900">Spectral Link: ACTIVE</span>
           </div>
           <div className="bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-slate-200 shadow-xl flex items-center gap-3">
            <button 
              onClick={toggleMute}
              className={`transition-all hover:scale-110 active:scale-95 outline-none ${isMuted ? 'text-slate-400' : 'text-teal-700'}`}
              title={isMuted ? "Unmute" : "Mute & Stop Audio"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input 
              type="range" min="0" max="1" step="0.01" 
              className="w-16 md:w-32 h-1 bg-teal-100 rounded-full appearance-none cursor-pointer accent-teal-700"
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

      <div className="relative h-[420px] md:h-[650px] rounded-[3.5rem] md:rounded-[5rem] overflow-hidden group shadow-[0_50px_120px_-30px_rgba(0,0,0,0.6)] ring-1 ring-white/30 border-4 border-white/15">
        <div className="absolute inset-0 bg-black">
          <img 
            src={activePlanet.imageUrl} 
            alt={activePlanet.name}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-[80000ms] ${isPlaying ? 'scale-125 rotate-1' : 'scale-110'} ease-linear opacity-90`}
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
              onError={() => setVideoError(true)}
              className="absolute inset-0 w-full h-full object-cover opacity-90"
            />
          )}
        </div>
        
        {/* Advanced HUD Overlays */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          <div className="absolute top-12 left-12 w-40 h-40 border-l-2 border-t-2 border-white/40 rounded-tl-[3rem] opacity-60"></div>
          <div className="absolute top-12 right-12 w-40 h-40 border-r-2 border-t-2 border-white/40 rounded-tr-[3rem] opacity-60"></div>
          <div className="absolute bottom-12 left-12 w-40 h-40 border-l-2 border-b-2 border-white/40 rounded-bl-[3rem] opacity-60"></div>
          <div className="absolute bottom-12 right-12 w-40 h-40 border-r-2 border-b-2 border-white/40 rounded-br-[3rem] opacity-60"></div>
          
          {/* Scanning Effect */}
          {isScanning && (
            <div className="absolute inset-0 z-30">
               <div className="w-full h-24 bg-gradient-to-b from-teal-500/0 via-teal-500/30 to-teal-500/0 blur-xl absolute top-0 animate-[scan_2.5s_ease-in-out_infinite]"></div>
               <div className="w-full h-[2px] bg-teal-400/80 absolute top-0 animate-[scan_2.5s_ease-in-out_infinite] shadow-[0_0_20px_rgba(45,212,191,1)]"></div>
            </div>
          )}

          {/* Compass Rose HUD */}
          <div className="absolute top-1/2 left-8 -translate-y-1/2 flex flex-col gap-8 opacity-40">
             {[0, 90, 180, 270].map(deg => (
               <div key={deg} className="w-1 bg-white h-4 rounded-full"></div>
             ))}
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/40 z-10"></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-between text-white p-10 md:p-20 z-30 text-center">
          <div className="space-y-6 pt-6">
            <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-white/10 backdrop-blur-3xl rounded-full border border-white/25 shadow-2xl animate-pulse">
              <Sparkles size={16} className="text-teal-300" />
              <p className="text-[10px] md:text-sm font-black uppercase tracking-[0.5em] text-white">Spectral Telemetry Feed</p>
            </div>
            <h2 className="text-7xl md:text-[11rem] font-black tracking-tighter drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-white leading-none uppercase select-none italic">{activePlanet.name}</h2>
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm md:text-3xl text-teal-50 font-medium italic tracking-wide max-w-3xl mx-auto drop-shadow-2xl opacity-95 leading-relaxed">"{activePlanet.mission}"</p>
              <div className="flex items-center gap-4 px-8 py-3 bg-teal-950/60 backdrop-blur-2xl rounded-full border border-teal-500/40 mt-4 shadow-[0_0_40px_rgba(45,212,191,0.2)] transition-all hover:bg-teal-950/80 group pointer-events-auto cursor-help">
                <Radio size={20} className="text-teal-400 group-hover:rotate-12 transition-transform" />
                <span className="text-xs md:text-lg font-black uppercase tracking-[0.3em] text-white">X-Band Audio: {activePlanet.audioTrackName}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-32 w-full justify-center">
            <div className="hidden lg:grid grid-cols-1 gap-10 text-right">
               <div className="space-y-1">
                 <p className="text-xs uppercase tracking-[0.3em] text-white/50 font-black flex items-center justify-end gap-3"><Activity size={14} className="text-orange-400"/> Surface Temp</p>
                 <p className="text-4xl font-black text-white font-display uppercase tracking-tight">{activePlanet.metrics.temp}</p>
               </div>
               <div className="space-y-1">
                 <p className="text-xs uppercase tracking-[0.3em] text-white/50 font-black flex items-center justify-end gap-3"><Shield size={14} className="text-rose-400"/> Toxicity Level</p>
                 <p className={`text-2xl font-black font-display uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] ${activePlanet.metrics.hazard === 'EXTREME' || activePlanet.metrics.hazard === 'CRITICAL' ? 'text-rose-500' : 'text-emerald-400'}`}>{activePlanet.metrics.hazard}</p>
               </div>
            </div>

            <button 
              onClick={() => handlePlanetSelect(activePlanet)}
              disabled={isLoading}
              className="w-28 h-28 md:w-40 md:h-40 bg-white text-slate-950 rounded-full flex items-center justify-center shadow-[0_0_100px_rgba(255,255,255,0.6)] hover:scale-110 active:scale-90 transition-all z-40 group pointer-events-auto"
            >
              {isLoading ? (
                <Loader2 size={50} className="animate-spin text-teal-600" />
              ) : isPlaying && !isMuted ? (
                <Pause size={64} fill="currentColor" className="group-hover:scale-110 transition-transform" />
              ) : (
                <Play size={64} fill="currentColor" className="ml-3 group-hover:scale-110 transition-transform" />
              )}
            </button>

            <div className="hidden lg:grid grid-cols-1 gap-10 text-left">
               <div className="space-y-1">
                 <p className="text-xs uppercase tracking-[0.3em] text-white/50 font-black flex items-center gap-3"><Map size={14} className="text-blue-400"/> Geodesic Distance</p>
                 <p className="text-4xl font-black text-white font-display uppercase tracking-tight">{activePlanet.metrics.distance}</p>
               </div>
               <div className="space-y-1">
                 <p className="text-xs uppercase tracking-[0.3em] text-white/50 font-black flex items-center gap-3"><Eye size={14} className="text-teal-400"/> Core Diameter</p>
                 <p className="text-2xl font-black text-teal-400 font-display uppercase">{activePlanet.metrics.diameter}</p>
               </div>
            </div>
          </div>

          <div className="w-full flex justify-between items-end px-6 opacity-80 pointer-events-none">
             <div className="flex flex-col items-start gap-1">
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Chronometer</p>
               <p className="text-3xl font-black display-number text-teal-300 drop-shadow-[0_0_10px_rgba(45,212,191,0.5)]">{formatTime(sessionTime)}</p>
             </div>
             <div className="flex items-center gap-10">
                <div className="flex items-center gap-3">
                  <Activity size={18} className="text-teal-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Neural Integration: 99.4%</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield size={18} className="text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Atmospheric Scrub: ON</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="space-y-12 px-4">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b-2 border-slate-100 pb-10">
          <div className="space-y-2">
            <h3 className="text-4xl md:text-5xl font-black text-slate-950 tracking-tighter leading-none">Celestial Navigation</h3>
            <p className="text-slate-500 font-bold text-lg md:text-2xl italic max-w-2xl leading-relaxed">Initiate neural-sync by selecting a high-fidelity planetary target for spectral meditation.</p>
          </div>
          <div className="flex items-center gap-4 px-6 py-3 bg-slate-100 rounded-2xl text-slate-600 text-xs font-black uppercase tracking-[0.25em] shadow-inner">
             <Radio size={16} className="animate-pulse text-teal-600" /> Deep Space Network v4.2
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
          {PLANETS.map(p => {
            const isActive = activePlanet.id === p.id;
            return (
              <button 
                key={p.id}
                onClick={() => handlePlanetSelect(p)}
                className={`group relative flex flex-col items-center justify-center p-8 rounded-[3.5rem] transition-all duration-700 overflow-hidden outline-none ${isActive ? 'bg-slate-950 text-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] scale-105 ring-4 ring-teal-500/50 translate-y-[-8px]' : 'bg-white hover:bg-slate-50 border border-slate-200 hover:shadow-2xl hover:translate-y-[-4px]'}`}
              >
                {/* Scientifically Accurate Planet Thumbnail */}
                <div className={`w-28 h-28 rounded-full mb-6 relative overflow-hidden transition-all duration-700 ring-2 ring-transparent ${isActive ? 'ring-teal-400 ring-offset-4 ring-offset-slate-950 scale-110 shadow-[0_0_40px_rgba(45,212,191,0.4)]' : 'group-hover:scale-105'}`}>
                  <img src={p.imageUrl} alt={p.name} className={`w-full h-full object-cover transition-transform duration-[20000ms] group-hover:scale-150 ${isActive ? 'animate-[spin_60s_linear_infinite]' : ''}`} />
                  <div className={`absolute inset-0 bg-gradient-to-br ${p.color} opacity-30 mix-blend-overlay`}></div>
                  <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.4)]"></div>
                </div>

                <div className="text-center space-y-2">
                  <h4 className="font-black text-xl tracking-tight leading-none uppercase group-hover:text-teal-600 transition-colors">{p.name}</h4>
                  <p className={`text-[10px] uppercase tracking-[0.3em] font-black ${isActive ? 'text-teal-400' : 'text-slate-400'}`}>{p.desc.split(':')[0]}</p>
                </div>

                {isActive && (
                  <div className="absolute top-4 right-4">
                    <div className="w-3 h-3 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,1)]"></div>
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-teal-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: -10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default PlanetaryMission;