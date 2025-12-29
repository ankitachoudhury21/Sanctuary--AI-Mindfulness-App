import React, { useState, useEffect } from 'react';
import { Mail, Facebook, Apple, X, ArrowRight, Loader2, Key, CheckCircle2, ShieldCheck, MailQuestion } from 'lucide-react';

interface Props {
  onAuthComplete: () => void;
  userName: string;
}

type AuthMethod = 'social' | 'email' | 'magic';

const AuthFlow: React.FC<Props> = ({ onAuthComplete, userName }) => {
  const [method, setMethod] = useState<AuthMethod>('social');
  const [isLogin, setIsLogin] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Clear errors when switching methods or toggle login/signup
  useEffect(() => {
    setError(null);
  }, [method, isLogin]);

  const handleSocialAuth = (provider: string) => {
    setIsLoading(provider);
    setError(null);
    // Simulate API delay
    setTimeout(() => {
      setIsLoading(null);
      setShowSuccess(true);
      setTimeout(onAuthComplete, 1200);
    }, 1800);
  };

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || (!isLogin && !password)) {
      setError('Please fill in all required fields.');
      return;
    }
    
    setIsLoading('email');
    setError(null);
    
    // Simulate Email Auth API
    setTimeout(() => {
      setIsLoading(null);
      setShowSuccess(true);
      setTimeout(onAuthComplete, 1200);
    }, 2000);
  };

  const handleMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email address is required.');
      return;
    }
    setIsLoading('magic');
    setTimeout(() => {
      setIsLoading(null);
      setShowSuccess(true);
      setTimeout(onAuthComplete, 1500);
    }, 2000);
  };

  const SocialButton = ({ icon: Icon, label, provider, color, brandIcon = false }: { icon: any, label: string, provider: string, color?: string, brandIcon?: boolean }) => (
    <button 
      onClick={() => handleSocialAuth(provider)}
      disabled={!!isLoading}
      className={`w-full flex items-center justify-center gap-4 py-4 px-6 rounded-2xl border bg-white border-slate-200 text-slate-800 hover:bg-slate-50 transition-all font-display font-bold text-lg disabled:opacity-50 relative overflow-hidden group shadow-sm`}
    >
      {isLoading === provider ? (
        <Loader2 size={24} className="animate-spin text-teal-600" />
      ) : (
        <>
          <Icon size={24} className={`${color} group-hover:scale-110 transition-transform`} />
          <span className="flex-1 text-center">Continue with {label}</span>
          <div className="w-6" /> {/* Balance spacer */}
        </>
      )}
    </button>
  );

  if (showSuccess) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0 bg-teal-900/10 backdrop-blur-xl"></div>
        <div className="relative z-10 glass-card p-12 md:p-20 rounded-[3rem] text-center space-y-8 animate-in zoom-in-95 duration-500 border-teal-500/20 shadow-2xl">
          <div className="w-24 h-24 bg-teal-500 rounded-full flex items-center justify-center mx-auto text-white shadow-xl animate-bounce">
            <CheckCircle2 size={48} />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">Welcome Home, <br/>{userName}.</h2>
            <p className="text-xl text-slate-600 font-medium italic">Your sanctuary is initializing...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=2560')] bg-cover bg-center">
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[4px]"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-teal-50/80 via-transparent to-blue-50/80"></div>
      </div>

      {/* Header Controls */}
      <div className="fixed top-0 left-0 right-0 p-8 md:px-16 flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg">
            <ShieldCheck size={24} />
          </div>
          <span className="font-black text-slate-900 tracking-tight text-xl font-display">Secure Entry</span>
        </div>
      </div>

      <div className="relative w-full max-w-[580px] animate-in fade-in zoom-in-95 duration-700">
        <div className="glass-card p-8 md:p-14 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border-white/60">
          
          <div className="text-center mb-10 space-y-4">
            <div className="label-caps px-4 py-1.5 bg-teal-100 text-teal-700 rounded-full inline-block mb-2">
              Step 2 of 2
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight text-balance">
              {method === 'social' ? 'Join Sanctuary' : method === 'magic' ? 'Magic Link' : isLogin ? 'Sign In' : 'Create Account'}
            </h3>
            <p className="text-slate-500 text-lg font-semibold leading-relaxed">
              {method === 'social' 
                ? "Choose your preferred way to keep your journey secure."
                : method === 'magic'
                ? "We'll send a secure link to your inbox for passwordless entry."
                : isLogin 
                ? "Welcome back. Access your mindful reflections." 
                : `Protect your mindful space, ${userName}.`}
            </p>
          </div>

          <div className="space-y-4 max-w-[420px] mx-auto">
            {method === 'social' && (
              <>
                <div className="space-y-3 mb-6">
                  <button 
                    onClick={() => handleSocialAuth('google')}
                    disabled={!!isLoading}
                    className="w-full flex items-center justify-center gap-4 py-4 px-6 rounded-2xl border bg-white border-slate-200 text-slate-800 hover:bg-slate-50 transition-all font-display font-bold text-lg shadow-sm"
                  >
                    {isLoading === 'google' ? <Loader2 size={24} className="animate-spin text-teal-600" /> : (
                      <>
                        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        <span className="flex-1 text-center">Continue with Google</span>
                        <div className="w-6" />
                      </>
                    )}
                  </button>
                  <SocialButton icon={Facebook} label="Facebook" provider="facebook" color="text-[#1877F2]" />
                  <SocialButton icon={Apple} label="Apple" provider="apple" color="text-black" />
                </div>

                <div className="flex items-center gap-4 my-8">
                  <div className="h-[1px] flex-1 bg-slate-200"></div>
                  <span className="label-caps text-slate-400">or use email</span>
                  <div className="h-[1px] flex-1 bg-slate-200"></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setMethod('email')}
                    className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all group"
                  >
                    <Mail className="text-teal-600 group-hover:scale-110 transition-transform" size={24} />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-600">Password</span>
                  </button>
                  <button 
                    onClick={() => setMethod('magic')}
                    className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all group"
                  >
                    <MailQuestion className="text-blue-600 group-hover:scale-110 transition-transform" size={24} />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-600">Magic Link</span>
                  </button>
                </div>
              </>
            )}

            {(method === 'email' || method === 'magic') && (
              <form 
                onSubmit={method === 'email' ? handleEmailAuth : handleMagicLink} 
                className="space-y-6 animate-in slide-in-from-bottom-4 duration-500"
              >
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="label-caps text-slate-500 ml-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input 
                        type="email" 
                        required
                        className="w-full bg-slate-50 border-2 border-slate-100 p-5 pl-14 rounded-2xl text-lg font-bold outline-none focus:border-teal-500/50 transition-all"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {method === 'email' && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-end">
                        <label className="label-caps text-slate-500 ml-2">Password</label>
                        {isLogin && <button type="button" className="text-xs font-bold text-teal-600 mb-1 hover:underline">Forgot?</button>}
                      </div>
                      <div className="relative">
                        <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                          type="password" 
                          required
                          className="w-full bg-slate-50 border-2 border-slate-100 p-5 pl-14 rounded-2xl text-lg font-bold outline-none focus:border-teal-500/50 transition-all"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold animate-in fade-in duration-300 flex items-center gap-3">
                    <X size={16} /> {error}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={!!isLoading}
                  className="w-full calm-btn-primary py-5 rounded-2xl text-xl font-black shadow-xl flex items-center justify-center gap-3"
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : (
                    <>
                      {method === 'magic' ? 'Send Link' : isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>

                <div className="flex flex-col items-center gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => {
                      if (method === 'magic') setMethod('email');
                      else setMethod('social');
                    }}
                    className="text-slate-400 font-bold text-sm hover:text-slate-600"
                  >
                    Go Back
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-teal-700 font-black tracking-tight"
                  >
                    {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-[12px] text-slate-400 leading-relaxed max-w-[400px] mx-auto font-medium">
              By entering Sanctuary, you agree to our <a href="#" className="text-teal-600 font-bold hover:underline">Community Terms</a> and acknowledge our <a href="#" className="text-teal-600 font-bold hover:underline">Privacy Commitment</a> to keep your reflections safe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthFlow;
