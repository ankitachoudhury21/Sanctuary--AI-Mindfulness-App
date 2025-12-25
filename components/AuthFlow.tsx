
import React, { useState } from 'react';
import { Mail, Facebook, Chrome, Apple, X } from 'lucide-react';

interface Props {
  onAuthComplete: () => void;
  userName: string;
}

const AuthFlow: React.FC<Props> = ({ onAuthComplete, userName }) => {
  const [isLogin, setIsLogin] = useState(false);

  const SocialButton = ({ icon: Icon, label, color, isPrimary = false, brandIcon = false }: { icon: any, label: string, color?: string, isPrimary?: boolean, brandIcon?: boolean }) => (
    <button 
      onClick={onAuthComplete}
      className={`w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-full border transition-all font-medium text-base ${
        isPrimary 
          ? 'bg-[#1b3b5a] border-[#1b3b5a] text-white hover:bg-[#152e46] shadow-sm' 
          : 'bg-white border-[#d1d5db] text-[#111827] hover:bg-gray-50'
      }`}
    >
      <Icon size={22} className={color} />
      <span>Continue with {label}</span>
    </button>
  );

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* High-Fidelity Zen Aesthetic Background */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=2560')] bg-cover bg-center">
        <div className="absolute inset-0 bg-white/20"></div>
        <div className="absolute inset-0 bg-black/5 backdrop-blur-[2px]"></div>
      </div>

      {/* Header Controls */}
      <div className="fixed top-0 left-0 right-0 p-6 md:px-12 flex justify-end items-center z-50">
        <button className="p-2 text-gray-500 hover:text-gray-800 transition-colors bg-white/40 backdrop-blur-md rounded-full shadow-lg">
          <X size={24} />
        </button>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-[540px] animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-white/95 backdrop-blur-xl p-8 md:p-16 rounded-[2.5rem] shadow-2xl shadow-black/10 border border-white/40">
          <div className="text-center mb-10 space-y-3">
            <h3 className="text-2xl md:text-[28px] font-semibold text-[#111827] tracking-tight">
              {isLogin ? 'Log in to Sanctuary' : 'Create a free account to save your preferences'}
            </h3>
            <p className="text-[#6b7280] text-lg font-normal">
              {isLogin ? "Don't have an account? " : "Have a Sanctuary account? "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-[#4f46e5] font-medium hover:underline ml-1"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>

          <div className="space-y-4 max-w-[400px] mx-auto">
            <SocialButton icon={Mail} label="Email" isPrimary />
            <SocialButton icon={Facebook} label="Facebook" color="text-[#1877F2]" />
            <SocialButton icon={Apple} label="Apple" color="text-black" />
            <div className="relative">
              <button 
                onClick={onAuthComplete}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-full border border-[#d1d5db] bg-white text-[#111827] hover:bg-gray-50 transition-all font-medium text-base"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-[13px] text-[#6b7280] leading-relaxed max-w-[400px] mx-auto">
              By clicking Continue, you agree to our <a href="#" className="text-[#4f46e5] hover:underline">Terms</a> and acknowledge that you have read our <a href="#" className="text-[#4f46e5] hover:underline">Privacy Policy</a>, which explains how to opt out of offers and promos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthFlow;
