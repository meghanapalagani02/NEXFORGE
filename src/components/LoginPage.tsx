import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Building2,
  Cpu,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { NexforgeLogo } from './NexforgeLogo';
import { UserProfile } from '../types/auth';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('operations.planner@nexforge.io');
  const [password, setPassword] = useState<string>('••••••••••••');
  const [fullName, setFullName] = useState<string>('Meghana Palagani');
  const [organization, setOrganization] = useState<string>('Plant 04 Operations');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setGoogleLoading(false);
      onLoginSuccess({
        id: `usr_${Date.now()}`,
        name: fullName || 'Operations Planner',
        email: email.includes('@') ? email : 'planner.lead@nexforge.io',
        role: 'Master Production Scheduler',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        provider: 'google',
        lastLogin: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }, 600);
  };

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid work email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setLoading(false);
      onLoginSuccess({
        id: `usr_${Date.now()}`,
        name: isSignUp ? (fullName || 'Plant Scheduler') : (fullName || 'Operations Planner'),
        email: email,
        role: isSignUp ? 'Production Engineer' : 'Master Production Scheduler',
        provider: 'password',
        lastLogin: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F1] flex flex-col justify-center py-8 sm:px-6 lg:px-8 text-slate-900 relative overflow-hidden font-sans select-none">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-orange-200 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-amber-200 blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex flex-col items-center">
          <NexforgeLogo size="md" showText={false} glow />
          <h2 className="mt-3 text-2xl font-bold font-mono tracking-tight text-slate-900 text-center">
            NEXFORGE
          </h2>
          <p className="mt-1 text-xs text-slate-600 font-mono text-center">
            AI-POWERED PRODUCTION PLANNING & OPERATIONS
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-orange-200">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">
              {isSignUp ? 'Create your planner account' : 'Sign in to your planning workspace'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Access demand forecasts, inventory optimizations & factory schedules.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Continue with Google Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-300 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all shadow-2xs cursor-pointer hover:border-slate-400 active:scale-[0.99] disabled:opacity-60"
            >
              {googleLoading ? (
                <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-mono">
              <span className="bg-white px-2 text-slate-400 text-[10px] font-bold">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full px-3 py-2 text-xs border border-orange-200 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none bg-slate-50 focus:bg-white"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-orange-200 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none bg-slate-50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => alert('Password reset link sent to your registered work email.')}
                    className="text-[10px] text-orange-700 hover:underline cursor-pointer font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-9 py-2 text-xs border border-orange-200 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none bg-slate-50 focus:bg-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Plant / Facility Unit
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. Plant 04 Assembly Line"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-orange-200 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white bg-orange-600 hover:bg-orange-500 font-bold text-xs shadow-md transition-all cursor-pointer active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Create Planner Account' : 'Sign In with Email'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between Sign In & Sign Up */}
          <div className="mt-5 text-center text-xs text-slate-600">
            {isSignUp ? (
              <span>
                Already have a planner account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setErrorMessage(null);
                  }}
                  className="font-bold text-orange-700 hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                New to Nexforge?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setErrorMessage(null);
                  }}
                  className="font-bold text-orange-700 hover:underline cursor-pointer"
                >
                  Create an account
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Security & Compliance badges */}
        <div className="mt-6 flex items-center justify-center gap-4 text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>256-Bit SSL Encrypted</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-orange-600" />
            <span>ISO 27001 Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
