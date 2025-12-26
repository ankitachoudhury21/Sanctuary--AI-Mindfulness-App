import React, { useEffect, useRef } from 'react';

interface Props {
  isActive: boolean;
  hasStarted: boolean;
}

const BackgroundAmbience: React.FC<Props> = ({ isActive, hasStarted }) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<any[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  const stopAudio = () => {
    if (gainNodeRef.current && audioContextRef.current) {
      const ctx = audioContextRef.current;
      const now = ctx.currentTime;
      gainNodeRef.current.gain.cancelScheduledValues(now);
      gainNodeRef.current.gain.linearRampToValueAtTime(0, now + 0.8);
      setTimeout(() => {
        nodesRef.current.forEach(node => {
          try {
            if (node.stop) node.stop();
            node.disconnect();
          } catch (e) {}
        });
        nodesRef.current = [];
      }, 900);
    } else {
      nodesRef.current.forEach(node => {
        try {
          if (node.stop) node.stop();
          node.disconnect();
        } catch (e) {}
      });
      nodesRef.current = [];
    }
  };

  const startAudio = () => {
    if (!hasStarted) return;
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(e => console.warn("Background audio resume interrupted", e));
    }
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 1.5);
    masterGain.connect(ctx.destination);
    gainNodeRef.current = masterGain;
    const nodes: any[] = [masterGain];
    [60, 90].forEach(freq => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      const g = ctx.createGain();
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.1, ctx.currentTime); 
      const lfoG = ctx.createGain();
      lfoG.gain.setValueAtTime(0.2, ctx.currentTime);
      lfo.connect(lfoG).connect(g.gain);
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      osc.connect(g).connect(masterGain);
      osc.start(); lfo.start();
      nodes.push(osc, g, lfo, lfoG);
    });
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) noiseData[i] = Math.random() * 2 - 1;
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer; noiseSrc.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass'; filter.frequency.setValueAtTime(3000, ctx.currentTime); filter.Q.setValueAtTime(1, ctx.currentTime);
    const filterLfo = ctx.createOscillator(); filterLfo.frequency.setValueAtTime(0.05, ctx.currentTime);
    const filterLfoG = ctx.createGain(); filterLfoG.gain.setValueAtTime(1000, ctx.currentTime);
    filterLfo.connect(filterLfoG).connect(filter.frequency);
    const noiseGain = ctx.createGain(); noiseGain.gain.setValueAtTime(0.1, ctx.currentTime);
    noiseSrc.connect(filter).connect(noiseGain).connect(masterGain);
    noiseSrc.start(); filterLfo.start();
    nodes.push(noiseSrc, filter, filterLfo, filterLfoG, noiseGain);
    nodesRef.current = nodes;
  };

  useEffect(() => {
    if (hasStarted && isActive) { startAudio(); } else { stopAudio(); }
  }, [hasStarted, isActive]);

  useEffect(() => {
    return () => {
      nodesRef.current.forEach(node => {
        try { if (node.stop) node.stop(); node.disconnect(); } catch (e) {}
      });
    };
  }, []);

  return null;
};

export default BackgroundAmbience;