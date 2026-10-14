'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Gamepad2,
} from 'lucide-react';

function SigninContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await login(email);
      router.push(redirectUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sign in. Please check your credentials.');
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (role: 'teacher' | 'student' | 'professional') => {
    setIsSubmitting(true);
    const demoEmail =
      role === 'teacher'
        ? 'sarah.teacher@school.edu'
        : role === 'student'
        ? 'alex.student@college.edu'
        : 'marcus.lead@company.com';
    const demoName =
      role === 'teacher' ? 'Sarah (Educator)' : role === 'student' ? 'Alex (Student)' : 'Marcus (Manager)';

    await login(demoEmail, demoName);
    router.push(redirectUrl);
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden font-sans">
      {/* Immersive Cyberpunk Arena Background Image (Matching Game Entry Join Screen) */}
      <img
        src="/images/join-bg.jpg"
        alt="Bopzi Arena Background"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none z-0"
      />

      {/* Top Bar: subtle link to sign up */}
      <div className="relative z-10 w-full max-w-[380px] mx-auto px-4 pt-6 pb-2 flex items-center justify-end">
        <div className="flex items-center space-x-2 text-xs font-semibold">
          <span className="text-white/80 drop-shadow-sm">Need an account?</span>
          <Link
            href="/signup"
            className="px-3.5 py-1.5 rounded-full font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] transition-all shadow-md shadow-purple-500/30 hover:scale-105 active:scale-95 border border-white/20 backdrop-blur-xs"
          >
            Sign up free
          </Link>
        </div>
      </div>

      {/* Main Sign In Form Card - Compacted to match join page max-w-[380px] */}
      <main className="relative z-10 w-full max-w-[380px] mx-auto px-4 py-4 flex-1 flex flex-col justify-center">
        <div className="bg-white/92 backdrop-blur-2xl border border-white/80 rounded-[28px] p-5 sm:p-6 shadow-[0_20px_50px_rgba(88,28,135,0.32)]">
          <div className="text-center mb-5">
            <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-black uppercase text-purple-700 bg-purple-50 tracking-wider mb-2">
              <Sparkles className="w-3 h-3 text-purple-600" />
              Welcome Back
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Sign In
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Host live quizzes & manage your games
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 animate-fadeIn">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Email / Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.edu or name@company.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password reset link simulated. You can also sign in with 1-click Demo below!');
                  }}
                  className="text-[11px] font-bold text-[#7C3AED] hover:underline"
                >
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-black text-sm tracking-wide shadow-lg shadow-purple-500/25 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Demo Profiles (Convenient for testing) */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold text-center text-slate-400 uppercase tracking-wider mb-2.5">
              Or 1-click test login as:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('teacher')}
                className="py-2 px-2.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-700 text-[11px] font-extrabold transition-all"
              >
                Teacher
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('student')}
                className="py-2 px-2.5 rounded-xl border border-pink-200 bg-pink-50/70 hover:bg-pink-100 text-pink-700 text-[11px] font-extrabold transition-all"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('professional')}
                className="py-2 px-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700 text-[11px] font-extrabold transition-all"
              >
                Pro
              </button>
            </div>
          </div>

          {/* Direct link to play */}
          <div className="mt-5 text-center">
            <Link
              href="/join"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <Gamepad2 className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>Have a PIN? Join a game without signing in</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-400">
        © 2026 BOPZI. Free Real-Time Multiplayer Quiz Arena.
      </footer>
    </div>
  );
}

export default function SigninPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 text-white font-bold text-sm">
          Loading Bopzi Sign In...
        </div>
      }
    >
      <SigninContent />
    </Suspense>
  );
}
