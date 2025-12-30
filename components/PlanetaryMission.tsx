
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppView } from '../types';
import { 
  ChevronLeft, Play, Pause, Rocket, Loader2, Volume2, VolumeX, 
  Zap, Music, Radio, Eye
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
    pressure?: string;
    gravity?: string;
  };
}

const PLANETS: Planet[] = [
  { 
    id: 'sun', 
    name: 'The Sun', 
    desc: 'Solar Core: G-Type Star', 
    color: 'from-orange-600 to-yellow-500', 
    videoUrl: '', 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg/1280px-The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg',
    synthesis: 'SUN', 
    mission: 'Surrender to the radiant warmth of existence.', 
    audioTrackName: 'Radiant Solar Breath',
    metrics: { temp: '5,500°C', distance: '0.0 AU', hazard: 'EXTREME', diameter: '1.39M km', gravity: '274 m/s²' } 
  },
  { 
    id: 'mercury', 
    name: 'Mercury', 
    desc: 'Craters: Metallic Core', 
    color: 'from-slate-500 to-slate-700', 
    videoUrl: '', 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Mercury_in_true_color.jpg/1280px-Mercury_in_true_color.jpg',
    synthesis: 'MERCURY', 
    mission: 'Endure the extremes of the inner circle.', 
    audioTrackName: 'Core Vibrations',
    metrics: { temp: '430°C', distance: '0.39 AU', hazard: 'HIGH', diameter: '4,879 km', gravity: '3.7 m/s²' } 
  },
  { 
    id: 'venus', 
    name: 'Venus', 
    desc: 'Dense: Sulfuric Greenhouse', 
    color: 'from-orange-300 to-amber-600', 
    videoUrl: '', 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Venus_from_Mariner_10.jpg/1280px-Venus_from_Mariner_10.jpg',
    synthesis: 'VENUS', 
    mission: 'Navigate the pressure of the eternal storm.', 
    audioTrackName: "Acid Cloud Echo",
    metrics: { temp: '462°C', distance: '0.72 AU', hazard: 'CRITICAL', diameter: '12,104 km', pressure: '92 bar' } 
  },
  { 
    id: 'earth', 
    name: 'Earth', 
    desc: 'Organic: Pale Blue Dot', 
    color: 'from-blue-600 to-emerald-400', 
    videoUrl: '', 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/1280px-The_Earth_seen_from_Apollo_17.jpg',
    synthesis: 'EARTH', 
    mission: 'Rediscover the heartbeat of home.', 
    audioTrackName: "Gaia's Resonant Heartbeat",
    metrics: { temp: '15°C', distance: '1.0 AU', hazard: 'MINIMAL', diameter: '12,742 km', gravity: '9.81 m/s²' } 
  },
  { 
    id: 'moon', 
    name: 'The Moon', 
    desc: 'Satellite: Lunar Stillness', 
    color: 'from-slate-300 to-slate-500', 
    videoUrl: '', 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/FullMoon2010.jpg/1280px-FullMoon2010.jpg',
    synthesis: 'MOON', 
    mission: 'Embrace the silence of the cosmic mirror.', 
    audioTrackName: 'Regolith Echo',
    metrics: { temp: '-173°C', distance: '384k km', hazard: 'LOW', diameter: '3,474 km', gravity: '1.62 m/s²' } 
  },
  { 
    id: 'mars', 
    name: 'Mars', 
    desc: 'Rust: The Crimson Frontier', 
    color: 'from-red-700 to-orange-900', 
    videoUrl: '', 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/OSIRIS_Mars_true_color.jpg/1280px-OSIRIS_Mars_true_color.jpg',
    synthesis: 'MARS', 
    mission: 'Chart the path across the crimson dust.', 
    audioTrackName: 'Sol 1 Winds',
    metrics: { temp: '-63°C', distance: '1.52 AU', hazard: 'MODERATE', diameter: '6,779 km', gravity: '3.72 m/s²' } 
  },
  { 
    id: 'jupiter', 
    name: 'Jupiter', 
    desc: 'Banded: Gas Colossus', 
    color: 'from-amber-700 to-orange-950', 
    videoUrl: '', 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Jupiter.jpg/1280px-Jupiter.jpg',
    synthesis: 'JUPITER', 
    mission: 'Witness the majesty of the Great Red Spot.', 
    audioTrackName: 'Great Red Resonance',
    metrics: { temp: '-108°C', distance: '5.20 AU', hazard: 'HIGH', diameter: '139,820 km', gravity: '24.79 m/s²' } 
  },
  { 
    id: 'saturn', 
    name: 'Saturn', 
    desc: 'Ringed: Lord of the Ice', 
    color: 'from-yellow-400 to-amber-700', 
    videoUrl: '', 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Saturn_during_Equinox.jpg/1280px-Saturn_during_Equinox.jpg',
    synthesis: 'SATURN', 
    mission: 'Listen to the shimmering songs of the rings.', 
    audioTrackName: 'Orbital Crystalline Chant',
    metrics: { temp: '-138°C', distance: '9.58 AU', hazard: 'MODERATE', diameter: '116,460 km', gravity: '10.44 m/s²' } 
  },
  { 
    id: 'uranus', 
    name: 'Uranus', 
    desc: 'Ice Giant: Aquamarine Veil', 
    color: 'from-cyan-400 to-blue-600', 
    videoUrl: '', 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Uranus2.jpg/1280px-Uranus2.jpg',
    synthesis: 'URANUS', 
    mission: 'Plunge into the crystalline turquoise depths.', 
    audioTrackName: 'Azure Ice Echo',
    metrics: { temp: '-195°C', distance: '19.2 AU', hazard: 'HIGH', diameter: '50,724 km', gravity: '8.69 m/s²' } 
  },
  { 
    id: 'neptune', 
    name: 'Neptune', 
    desc: 'Deep Blue: Wind Master', 
    color: 'from-blue-700 to-indigo-900', 
    videoUrl: '', 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Neptune_Full.jpg/1280px-Neptune_Full.jpg',
    synthesis: 'NEPTUNE', 
    mission: 'Surrender to the ultra-sonic azure winds.', 
    audioTrackName: 'Great Dark Spot Hums',
    metrics: { temp: '-201°C', distance: '30.1 AU', hazard: 'HIGH', diameter: '49,244 km', gravity: '11.15 m/s²' } 
  },
  { 
    id: 'pluto', 
    name: 'Pluto', 
    desc: 'Dwarf: Glacial Heart', 
    color: 'from-slate-600 to-amber-900', 
    videoUrl: '', 
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Pluto_in_True_Color_-_High-Res.jpg/1280px-Pluto_in_True_Color_-_High-Res.jpg',
    synthesis: 'PLUTO', 
    mission: 'Reflect at the final frontier of home.', 
    audioTrackName: 'Kuiper Belt Void',
    metrics: { temp: '-232°C', distance: '39.5 AU', hazard: 'LOW', diameter: '2,376 km', gravity: '0.62 m/s²' } 
  },
];

const safeValue = (value: number, min: number, max: number, defaultValue: number) => {
  if (isNaN(value) || !isFinite(value)) return defaultValue;
  return Math.max(min, Math.min(max, value));
};

type SynthesizerFunc = (ctx: AudioContext, dest: AudioNode) => any[];

const PLANET_SYNTHESIZERS: Record<string, SynthesizerFunc> = {
  SUN: (ctx, dest) => {
    const safeFreq = (value: number) => safeValue(value, 0.001, ctx.sampleRate / 2 - 1, 220);
    const safeGainValue = (value: number) => safeValue(value, 0.0001, 1, 0.05);
    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(safeGainValue(0.25), ctx.currentTime);
    mainGain.connect(dest);
    const nodes: any[] = [mainGain];
    const coreOsc = ctx.createOscillator();
    coreOsc.type = 'sine';
    coreOsc.frequency.setValueAtTime(safeFreq(126.22), ctx.currentTime);
    const coreLowpass = ctx.createBiquadFilter();
    coreLowpass.type = 'lowpass';
    coreLowpass.frequency.setValueAtTime(safeFreq(200), ctx.currentTime);
    const coreG = ctx.createGain();
    coreG.gain.setValueAtTime(safeGainValue(0.4), ctx.currentTime);
    coreOsc.connect(coreLowpass).connect(coreG).connect(mainGain);
    coreOsc.start();
    nodes.push(coreOsc, coreLowpass, coreG);
    const harmOsc = ctx.createOscillator();
    harmOsc.type = 'triangle';
    harmOsc.frequency.setValueAtTime(safeFreq(126.22 * 1.5), ctx.currentTime);
    const harmG = ctx.createGain();
    harmG.gain.setValueAtTime(safeGainValue(0.15), ctx.currentTime);
    const harmLfo = ctx.createOscillator();
    harmLfo.frequency.setValueAtTime(0.1, ctx.currentTime);
    const harmLfoG = ctx.createGain();
    harmLfoG.gain.setValueAtTime(safeGainValue(0.05), ctx.currentTime);
    harmLfo.connect(harmLfoG).connect(harmG.gain);
    harmOsc.connect(harmG).connect(mainGain);
    harmOsc.start(); harmLfo.start();
    nodes.push(harmOsc, harmG, harmLfo, harmLfoG);
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < noiseBuffer.length; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + (0.02 * white)) / 1.02;
        noiseData[i] = lastOut * 3.5;
    }
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer; noiseSrc.loop = true;
    const breathFilter = ctx.createBiquadFilter();
    breathFilter.type = 'lowpass';
    breathFilter.frequency.setValueAtTime(safeFreq(300), ctx.currentTime);
    const breathLfo = ctx.createOscillator();
    breathLfo.frequency.setValueAtTime(safeFreq(0.05), ctx.currentTime);
    const breathLfoG = ctx.createGain();
    breathLfoG.gain.setValueAtTime(safeGainValue(100), ctx.currentTime);
    breathLfo.connect(breathLfoG).connect(breathFilter.frequency);
    const breathGain = ctx.createGain();
    breathGain.gain.setValueAtTime(safeGainValue(0.1), ctx.currentTime);
    noiseSrc.connect(breathFilter).connect(breathGain).connect(mainGain);
    noiseSrc.start(); breathLfo.start();
    nodes.push(noiseSrc, breathFilter, breathLfo, breathLfoG, breathGain);
    const flareInterval = setInterval(() => {
      const now = ctx.currentTime;
      const fOsc = ctx.createOscillator();
      fOsc.type = 'sine';
      fOsc.frequency.setValueAtTime(safeFreq(504.88 + Math.random() * 100), now);
      const fEnv = ctx.createGain();
      fEnv.gain.setValueAtTime(0, now);
      fEnv.gain.linearRampToValueAtTime(safeGainValue(0.04), now + 3);
      fEnv.gain.exponentialRampToValueAtTime(0.0001, now + 10);
      fOsc.connect(fEnv).connect(mainGain);
      fOsc.start(now); fOsc.stop(now + 11);
    }, 12000);
    nodes.push({ stop: () => clearInterval(flareInterval) });
    return nodes;
  },
  MERCURY: (ctx, dest) => {
    const safeFreq = (value: number) => safeValue(value, 0.001, ctx.sampleRate / 2 - 1, 220); 
    const safeGainValue = (value: number) => safeValue(value, 0.0001, 1, 0.05); 
    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(safeGainValue(0.18), ctx.currentTime);
    mainGain.connect(dest);
    const nodes: any[] = [mainGain];
    const core = ctx.createOscillator();
    core.type = 'sine';
    core.frequency.setValueAtTime(safeFreq(48.99), ctx.currentTime); 
    const coreG = ctx.createGain();
    coreG.gain.setValueAtTime(safeGainValue(0.35), ctx.currentTime);
    core.connect(coreG).connect(mainGain);
    core.start();
    nodes.push(core, coreG);
    [2.01, 3.52, 5.03, 7.91].forEach((ratio, i) => {
      const harmonic = ctx.createOscillator();
      harmonic.type = 'sine';
      harmonic.frequency.setValueAtTime(safeFreq(48.99 * ratio), ctx.currentTime);
      const hGain = ctx.createGain();
      const hLfo = ctx.createOscillator();
      hLfo.frequency.setValueAtTime(safeFreq(0.1 + (i * 0.05)), ctx.currentTime);
      const hLfoG = ctx.createGain();
      hLfoG.gain.setValueAtTime(safeGainValue(0.05), ctx.currentTime);
      hLfo.connect(hLfoG).connect(hGain.gain);
      hGain.gain.setValueAtTime(safeGainValue(0.1 / (i + 1)), ctx.currentTime);
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
    hpFilter.frequency.setValueAtTime(safeFreq(6000), ctx.currentTime);
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(safeGainValue(0.04), ctx.currentTime);
    noiseSrc.connect(hpFilter).connect(nGain).connect(mainGain);
    noiseSrc.start();
    nodes.push(noiseSrc, hpFilter, nGain);
    return nodes;
  },
  VENUS: (ctx, dest) => {
    const safeFreq = (value: number) => safeValue(value, 0.001, ctx.sampleRate / 2 - 1, 220); 
    const safeGainValue = (value: number) => safeValue(value, 0.0001, 1, 0.05); 
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer; src.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(safeFreq(5000), ctx.currentTime);
    const g = ctx.createGain();
    g.gain.setValueAtTime(safeGainValue(0.04), ctx.currentTime);
    src.connect(hp).connect(g).connect(dest);
    src.start();
    return [src, hp, g];
  },
  EARTH: (ctx, dest) => {
    const safeFreq = (value: number) => safeValue(value, 0.001, ctx.sampleRate / 2 - 1, 220); 
    const safeGainValue = (value: number) => safeValue(value, 0.0001, 1, 0.05); 
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(safeGainValue(0.18), ctx.currentTime);
    masterGain.connect(dest);
    const nodes: any[] = [masterGain];
    const heart = ctx.createOscillator();
    heart.type = 'sine';
    heart.frequency.setValueAtTime(safeFreq(55), ctx.currentTime);
    const heartG = ctx.createGain();
    const heartLfo = ctx.createOscillator();
    heartLfo.frequency.setValueAtTime(safeFreq(0.66), ctx.currentTime);
    const heartLfoG = ctx.createGain();
    heartLfoG.gain.setValueAtTime(safeGainValue(0.1), ctx.currentTime);
    heartLfo.connect(heartLfoG).connect(heartG.gain);
    heartG.gain.setValueAtTime(safeGainValue(0.2), ctx.currentTime);
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
    windFilter.frequency.setValueAtTime(safeFreq(400), ctx.currentTime);
    const windLfo = ctx.createOscillator();
    windLfo.frequency.setValueAtTime(safeFreq(0.05), ctx.currentTime);
    const windLfoG = ctx.createGain();
    windLfoG.gain.setValueAtTime(safeGainValue(300), ctx.currentTime);
    windLfo.connect(windLfoG).connect(windFilter.frequency);
    const windG = ctx.createGain();
    windG.gain.setValueAtTime(safeGainValue(0.08), ctx.currentTime);
    noise.connect(windFilter).connect(windG).connect(masterGain);
    noise.start(); windLfo.start();
    nodes.push(noise, windFilter, windLfo, windLfoG, windG);
    [432, 528].forEach((f, i) => {
        const shimmer = ctx.createOscillator();
        shimmer.frequency.setValueAtTime(safeFreq(f), ctx.currentTime);
        const sG = ctx.createGain();
        sG.gain.setValueAtTime(0, ctx.currentTime);
        const sLfo = ctx.createOscillator();
        sLfo.frequency.setValueAtTime(safeFreq(0.1 + (i * 0.05)), ctx.currentTime);
        const sLfoG = ctx.createGain();
        sLfoG.gain.setValueAtTime(safeGainValue(0.02), ctx.currentTime);
        sLfo.connect(sLfoG).connect(sG.gain);
        shimmer.connect(sG).connect(masterGain);
        shimmer.start(); sLfo.start();
        nodes.push(shimmer, sG, sLfo, sLfoG);
    });
    return nodes;
  },
  MOON: (ctx, dest) => {
    const safeFreq = (value: number) => safeValue(value, 0.001, ctx.sampleRate / 2 - 1, 220); 
    const safeGainValue = (value: number) => safeValue(value, 0.0001, 1, 0.05); 
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(safeFreq(220), ctx.currentTime);
    const g = ctx.createGain();
    g.gain.setValueAtTime(safeGainValue(0.1), ctx.currentTime);
    osc.connect(g).connect(dest);
    osc.start();
    return [osc, g];
  },
  MARS: (ctx, dest) => {
    const safeFreq = (value: number) => safeValue(value, 0.001, ctx.sampleRate / 2 - 1, 220); 
    const safeGainValue = (value: number) => safeValue(value, 0.0001, 1, 0.05); 
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer; src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(safeFreq(400), ctx.currentTime);
    const g = ctx.createGain();
    g.gain.setValueAtTime(safeGainValue(0.1), ctx.currentTime);
    src.connect(filter).connect(g).connect(dest);
    src.start();
    return [src, filter, g];
  },
  JUPITER: (ctx, dest) => {
    const safeFreq = (value: number) => safeValue(value, 0.001, ctx.sampleRate / 2 - 1, 220); 
    const safeGainValue = (value: number) => safeValue(value, 0.0001, 1, 0.05); 
    const safeQValue = (value: number) => safeValue(value, 0.0001, 1000, 0.0001);
    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(safeGainValue(0.2), ctx.currentTime);
    mainGain.connect(dest);
    const nodes: any[] = [mainGain];
    const sub = ctx.createOscillator();
    sub.type = 'sawtooth';
    sub.frequency.setValueAtTime(safeFreq(32.7), ctx.currentTime); 
    const subFilter = ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(safeFreq(60), ctx.currentTime);
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(safeGainValue(0.4), ctx.currentTime);
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
    stormFilter.frequency.setValueAtTime(safeFreq(150), ctx.currentTime);
    stormFilter.Q.setValueAtTime(safeQValue(10), ctx.currentTime);
    const stormLfo = ctx.createOscillator();
    stormLfo.frequency.setValueAtTime(safeFreq(0.05), ctx.currentTime);
    const stormLfoG = ctx.createGain();
    stormLfoG.gain.setValueAtTime(safeGainValue(100), ctx.currentTime);
    stormLfo.connect(stormLfoG).connect(stormFilter.frequency);
    const stormG = ctx.createGain();
    stormG.gain.setValueAtTime(safeGainValue(0.15), ctx.currentTime);
    noise.connect(stormFilter).connect(stormG).connect(mainGain);
    noise.start(); stormLfo.start();
    nodes.push(noise, stormFilter, stormLfo, stormLfoG, stormG);
    const staticG = ctx.createGain();
    staticG.gain.setValueAtTime(safeGainValue(0.02), ctx.currentTime);
    const staticFilter = ctx.createBiquadFilter();
    staticFilter.type = 'highpass';
    staticFilter.frequency.setValueAtTime(safeFreq(8000), ctx.currentTime);
    const staticLfo = ctx.createOscillator();
    staticLfo.frequency.setValueAtTime(safeFreq(8), ctx.currentTime);
    staticLfo.connect(staticG.gain);
    noise.connect(staticFilter).connect(staticG).connect(mainGain);
    staticLfo.start();
    nodes.push(staticFilter, staticG, staticLfo);
    return nodes;
  },
  SATURN: (ctx, dest) => {
    const safeFreq = (value: number) => safeValue(value, 0.001, ctx.sampleRate / 2 - 1, 220); 
    const safeGainValue = (value: number) => safeValue(value, 0.0001, 1, 0.05); 
    const g = ctx.createGain();
    g.gain.setValueAtTime(safeGainValue(0.15), ctx.currentTime);
    g.connect(dest);
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(safeFreq(220), ctx.currentTime);
    osc.connect(g);
    osc.start();
    return [g, osc];
  },
  URANUS: (ctx, dest) => {
    const safeFreq = (value: number) => safeValue(value, 0.001, ctx.sampleRate / 2 - 1, 220); 
    const safeGainValue = (value: number) => safeValue(value, 0.0001, 1, 0.05); 
    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(safeGainValue(0.15), ctx.currentTime);
    mainGain.connect(dest);
    const nodes: any[] = [mainGain];
    const carrier = ctx.createOscillator();
    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(safeFreq(110), ctx.currentTime);
    const modulator = ctx.createOscillator();
    modulator.type = 'sine';
    modulator.frequency.setValueAtTime(safeFreq(2.5), ctx.currentTime);
    const modGain = ctx.createGain();
    modGain.gain.setValueAtTime(safeGainValue(30), ctx.currentTime);
    modulator.connect(modGain).connect(carrier.frequency);
    const cGain = ctx.createGain();
    cGain.gain.setValueAtTime(safeGainValue(0.2), ctx.currentTime);
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
    filter.frequency.setValueAtTime(safeFreq(8000), ctx.currentTime);
    const nGain = ctx.createGain();
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(safeFreq(0.1), ctx.currentTime);
    lfo.connect(nGain.gain);
    nGain.gain.setValueAtTime(safeGainValue(0.05), ctx.currentTime);
    noiseSrc.connect(filter).connect(nGain).connect(mainGain);
    noiseSrc.start(); lfo.start();
    nodes.push(noiseSrc, filter, nGain, lfo);
    return nodes;
  },
  NEPTUNE: (ctx, dest) => {
    const safeFreq = (value: number) => safeValue(value, 0.001, ctx.sampleRate / 2 - 1, 220); 
    const safeGainValue = (value: number) => safeValue(value, 0.0001, 1, 0.05); 
    const safeQValue = (value: number) => safeValue(value, 0.0001, 1000, 0.0001);
    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(safeGainValue(0.18), ctx.currentTime);
    mainGain.connect(dest);
    const nodes: any[] = [mainGain];
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) data[i] = Math.random() * 2 - 1;
    const wind = ctx.createBufferSource();
    wind.buffer = buffer; wind.loop = true;
    const bpFilter = ctx.createBiquadFilter();
    bpFilter.type = 'bandpass';
    bpFilter.frequency.setValueAtTime(safeFreq(1500), ctx.currentTime);
    bpFilter.Q.setValueAtTime(safeQValue(5), ctx.currentTime);
    const sweepLfo = ctx.createOscillator();
    sweepLfo.frequency.setValueAtTime(safeFreq(0.08), ctx.currentTime);
    const sweepG = ctx.createGain();
    sweepG.gain.setValueAtTime(safeGainValue(1200), ctx.currentTime);
    sweepLfo.connect(sweepG).connect(bpFilter.frequency);
    const windG = ctx.createGain();
    windG.gain.setValueAtTime(safeGainValue(0.12), ctx.currentTime);
    wind.connect(bpFilter).connect(windG).connect(mainGain);
    wind.start(); sweepLfo.start();
    nodes.push(wind, bpFilter, sweepLfo, sweepG, windG);
    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(safeFreq(27.5), ctx.currentTime); 
    const subG = ctx.createGain();
    subG.gain.setValueAtTime(safeGainValue(0.25), ctx.currentTime);
    sub.connect(subG).connect(mainGain);
    sub.start();
    nodes.push(sub, subG);
    const flutter = ctx.createOscillator();
    flutter.type = 'sine';
    flutter.frequency.setValueAtTime(safeFreq(14000), ctx.currentTime);
    const fG = ctx.createGain();
    const fLfo = ctx.createOscillator();
    fLfo.frequency.setValueAtTime(safeFreq(12), ctx.currentTime);
    fLfo.connect(fG.gain);
    fG.gain.setValueAtTime(safeGainValue(0.01), ctx.currentTime);
    flutter.connect(fG).connect(mainGain);
    flutter.start(); fLfo.start();
    nodes.push(flutter, fG, fLfo);
    return nodes;
  },
  PLUTO: (ctx, dest) => {
    const safeFreq = (value: number) => safeValue(value, 0.001, ctx.sampleRate / 2 - 1, 220); 
    const safeGainValue = (value: number) => safeValue(value, 0.0001, 1, 0.05); 
    const safeQValue = (value: number) => safeValue(value, 0.0001, 1000, 0.0001);
    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(safeGainValue(0.12), ctx.currentTime);
    mainGain.connect(dest);
    const nodes: any[] = [mainGain];
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 5, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) data[i] = Math.random() * 2 - 1;
    const voidSrc = ctx.createBufferSource();
    voidSrc.buffer = buffer; voidSrc.loop = true;
    const notch = ctx.createBiquadFilter();
    notch.type = 'notch';
    notch.frequency.setValueAtTime(safeFreq(400), ctx.currentTime);
    notch.Q.setValueAtTime(safeQValue(1), ctx.currentTime);
    const vG = ctx.createGain();
    vG.gain.setValueAtTime(safeGainValue(0.05), ctx.currentTime);
    voidSrc.connect(notch).connect(vG).connect(mainGain);
    voidSrc.start();
    nodes.push(voidSrc, notch, vG);
    const heart = ctx.createOscillator();
    heart.type = 'sine';
    heart.frequency.setValueAtTime(safeFreq(174), ctx.currentTime); 
    const hG = ctx.createGain();
    hG.gain.setValueAtTime(0, ctx.currentTime);
    const pulseLfo = ctx.createOscillator();
    pulseLfo.frequency.setValueAtTime(safeFreq(0.05), ctx.currentTime);
    const pulseLfoG = ctx.createGain();
    pulseLfoG.gain.setValueAtTime(safeGainValue(0.08), ctx.currentTime);
    pulseLfo.connect(pulseLfoG).connect(hG.gain);
    heart.connect(hG).connect(mainGain);
    heart.start(); pulseLfo.start();
    nodes.push(heart, hG, pulseLfo, pulseLfoG);
    const pingInterval = setInterval(() => {
      const pingNow = ctx.currentTime;
      const ping = ctx.createOscillator();
      ping.type = 'sine';
      ping.frequency.setValueAtTime(safeFreq(1200 + Math.random() * 3000), pingNow);
      const pG = ctx.createGain();
      pG.gain.setValueAtTime(0, pingNow);
      pG.gain.linearRampToValueAtTime(safeGainValue(0.02), pingNow + 0.1);
      pG.gain.exponentialRampToValueAtTime(0.0001, pingNow + 4);
      ping.connect(pG).connect(mainGain);
      ping.start(pingNow); ping.stop(pingNow + 5);
    }, 15000);
    nodes.push({ stop: () => clearInterval(pingInterval) });
    return nodes;
  }
};

export const PlanetaryMission: React.FC<{ setView: (v: AppView) => void; setIsAnyTrackPlaying: (playing: boolean) => void }> = ({ setView, setIsAnyTrackPlaying }) => {
  const [activePlanet, setActivePlanet] = useState<Planet>(PLANETS[0]); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<any[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const initAudio = useCallback(async () => {
    if (!audioContextRef.current) {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      audioContextRef.current = new AudioContextClass();
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.connect(audioContextRef.current.destination);
    }
    if (audioContextRef.current.state === 'suspended') {
      try { await audioContextRef.current.resume(); } catch (e) { console.warn("AudioContext resume failed", e); }
    }
    if (masterGainRef.current && audioContextRef.current) {
      masterGainRef.current.gain.setValueAtTime(isMuted ? 0 : volume, audioContextRef.current.currentTime);
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
  }, [setIsAnyTrackPlaying]);

  const startSynthesis = useCallback(async (type: string) => {
    if (isMuted) {
      setIsLoading(false);
      return;
    }
    try {
      await initAudio();
      const ctx = audioContextRef.current!;
      const dest = masterGainRef.current!;

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
    const shouldPlayVideo = isPlaying && !isMuted && activePlanet.videoUrl && activePlanet.videoUrl !== '' && !videoError;
    if (shouldPlayVideo) {
      if (video.paused || video.ended) {
        video.play().catch(err => {
          if (err.name !== 'AbortError') {
            console.warn("Video playback failed:", err);
            setVideoError(true);
          }
        });
      }
    } else {
      if (!video.paused) {
        video.pause();
      }
    }
  }, [isPlaying, isMuted, activePlanet.videoUrl, videoError]);

  const toggleMute = useCallback(() => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    const video = videoRef.current;
    if (video) {
        if (nextMute) {
            video.pause();
        } else {
            if (isPlaying && activePlanet.videoUrl && activePlanet.videoUrl !== '' && !videoError) {
                video.play().catch(err => {
                    if (err.name !== 'AbortError') console.warn("Video play on unmute failed:", err);
                    setVideoError(true);
                });
            }
        }
    }
    if (nextMute) {
      stopSynthesis();
    } else if (isPlaying) {
      setIsLoading(true);
      setTimeout(() => startSynthesis(activePlanet.synthesis), 50);
    }
  }, [isMuted, isPlaying, stopSynthesis, startSynthesis, activePlanet, videoError]);

  const handlePlanetSelect = async (p: Planet) => {
    if (isLoading) return;
    setIsLoading(true);
    setIsScanning(true);
    setImageLoaded(false); 
    setVideoError(false); 
    setTimeout(() => setIsScanning(false), 2000);
    if (activePlanet.id === p.id && isPlaying && !isMuted) {
        if (videoRef.current && !videoRef.current.paused) {
            videoRef.current.pause();
        }
        stopSynthesis();
        setIsLoading(false);
        return;
    }
    if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
    }
    stopSynthesis();
    setActivePlanet(p);
    if (!isMuted) {
        setTimeout(() => startSynthesis(p.synthesis), 50); 
    } else {
        stopSynthesis();
        setIsLoading(false);
    }
  };

  useEffect(() => {
    let timer: number | undefined;
    if (isPlaying && !isMuted) timer = window.setInterval(() => setSessionTime(prev => prev + 1), 1000);
    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, [isPlaying, isMuted]);

  useEffect(() => {
    return () => {
      stopSynthesis();
      setIsAnyTrackPlaying(false);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [stopSynthesis, setIsAnyTrackPlaying]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-10 md:space-y-16 animate-in slide-in-from-bottom-8 duration-1000 pb-40 px-2 md:px-0 max-w-7xl mx-auto">
      <div className="flex justify-between items-center px-4">
        <div className="space-y-1">
          <button 
            onClick={() => { stopSynthesis(); setView(AppView.DASHBOARD); }}
            className="flex items-center gap-2 text-teal-800 label-caps text-[10px] md:text-xs hover:gap-3 transition-all mb-2"
            aria-label="Exit Observation Deck"
          >
            <ChevronLeft size={16} /> Back to Sanctuary
          </button>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <h2 className="text-4xl md:text-7xl font-black text-slate-950 dark:text-white tracking-tighter leading-none transition-colors duration-300">Observation Deck</h2>
            <span className="label-caps px-3 py-1 bg-teal-100 dark:bg-teal-100/30 text-teal-700 dark:text-teal-700 rounded-full border border-teal-200 dark:border-teal-200 w-fit">BETA</span>
          </div>
          <p className="text-slate-500 dark:text-slate-300 font-semibold text-lg md:text-2xl transition-colors duration-300">
            Embark on an auditory odyssey through our solar system.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-3 rounded-[2.5rem] border border-white dark:border-slate-700 shadow-sm ring-1 ring-teal-500/5 transition-colors duration-300">
           <Radio className="text-teal-600 dark:text-teal-400 ml-2" />
           <p className="text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] pr-4">Spectral Link Active</p>
        </div>
      </div>

      <div className="glass-card p-8 md:p-14 rounded-[3rem] md:rounded-[5rem] relative overflow-hidden flex flex-col justify-between min-h-[500px] shadow-2xl border-none ring-1 ring-teal-500/10 dark:ring-teal-700/10 hover:shadow-teal-500/20 transition-all duration-300">
        <div className={`absolute inset-0 bg-gradient-to-br ${activePlanet.color} opacity-60 mix-blend-multiply transition-all duration-1000`}></div>
        <div className="absolute inset-0 bg-black/50 backdrop-brightness-75"></div>
        
        <div className={`absolute inset-0 bg-gradient-to-br ${activePlanet.color} opacity-20 z-0`}></div>

        {activePlanet.videoUrl && activePlanet.videoUrl !== '' && !videoError ? (
            <video 
                ref={videoRef}
                src={activePlanet.videoUrl} 
                loop 
                muted 
                autoPlay 
                playsInline 
                className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ${imageLoaded ? 'opacity-50' : 'opacity-0'}`}
                onCanPlay={() => setImageLoaded(true)}
                onError={() => setVideoError(true)}
            ></video>
        ) : (
            <img 
                src={activePlanet.imageUrl} 
                alt={activePlanet.name} 
                className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000 ${imageLoaded ? 'opacity-50' : 'opacity-0'}`}
                decoding="async" 
                fetchpriority="high"
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
            />
        )}
        
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-30 animate-in fade-in duration-500">
            <Loader2 className="w-16 h-16 text-teal-400 animate-spin" />
            <p className="absolute bottom-1/4 text-white text-xl font-bold tracking-widest animate-pulse">SCANNING...</p>
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center text-white text-center space-y-6 md:space-y-10 pt-10">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-white/10 backdrop-blur-3xl rounded-full border border-white/25 shadow-2xl">
            <Rocket size={16} className="text-teal-300 animate-pulse" />
            <p className="text-[10px] md:text-sm font-black uppercase tracking-[0.5em] text-white">ACTIVE MISSION</p>
          </div>
          <h3 className="text-4xl md:text-6xl font-black tracking-tight drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] leading-none text-white italic transition-all duration-300">{activePlanet.name}</h3>
          <p className="text-base md:text-xl text-white/80 font-medium italic tracking-wide max-w-2xl mx-auto drop-shadow-lg opacity-90 leading-relaxed">"{activePlanet.mission}"</p>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 mt-auto pb-10">
          <button 
            onClick={() => {
              if (isPlaying) stopSynthesis();
              else startSynthesis(activePlanet.synthesis);
            }}
            disabled={isLoading || isScanning}
            className="w-24 h-24 md:w-32 md:h-32 flex items-center justify-center rounded-full bg-white text-slate-900 shadow-[0_0_80px_rgba(255,255,255,0.4)] hover:scale-110 active:scale-90 transition-all"
            aria-label={isPlaying ? "Pause exploration audio" : "Start exploration audio"}
          >
            {isLoading ? <Loader2 size={40} className="animate-spin text-teal-600" /> : (isPlaying ? <Pause size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" className="ml-2" />)}
          </button>
        </div>

        <div className="absolute bottom-10 md:bottom-14 right-10 md:right-14 z-10 flex items-center gap-4">
          <button 
            onClick={toggleMute}
            className={`transition-all hover:scale-110 active:scale-95 outline-none ${isMuted ? 'text-slate-400' : 'text-white'}`}
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input 
            type="range" min="0" max="1" step="0.01" 
            className="w-20 md:w-32 h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-white"
            value={volume}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setVolume(val);
              if (masterGainRef.current && audioContextRef.current && !isMuted) {
                masterGainRef.current.gain.setValueAtTime(val, audioContextRef.current.currentTime);
              }
            }}
          />
        </div>
        <div className="absolute bottom-10 md:bottom-14 left-10 md:left-14 z-10 text-white/80">
          <p className="text-[10px] font-black uppercase tracking-widest">Mission Elapsed</p>
          <p className="text-xl md:text-3xl font-black font-display tracking-tight">{formatTime(sessionTime)}</p>
        </div>
        <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 px-6 py-2.5 bg-white/10 backdrop-blur-3xl rounded-full border border-white/25 shadow-2xl">
          <Music size={16} className="text-teal-300" />
          <p className="text-[10px] md:text-sm font-black uppercase tracking-[0.5em] text-white">{activePlanet.audioTrackName}</p>
        </div>
      </div>

      <section className="space-y-6">
          <div className="px-4 flex items-center justify-between">
            <h3 className="text-2xl md:text-4xl font-black text-slate-950 dark:text-white tracking-tight transition-colors duration-300">Celestial Navigation</h3>
            <p className="label-caps text-slate-500 dark:text-slate-300 font-black">Deep Space Network v4.2</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {PLANETS.map((planet) => (
              <button
                key={planet.id}
                onClick={() => handlePlanetSelect(planet)}
                disabled={isLoading}
                className={`group glass-card p-6 md:p-8 rounded-[2.5rem] text-left space-y-4 transition-all hover:scale-[1.03] hover:shadow-xl border-none ring-1 ring-slate-100/50 dark:ring-slate-200/50 
                ${activePlanet.id === planet.id ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-700 ring-teal-500/30' : ''}
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label={`Select ${planet.name} for exploration`}
              >
                <div className={`relative w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br ${planet.color} text-white flex items-center justify-center rounded-2xl shadow-lg transition-transform group-hover:rotate-6`}>
                  {activePlanet.id === planet.id && isPlaying && !isLoading ? (
                    <Zap size={24} className="animate-pulse" />
                  ) : (
                    <Eye size={24} />
                  )}
                </div>
                <div>
                  <h4 className={`text-lg md:text-xl font-black text-slate-950 dark:text-white tracking-tight leading-tight transition-colors duration-300`}>
                    {planet.name}
                  </h4>
                  <p className="text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-300 mt-1 leading-tight transition-colors duration-300">{planet.desc}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-1">
                  <p className="label-caps text-slate-400 dark:text-slate-300">Hazard</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{planet.metrics.hazard}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
    </div>
  );
};
