import React, { useEffect, useRef } from 'react';

interface Props {
  isActive: boolean;
  hasStarted: boolean;
}

const BackgroundAmbience: React.FC<Props> = ({ isActive, hasStarted }) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<any[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const reverbNodeRef = useRef<ConvolverNode | null>(null); // Added for reverb

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


    // Master Gain for the entire ambience track
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(safeGain(0.04), ctx.currentTime + 1.5); // Very subtle volume
    masterGain.connect(ctx.destination);
    gainNodeRef.current = masterGain; // Reference for volume control/fade out

    const nodes: any[] = [masterGain];

    // Reverb Setup
    if (!reverbNodeRef.current) {
      const reverb = ctx.createConvolver();
      const reverbGain = ctx.createGain();
      reverbGain.gain.setValueAtTime(safeGain(0.35), ctx.currentTime); // Wet signal mix
      reverb.connect(reverbGain).connect(masterGain); 

      // Generate a simple impulse response for a subtle, long decay
      const length = ctx.sampleRate * 5; // 5 seconds long
      const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
      for (let i = 0; i < length; i++) {
        const env = Math.pow(1 - i / length, 4); 
        impulse.getChannelData(0)[i] = (Math.random() * 2 - 1) * env * 0.1; // Reduced amplitude for subtlety
        impulse.getChannelData(1)[i] = (Math.random() * 2 - 1) * env * 0.1; 
      }
      reverb.buffer = impulse;
      reverbNodeRef.current = reverb;
      nodes.push(reverb, reverbGain);
    }
    
    // Pre-reverb gain node to split dry/wet signal
    const preReverbGain = ctx.createGain();
    preReverbGain.gain.setValueAtTime(safeGain(1), ctx.currentTime); // Full dry signal
    preReverbGain.connect(masterGain); // Dry path to master
    if (reverbNodeRef.current) preReverbGain.connect(reverbNodeRef.current); // Wet path to reverb

    // Drone Layer (3 Sine wave oscillators with frequency & gain LFOs)
    [safeFreq(40), safeFreq(60), safeFreq(90)].forEach(freq => { 
      const osc = ctx.createOscillator();
      osc.type = 'sine'; 
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Slow frequency LFO for subtle pitch variations
      const freqLfo = ctx.createOscillator();
      freqLfo.type = 'sine';
      freqLfo.frequency.setValueAtTime(safeFreq(0.01 + Math.random() * 0.005), ctx.currentTime); 
      const freqLfoGain = ctx.createGain();
      freqLfoGain.gain.setValueAtTime(safeGain(freq * 0.005), ctx.currentTime); // Small modulation depth
      freqLfo.connect(freqLfoGain).connect(osc.frequency);
      
      // Existing gain LFO for "pulse"
      const g = ctx.createGain();
      const lfo = ctx.createOscillator(); 
      lfo.frequency.setValueAtTime(safeFreq(0.08 + Math.random() * 0.02), ctx.currentTime); 
      const lfoG = ctx.createGain();
      lfoG.gain.setValueAtTime(safeGain(0.3), ctx.currentTime); 
      lfo.connect(lfoG).connect(g.gain);
      g.gain.setValueAtTime(safeGain(0.2 + Math.random() * 0.1), ctx.currentTime); // Base gain
      
      osc.connect(g).connect(preReverbGain); // Connect to pre-reverb gain
      osc.start(); freqLfo.start(); lfo.start();
      nodes.push(osc, g, lfo, lfoG, freqLfo, freqLfoGain);
    });

    // Brownian Noise Layer (soft, natural ambient sound like wind or distant ocean)
    const bufferSize = ctx.sampleRate * 10; // 10 seconds of noise buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + (safeGain(0.02) * white)) / 1.02; // Simple brownian filter approximation
      data[i] = lastOut * 4.0; 
    }
    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = buffer; noiseSrc.loop = true;

    // Lowpass filter for brown noise with LFO modulation
    const noiseLowpass = ctx.createBiquadFilter();
    noiseLowpass.type = 'lowpass';
    noiseLowpass.frequency.setValueAtTime(safeFreq(800), ctx.currentTime); // Initial lowpass frequency
    noiseLowpass.Q.setValueAtTime(safeQ(1), ctx.currentTime);

    const noiseFreqLfo = ctx.createOscillator();
    noiseFreqLfo.type = 'sine';
    noiseFreqLfo.frequency.setValueAtTime(safeFreq(0.008), ctx.currentTime); // Very slow LFO for filter freq
    const noiseFreqLfoG = ctx.createGain();
    noiseFreqLfoG.gain.setValueAtTime(safeGain(600), ctx.currentTime); // Modulation depth
    noiseFreqLfo.connect(noiseFreqLfoG).connect(noiseLowpass.frequency);

    // Gain for noise with slow LFO
    const noiseGain = ctx.createGain();
    const noiseGainLfo = ctx.createOscillator();
    noiseGainLfo.type = 'sine';
    noiseGainLfo.frequency.setValueAtTime(safeFreq(0.05), ctx.currentTime); // Slow volume LFO
    const noiseGainLfoG = ctx.createGain();
    noiseGainLfoG.gain.setValueAtTime(safeGain(0.03), ctx.currentTime); // Modulation depth
    noiseGainLfo.connect(noiseGainLfoG).connect(noiseGain.gain);
    noiseGain.gain.setValueAtTime(safeGain(0.08), ctx.currentTime); // Base noise gain

    // Stereo Panner with LFO
    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(safePan(0), ctx.currentTime); // Start center
    const pannerLfo = ctx.createOscillator();
    pannerLfo.type = 'sine';
    pannerLfo.frequency.setValueAtTime(safeFreq(0.005), ctx.currentTime); // Very slow stereo panning
    const pannerLfoG = ctx.createGain();
    pannerLfoG.gain.setValueAtTime(safeGain(0.7), ctx.currentTime); // Wide pan range
    pannerLfo.connect(pannerLfoG).connect(panner.pan);

    noiseSrc.connect(noiseLowpass).connect(noiseGain).connect(panner).connect(preReverbGain);
    noiseSrc.start(); noiseFreqLfo.start(); noiseGainLfo.start(); pannerLfo.start();
    nodes.push(noiseSrc, noiseLowpass, noiseFreqLfo, noiseFreqLfoG, noiseGain, noiseGainLfo, noiseGainLfoG, panner, pannerLfo, pannerLfoG);
    
    // Add reverbNodeRef.current to nodes array for proper cleanup
    if (reverbNodeRef.current) nodes.push(reverbNodeRef.current);
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