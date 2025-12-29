import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppView } from '../types';
import { ChevronLeft, ImageIcon, Sparkles, Loader2, AlertCircle, Radio, KeyRound, Play, Link, Camera } from 'lucide-react';
import { generateImage } from '../services/geminiService';

interface Props {
  setView: (view: AppView) => void;
}

const ImageGenerator: React.FC<Props> = ({ setView }) => {
  const [prompt, setPrompt] = useState('');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [isKeySelectionRequired, setIsKeySelectionRequired] = useState(false);
  const [isKeySelecting, setIsKeySelecting] = useState(false);

  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = async () => {
    setErrorState(null);
    setIsKeySelectionRequired(false);
    try {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        setIsKeySelectionRequired(true);
        setErrorState("A valid API key is required for image generation. Please select one from a paid GCP project.");
      }
    } catch (e) {
      console.error("Error checking API key status:", e);
      setIsKeySelectionRequired(true);
      setErrorState("Could not verify API key status. Please ensure your environment is set up correctly.");
    }
  };

  const handleSelectApiKey = async () => {
    setIsKeySelecting(true);
    setErrorState(null);
    try {
      await window.aistudio.openSelectKey();
      // Assume success and re-check status immediately
      setIsKeySelecting(false);
      await checkApiKeyStatus();
    } catch (e) {
      console.error("Error opening API key selection:", e);
      setIsKeySelecting(false);
      setErrorState("Failed to open API key selection. Please try again.");
    }
  };

  const handleGenerateImage = useCallback(async () => {
    if (!prompt.trim()) {
      setErrorState("Please enter a prompt to generate an image.");
      return;
    }
    if (isKeySelectionRequired) {
      setErrorState("Please select a valid API key before generating images.");
      return;
    }

    setIsLoading(true);
    setGeneratedImageUrl(null);
    setErrorState(null);

    try {
      const imageUrl = await generateImage(prompt, imageSize);
      setGeneratedImageUrl(imageUrl);
    } catch (e: any) {
      console.error("Image generation failed:", e);
      const errorMessage = e?.message || "An unexpected error occurred during image generation.";
      
      if (errorMessage.includes("Requested entity was not found.") || errorMessage.includes("403") || errorMessage.includes("Permission denied")) {
        setErrorState("API key invalid or insufficient permissions. Please select a valid key from a paid GCP project.");
        setIsKeySelectionRequired(true);
      } else {
        setErrorState(`Generation failed: ${errorMessage}. Please try a different prompt.`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [prompt, imageSize, isKeySelectionRequired]);

  useEffect(() => {
    if (generatedImageUrl && imageContainerRef.current) {
      imageContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [generatedImageUrl]);

  return (
    <div className="space-y-8 md:space-y-12 animate-in slide-in-from-bottom-8 duration-1000 pb-24 px-2 md:px-0 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <button 
            onClick={() => setView(AppView.DASHBOARD)}
            className="flex items-center gap-2 text-orange-600 label-caps text-[10px] md:text-xs hover:gap-3 transition-all mb-2"
            aria-label="Back to Sanctuary Dashboard"
          >
            <ChevronLeft size={16} /> Back to Sanctuary
          </button>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <h2 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none transition-colors duration-300">AI Image Studio</h2>
            <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full border border-orange-200 uppercase w-fit text-[10px] font-black tracking-widest">BETA</span>
          </div>
          <p className="text-slate-500 font-semibold text-lg md:text-2xl transition-colors duration-300">Unleash your imagination. Generate unique visuals for your mindful space.</p>
        </div>

        <div className="flex items-center gap-4 bg-white/60 backdrop-blur-xl p-3 rounded-[2.5rem] border border-white shadow-sm ring-1 ring-orange-500/5">
           <Camera className="text-orange-600 ml-2" />
           <p className="text-slate-900 font-black uppercase tracking-widest text-[10px] pr-4">Gemini Image Preview</p>
        </div>
      </div>

      <div className="glass-card p-8 md:p-14 rounded-[3rem] md:rounded-[4.5rem] shadow-2xl border-none ring-1 ring-orange-500/10 space-y-8 md:space-y-10">
        <div className="space-y-4">
          <label htmlFor="image-prompt" className="label-caps text-slate-700 ml-2">What do you want to create?</label>
          <textarea
            id="image-prompt"
            className="w-full h-32 p-6 rounded-2xl bg-white/50 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none font-medium text-lg"
            placeholder="A serene forest with bioluminescent plants and a waterfall, digital art"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading || isKeySelectionRequired}
            aria-label="Image generation prompt"
          ></textarea>
        </div>

        <div className="space-y-4">
          <p className="label-caps text-slate-700 ml-2">Image Size</p>
          <div className="flex flex-wrap gap-4">
            {(['1K', '2K', '4K'] as const).map(size => (
              <button
                key={size}
                onClick={() => setImageSize(size)}
                className={`px-6 py-3 rounded-xl font-black text-lg transition-all border-2 ${
                  imageSize === size
                    ? 'bg-orange-600 border-orange-600 text-white shadow-lg'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300'
                }`}
                disabled={isLoading || isKeySelectionRequired}
                aria-pressed={imageSize === size}
                aria-label={`Select image size ${size}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {errorState && (
          <div className="flex items-start gap-4 p-6 bg-red-50 text-red-700 rounded-2xl border border-red-100 animate-in fade-in zoom-in-95">
            <AlertCircle size={24} className="flex-shrink-0 mt-1" />
            <div>
              <p className="font-bold text-lg">{errorState}</p>
              {isKeySelectionRequired && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-medium">Image generation with `gemini-3-pro-image-preview` requires a paid API key. Ensure billing is enabled for your GCP project.</p>
                  <button 
                    onClick={handleSelectApiKey} 
                    className="px-6 py-3 bg-red-600 text-white font-black rounded-2xl flex items-center gap-3 hover:bg-red-700 transition-all shadow-lg"
                    disabled={isKeySelecting}
                  >
                    {isKeySelecting ? <Radio size={18} className="animate-spin" /> : <KeyRound size={18} />} Select API Key
                  </button>
                  <p className="text-xs text-red-500 mt-2">
                     <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-600">Learn more about billing</a>.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <button
          onClick={handleGenerateImage}
          disabled={isLoading || !prompt.trim() || isKeySelectionRequired}
          className="w-full calm-btn-primary py-5 rounded-2xl text-xl font-black shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
          aria-label="Generate Image"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Sparkles size={20} />
          )}
          {isLoading ? 'Generating Image...' : 'Generate Image'}
        </button>
      </div>

      {generatedImageUrl && (
        <div ref={imageContainerRef} className="glass-card p-8 md:p-14 rounded-[3rem] md:rounded-[4.5rem] shadow-2xl border-none ring-1 ring-teal-500/10 space-y-6 md:space-y-8 animate-in fade-in zoom-in-95 duration-700">
          <div className="flex items-center gap-4 text-slate-900">
            <ImageIcon size={28} className="text-orange-600" />
            <h3 className="text-2xl md:text-4xl font-black tracking-tight">Your Generated Image</h3>
          </div>
          <div className="w-full bg-slate-100 rounded-2xl overflow-hidden shadow-inner aspect-square flex items-center justify-center">
            <img 
              src={generatedImageUrl} 
              alt={prompt} 
              className="w-full h-full object-contain rounded-2xl" 
              loading="lazy"
            />
          </div>
          <p className="text-slate-600 font-medium italic text-balance mt-4">
            <span className="font-bold text-slate-800">Prompt:</span> {prompt} 
            <br/><span className="font-bold text-slate-800">Size:</span> {imageSize}
          </p>
          <button
            onClick={() => window.open(generatedImageUrl, '_blank')}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-white border border-slate-200 text-slate-700 font-black label-caps rounded-xl hover:bg-slate-50 transition-all shadow-sm"
            aria-label="Download generated image"
          >
            <Link size={16} /> Open in New Tab
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;