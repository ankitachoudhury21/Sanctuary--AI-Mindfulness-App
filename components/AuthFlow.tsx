import React, { useState } from 'react';
import {
  Mail, ArrowRight, CheckCircle2, ShieldCheck,
  Loader2, ChevronLeft, Key, MailQuestion, X
} from 'lucide-react';
import backdropImg from '../src/assets/images/sanctuary_ambient_backdrop_1794849879379.jpg';

interface Props {
  onAuthComplete: () => void;
  userName: string;
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
    <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z" />
  </svg>
);

export const AuthFlow: React.FC<Props> = ({ onAuthComplete, userName }) => {
  const [method, setMethod] = useState<'social' | 'email' | 'magic'>('social');
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSocialAuth = (provider: string) => {
    setIsLoading(provider);
    setError(null);
    setTimeout(() => {
      setIsLoading(null);
      setShowSuccess(true);
      setTimeout(() => {
        onAuthComplete();
      }, 900);
    }, 800);
  };

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setIsLoading('email');
    setError(null);
    setTimeout(() => {
      setIsLoading(null);
      setShowSuccess(true);
      setTimeout(onAuthComplete, 900);
    }, 900);
  };

  const handleMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setIsLoading('magic');
    setError(null);
    setTimeout(() => {
      setIsLoading(null);
      setShowSuccess(true);
      setTimeout(onAuthComplete, 1100);
    }, 900);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4 overflow-y-auto">
        <div className="relative z-10 glass-card p-8 sm:p-12 rounded-2xl text-center space-y-5 max-w-md w-full animate-in fade-in duration-300">
          <div className="w-14 h-14 bg-[#0F5E59] dark:bg-teal-400 rounded-full flex items-center justify-center mx-auto text-white dark:text-slate-950">
            <CheckCircle2 size={28} />
          </div>
          <div className="space-y-2">
            <h2 className="font-editorial text-3xl font-normal text-slate-900 dark:text-white tracking-tight">
              Welcome home, {userName}.
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Preparing your personal workspace...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col overflow-y-auto overflow-x-hidden">
      {/* Subtle architectural photo backdrop */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <img
          src={backdropImg}
          alt="Minimalist Nordic spa backdrop"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-20 dark:opacity-15"
          decoding="async"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5F4EF]/85 to-[#F5F4EF] dark:from-[#090D12]/80 dark:to-[#090D12]"></div>
      </div>

      <header className="relative z-20 w-full max-w-5xl mx-auto px-5 sm:px-8 pt-6 pb-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <ShieldCheck size={18} className="text-[#0F5E59] dark:text-teal-400" />
          <span className="font-editorial text-xl text-slate-900 dark:text-white tracking-tight">Sanctuary</span>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Private Account · Final Step</span>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 pb-10 relative z-10">
        <div className="w-full max-w-[460px] glass-card p-6 sm:p-9 rounded-2xl animate-in fade-in duration-500">
          <div className="space-y-2 mb-7">
            <p className="text-xs font-medium text-[#0F5E59] dark:text-teal-400">Private Workspace Access</p>
            <h3 className="font-editorial text-2xl sm:text-3xl font-normal text-slate-900 dark:text-white tracking-tight text-balance">
              {method === 'social' ? 'Keep your journey synced' : method === 'magic' ? 'Passwordless magic link' : isLogin ? 'Sign in to Sanctuary' : `Create profile for ${userName}`}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {method === 'social'
                ? 'Choose a sign-in method to save reflections and mindfulness progress privately.'
                : method === 'magic'
                ? 'We will send a single-use entry link to your inbox.'
                : isLogin
                ? 'Access your saved acoustic channels and journals.'
                : 'Your reflections remain stored safely to your account.'}
            </p>
          </div>

          <div className="space-y-4">
            {method === 'social' && (
              <>
                <div className="space-y-2.5">
                  <button
                    onClick={() => handleSocialAuth('google')}
                    disabled={!!isLoading}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border bg-white dark:bg-white/[0.04] border-slate-900/12 dark:border-white/12 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-white/[0.08] transition-colors font-medium text-sm min-h-[46px] disabled:opacity-50"
                    aria-label="Continue with Google"
                  >
                    {isLoading === 'google' ? <Loader2 size={18} className="animate-spin text-[#0F5E59]" /> : (
                      <>
                        <GoogleIcon />
                        <span>Continue with Google</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleSocialAuth('apple')}
                    disabled={!!isLoading}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border bg-white dark:bg-white/[0.04] border-slate-900/12 dark:border-white/12 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-white/[0.08] transition-colors font-medium text-sm min-h-[46px] disabled:opacity-50"
                    aria-label="Continue with Apple"
                  >
                    {isLoading === 'apple' ? <Loader2 size={18} className="animate-spin text-[#0F5E59]" /> : (
                      <>
                        <AppleIcon />
                        <span>Continue with Apple</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-3 my-5">
                  <div className="h-px flex-1 bg-slate-900/10 dark:bg-white/10"></div>
                  <span className="text-xs text-slate-400">or continue with email</span>
                  <div className="h-px flex-1 bg-slate-900/10 dark:bg-white/10"></div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => setMethod('email')}
                    className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#F5F4EF] dark:bg-white/[0.04] border border-slate-900/10 dark:border-white/10 hover:border-slate-900/25 dark:hover:border-white/25 transition-colors text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 min-h-[44px]"
                    aria-label="Authenticate with email and password"
                  >
                    <Mail size={15} className="text-[#0F5E59] dark:text-teal-400" />
                    <span>Password</span>
                  </button>
                  <button
                    onClick={() => setMethod('magic')}
                    className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#F5F4EF] dark:bg-white/[0.04] border border-slate-900/10 dark:border-white/10 hover:border-slate-900/25 dark:hover:border-white/25 transition-colors text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 min-h-[44px]"
                    aria-label="Authenticate with a magic link"
                  >
                    <MailQuestion size={15} className="text-[#0F5E59] dark:text-teal-400" />
                    <span>Magic Link</span>
                  </button>
                </div>
              </>
            )}

            {(method === 'email' || method === 'magic') && (
              <form
                onSubmit={method === 'email' ? handleEmailAuth : handleMagicLink}
                className="space-y-4 animate-in fade-in duration-300"
              >
                <div>
                  <label htmlFor="email-input" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      id="email-input"
                      type="email"
                      required
                      className="w-full bg-[#F5F4EF] dark:bg-slate-900/70 border border-slate-900/12 dark:border-white/12 py-3 pl-10 pr-4 rounded-xl text-sm font-medium outline-none focus:border-[#0F5E59] dark:focus:border-teal-400 text-slate-900 dark:text-white transition-colors"
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-label="Email address"
                    />
                  </div>
                </div>

                {method === 'email' && (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label htmlFor="password-input" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        Password
                      </label>
                      {isLogin && (
                        <button
                          type="button"
                          onClick={() => setMethod('magic')}
                          className="text-xs font-medium text-[#0F5E59] dark:text-teal-400 hover:underline"
                          aria-label="Use magic link instead"
                        >
                          Use magic link
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        id="password-input"
                        type="password"
                        required
                        className="w-full bg-[#F5F4EF] dark:bg-slate-900/70 border border-slate-900/12 dark:border-white/12 py-3 pl-10 pr-4 rounded-xl text-sm font-medium outline-none focus:border-[#0F5E59] dark:focus:border-teal-400 text-slate-900 dark:text-white transition-colors"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        aria-label="Password"
                      />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-medium flex items-center gap-2">
                    <X size={14} className="flex-shrink-0" /> {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!!isLoading}
                  className="w-full calm-btn-primary py-3.5 px-5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 min-h-[46px]"
                  aria-label={method === 'magic' ? 'Send Magic Link' : isLogin ? 'Sign In to your account' : 'Create your account'}
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : (
                    <>
                      <span>{method === 'magic' ? 'Send Magic Link' : isLogin ? 'Sign In' : 'Create Account'}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setMethod('social'); setError(null); }}
                  className="w-full flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-medium py-2 hover:text-slate-900 dark:hover:text-white transition-colors"
                  aria-label="Back to authentication options"
                >
                  <ChevronLeft size={14} /> Other sign-in options
                </button>
              </form>
            )}

            <div className="pt-4 border-t border-slate-900/10 dark:border-white/10 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-[#0F5E59] dark:hover:text-teal-400 transition-colors"
                aria-label={isLogin ? 'Switch to create new account' : 'Switch to sign in'}
              >
                {isLogin ? "New to Sanctuary? Create a profile" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};