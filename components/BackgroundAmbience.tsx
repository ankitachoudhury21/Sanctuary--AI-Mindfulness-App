import React, { useEffect, useRef, useCallback } from 'react';

interface Props {
  isActive: boolean;
  hasStarted: boolean;
}

const CROSSFADE_TIME = 0.8; // seconds for fade in/out

const BackgroundAmbience: React.FC<Props> = ({ isActive, hasStarted }) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null); // Master gain for overall volume
  const ambientGainRef = useRef<GainNode | null>(null); // Gain specifically for ambient track
  const reverbNodeRef = useRef<ConvolverNode | null>(null);
  const nodesRef = useRef<any[]>([]); // Stores all current active audio nodes

  // Helper for clamping values to valid AudioParam ranges
  const safeValue = useCallback((value: number, min: number, max: number, defaultValue: number) => {
    if (isNaN(value) || !isFinite(value)) {
      return defaultValue;
    }
    return Math.max(min, Math.min(max, value));
  }, []);

  const safeFreq = useCallback((value: number) => safeValue(value, 0.001, audioContextRef.current!.sampleRate / 2 - 1, 0.001), [safeValue]);
  const safeGain = useCallback((value: number) => safeValue(value, 0.0001, 100, 0.0001), [safeValue]); // Max gain 100
  const safeQ = useCallback((value: number) => safeValue(value, 0.0001, 1000, 0.0001), [safeValue]); // Max Q 1000
  const safePan = useCallback((value: number) => safeValue(value, -1, 1, 0), [safeValue]); // Pan -1 to 1

  // Initialize AudioContext and core nodes once
  useEffect(() => {
    const initAudioEngine = async () => {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }
      const ctx = audioContextRef.current;

      if (ctx.state === 'suspended') {
        try { await ctx.resume(); } catch (e) { console.warn("AudioContext resume failed on init", e); }
      }

      // Master Gain for overall app volume
      if (!masterGainRef.current) {
        masterGainRef.current = ctx.createGain();
        masterGainRef.current.connect(ctx.destination);
      }

      // Ambient track's specific gain for fade in/out
      if (!ambientGainRef.current) {
        ambientGainRef.current = ctx.createGain();
        ambientGainRef.current.gain.setValueAtTime(0, ctx.currentTime);
        ambientGainRef.current.connect(masterGainRef.current);
      }

      // Reverb Setup
      if (!reverbNodeRef.current) {
        const reverb = ctx.createConvolver();
        const reverbGain = ctx.createGain();
        reverbGain.gain.setValueAtTime(safeGain(0.35), ctx.currentTime); // Wet signal mix
        reverb.connect(reverbGain).connect(masterGainRef.current); 

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
      }
    };

    initAudioEngine();

    return () => {
      // Cleanup AudioContext on component unmount
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(e => console.error("Error closing AudioContext", e));
        audioContextRef.current = null;
        masterGainRef.current = null;
        ambientGainRef.current = null;
        reverbNodeRef.current = null;
        nodesRef.current = [];
      }
    };
  }, [safeGain, safeValue]);

  // Stop all active audio nodes and clear the nodes array
  const stopAudio = useCallback(() => {
    const ctx = audioContextRef.current;
    const ambientGain = ambientGainRef.current;

    if (!ctx || !ambientGain) return;

    const now = ctx.currentTime;
    ambientGain.gain.cancelScheduledValues(now); // Clear any pending ramps
    ambientGain.gain.setValueAtTime(0, now); // Immediately set gain to 0

    nodesRef.current.forEach(node => {
      try {
        if (node.stop) node.stop(now); // Stop at current time
        if (node.disconnect) node.disconnect();
      } catch (e) {
        console.warn("Error stopping/disconnecting node:", e);
      }
    });
    nodesRef.current = []; // Clear the array of nodes
  }, []);

  // Start the background ambience audio
  const startAudio = useCallback(() => {
    if (!hasStarted || !audioContextRef.current || !ambientGainRef.current) return;

    const ctx = audioContextRef.current;
    const ambientGain = ambientGainRef.current;
    const reverb = reverbNodeRef.current;

    // Ensure audio context is running
    if (ctx.state === 'suspended') {
      ctx.resume().catch(e => console.warn("Background audio resume interrupted on start", e));
    }

    // Always stop existing audio before starting new to prevent stacking
    stopAudio();

    const newNodes: any[] = [];
    const now = ctx.currentTime;

    // Pre-reverb gain node to split dry/wet signal
    const preReverbGain = ctx.createGain();
    preReverbGain.gain.setValueAtTime(safeGain(1), now); // Full dry signal
    preReverbGain.connect(ambientGain); // Dry path to ambient master gain
    if (reverb) preReverbGain.connect(reverb); // Wet path to reverb
    newNodes.push(preReverbGain);

    // Drone Layer (3 Sine wave oscillators with frequency & gain LFOs)
    [safeFreq(40), safeFreq(60), safeFreq(90)].forEach(freq => { 
      const osc = ctx.createOscillator();
      osc.type = 'sine'; 
      osc.frequency.setValueAtTime(freq, now);

      // Slow frequency LFO for subtle pitch variations
      const freqLfo = ctx.createOscillator();
      freqLfo.type = 'sine';
      freqLfo.frequency.setValueAtTime(safeFreq(0.01 + Math.random() * 0.005), now); 
      const freqLfoGain = ctx.createGain();
      freqLfoGain.gain.setValueAtTime(safeGain(freq * 0.005), now); // Small modulation depth
      freqLfo.connect(freqLfoGain).connect(osc.frequency);
      
      // Existing gain LFO for "pulse"
      const g = ctx.createGain();
      const lfo = ctx.createOscillator(); 
      lfo.frequency.setValueAtTime(safeFreq(0.08 + Math.random() * 0.02), now); 
      const lfoG = ctx.createGain();
      lfoG.gain.setValueAtTime(safeGain(0.3), now); 
      lfo.connect(lfoG).connect(g.gain);
      g.gain.setValueAtTime(safeGain(0.2 + Math.random() * 0.1), now); // Base gain
      
      osc.connect(g).connect(preReverbGain); // Connect to pre-reverb gain
      osc.start(); freqLfo.start(); lfo.start();
      newNodes.push(osc, g, lfo, lfoG, freqLfo, freqLfoGain);
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
    noiseLowpass.frequency.setValueAtTime(safeFreq(800), now); // Initial lowpass frequency
    noiseLowpass.Q.setValueAtTime(safeQ(1), now);

    const noiseFreqLfo = ctx.createOscillator();
    noiseFreqLfo.type = 'sine';
    noiseFreqLfo.frequency.setValueAtTime(safeFreq(0.008), now); // Very slow LFO for filter freq
    const noiseFreqLfoG = ctx.createGain();
    noiseFreqLfoG.gain.setValueAtTime(safeGain(600), now); // Modulation depth
    noiseFreqLfo.connect(noiseFreqLfoG).connect(noiseLowpass.frequency);

    // Gain for noise with slow LFO
    const noiseGain = ctx.createGain();
    const noiseGainLfo = ctx.createOscillator();
    noiseGainLfo.type = 'sine';
    noiseGainLfo.frequency.setValueAtTime(safeFreq(0.05), now); // Slow volume LFO
    const noiseGainLfoG = ctx.createGain();
    noiseGainLfoG.gain.setValueAtTime(safeGain(0.03), now); // Modulation depth
    noiseGainLfo.connect(noiseGainLfoG).connect(noiseGain.gain);
    noiseGain.gain.setValueAtTime(safeGain(0.08), now); // Base noise gain

    // Stereo Panner with LFO
    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(safePan(0), now); // Start center
    const pannerLfo = ctx.createOscillator();
    pannerLfo.type = 'sine';
    pannerLfo.frequency.setValueAtTime(safeFreq(0.005), now); // Very slow stereo panning
    const pannerLfoG = ctx.createGain();
    pannerLfoG.gain.setValueAtTime(safeGain(0.7), now); // Wide pan range
    pannerLfo.connect(pannerLfoG).connect(panner.pan);

    noiseSrc.connect(noiseLowpass).connect(noiseGain).connect(panner).connect(preReverbGain);
    noiseSrc.start(); noiseFreqLfo.start(); noiseGainLfo.start(); pannerLfo.start();
    newNodes.push(noiseSrc, noiseLowpass, noiseFreqLfo, noiseFreqLfoG, noiseGain, noiseGainLfo, noiseGainLfoG, panner, pannerLfo, pannerLfoG);
    
    nodesRef.current = newNodes; // Update the list of active nodes

    // Fade in the ambient track
    ambientGain.gain.cancelScheduledValues(now);
    ambientGain.gain.setValueAtTime(ambientGain.gain.value, now); // Ensure current value is set for ramp
    ambientGain.gain.linearRampToValueAtTime(safeGain(0.04), now + CROSSFADE_TIME);
  }, [hasStarted, safeFreq, safeGain, safeQ, safePan, stopAudio]);

  // Main effect hook to control ambient audio based on props
  useEffect(() => {
    if (hasStarted && isActive) {
      startAudio();
    } else {
      // Fade out ambient audio if not active or not started
      const ctx = audioContextRef.current;
      const ambientGain = ambientGainRef.current;
      if (ctx && ambientGain) {
        const now = ctx.currentTime;
        ambientGain.gain.cancelScheduledValues(now);
        ambientGain.gain.linearRampToValueAtTime(0, now + CROSSFADE_TIME);
        // After fade, disconnect nodes to free resources
        setTimeout(() => {
          stopAudio(); // Ensure full cleanup after fade
        }, CROSSFADE_TIME * 1000 + 100);
      }
    }
  }, [hasStarted, isActive, startAudio, stopAudio]);

  return null;
};

export default BackgroundAmbience;