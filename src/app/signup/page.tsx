'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  GraduationCap,
  BookOpen,
  Briefcase,
  Smile,
  ArrowRight,
  ArrowLeft,
  Check,
  Mail,
  Lock,
  User,
  Sparkles,
  School,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { AccountType, ACCOUNT_TYPE_CONFIG } from '@/types/auth';

const WORKPLACE_OPTIONS: Record<
  AccountType,
  { label: string; placeholder: string; options?: string[] }
> = {
  teacher: {
    label: 'Where do you teach?',
    placeholder: 'e.g. Lincoln High School or University',
    options: ['Elementary School (K-5)', 'Middle School (6-8)', 'High School (9-12)', 'Higher Education / University', 'Other Education'],
  },
  student: {
    label: 'What is your grade or school?',
    placeholder: 'e.g. 10th Grade / Stanford University',
    options: ['Middle School', 'High School', 'College / Undergraduate', 'Graduate / University', 'Independent Learner'],
  },
  professional: {
    label: 'Company or Organization name',
    placeholder: 'e.g. Acme Corp or Global Tech Inc.',
    options: ['Corporate Enterprise', 'Small & Medium Business', 'Startup', 'Non-profit & NGO', 'Freelance / Consultant'],
  },
  personal: {
    label: 'Main use for Bopzi',
    placeholder: 'e.g. Trivia nights, study, friends',
    options: ['Family Game Nights', 'Friend Trivia & Parties', 'Community Clubs', 'Personal Curiosity', 'Other Fun'],
  },
};

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const { signup } = useAuth();

  // Wizard Steps:
  // 1: Select Account Type (Kahoot style: Teacher, Student, Personal, Professional)
  // 2: Role Details (School/Workplace context)
  // 3: Create Credentials (Name, Email, Password)
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedType, setSelectedType] = useState<AccountType | null>(null);
  const [selectedWorkplaceOption, setSelectedWorkplaceOption] = useState<string>('');
  const [customOrgName, setCustomOrgName] = useState<string>('');

  // Credentials
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectType = (type: AccountType) => {
    setSelectedType(type);
    setSelectedWorkplaceOption(WORKPLACE_OPTIONS[type].options?.[0] || '');
    setStep(2);
  };

  const handleStep2Next = () => {
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName || !selectedType) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await signup({
        email,
        name: fullName,
        accountType: selectedType,
        workplace: selectedWorkplaceOption,
        organizationName: customOrgName || selectedWorkplaceOption,
      });

      router.push(redirectUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating account. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden font-sans">
      {/* Immersive World Selection Arena Background Image */}
      <img
        src="/images/world_selection_bg.png"
        alt="Bopzi Arena Background"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none z-0"
      />

      {/* Top Bar: subtle link to sign in */}
      <div className="relative z-10 w-full max-w-lg mx-auto px-4 pt-6 pb-2 flex items-center justify-end">
        <div className="flex items-center space-x-2 text-xs font-semibold">
          <span className="text-white/80 drop-shadow-sm">Have an account?</span>
          <Link
            href="/signin"
            className="px-3.5 py-1.5 rounded-full font-bold text-white bg-white/20 hover:bg-white/30 transition-all border border-white/30 backdrop-blur-xs hover:scale-105 active:scale-95"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Main Wizard Card Container - Compacted from max-w-2xl to max-w-lg */}
      <main className="relative z-10 w-full max-w-lg mx-auto px-4 py-4 flex-1 flex flex-col justify-center">
        <div className="bg-white/94 backdrop-blur-2xl border border-white/80 rounded-[28px] p-5 sm:p-7 shadow-[0_20px_50px_rgba(88,28,135,0.32)] transition-all">
          
          {/* Step Progress Pills */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex items-center space-x-1.5 transition-all ${
                  step === s
                    ? 'scale-105 font-black text-[#7C3AED]'
                    : step > s
                    ? 'text-emerald-600 font-bold'
                    : 'text-slate-400 font-medium'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                    step === s
                      ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-500/25 ring-4 ring-purple-100'
                      : step > s
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {step > s ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s}
                </div>
                <span className="text-xs hidden sm:inline">
                  {s === 1 ? 'Account Type' : s === 2 ? 'Details' : 'Account'}
                </span>
                {s < 3 && <div className="w-8 h-0.5 bg-slate-200/80 mx-1 rounded-full" />}
              </div>
            ))}
          </div>

          {/* =========================================================================
              STEP 1: KAHOOT-STYLE ACCOUNT TYPE SELECTION
          ========================================================================== */}
          {step === 1 && (
            <div className="animate-fadeIn">
              <div className="text-center mb-7">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black uppercase text-purple-700 bg-purple-50 tracking-wider mb-2">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  Choose your account type
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  How will you use Bopzi?
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  Pick the profile that best describes your primary goal. You can customize anytime.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {(['teacher', 'student', 'personal', 'professional'] as AccountType[]).map((type) => {
                  const cfg = ACCOUNT_TYPE_CONFIG[type];
                  const Icon =
                    type === 'teacher'
                      ? GraduationCap
                      : type === 'student'
                      ? BookOpen
                      : type === 'professional'
                      ? Briefcase
                      : Smile;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleSelectType(type)}
                      className="group p-5 rounded-2xl border-2 border-slate-100 hover:border-[#7C3AED] bg-slate-50/50 hover:bg-purple-50/40 text-left transition-all duration-200 hover:shadow-md flex flex-col justify-between min-h-[140px] relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between w-full mb-3">
                        <div
                          className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${cfg.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white border border-slate-200 text-slate-600 group-hover:border-purple-300 group-hover:text-purple-700 transition-colors">
                          {cfg.badge}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#7C3AED] transition-colors">
                          {cfg.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                          {cfg.subtitle}
                        </p>
                      </div>

                      <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-4 h-4 text-[#7C3AED]" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 2: ROLE DETAILS & WORKPLACE CONTEXT
          ========================================================================== */}
          {step === 2 && selectedType && (
            <div className="animate-fadeIn">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 mb-4 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change account type</span>
              </button>

              <div className="text-center mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase text-purple-700 bg-purple-50 tracking-wider mb-2">
                  <School className="w-3 h-3 text-purple-600" />
                  {ACCOUNT_TYPE_CONFIG[selectedType].title} Profile
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {WORKPLACE_OPTIONS[selectedType].label}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Help us personalize templates and community quizzes for your environment.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Category / Setting
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {WORKPLACE_OPTIONS[selectedType].options?.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedWorkplaceOption(opt)}
                        className={`p-3.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                          selectedWorkplaceOption === opt
                            ? 'border-[#7C3AED] bg-purple-50/70 text-[#7C3AED] ring-2 ring-purple-100'
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        <span>{opt}</span>
                        {selectedWorkplaceOption === opt && (
                          <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    School / Company Name (Optional)
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={customOrgName}
                      onChange={(e) => setCustomOrgName(e.target.value)}
                      placeholder={WORKPLACE_OPTIONS[selectedType].placeholder}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleStep2Next}
                  className="w-full mt-4 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-black text-sm tracking-wide shadow-md shadow-purple-500/20 hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
                >
                  <span>Continue to Credentials</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 3: CREDENTIALS (FULL NAME, EMAIL, PASSWORD)
          ========================================================================== */}
          {step === 3 && selectedType && (
            <div className="animate-fadeIn">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 mb-4 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to details</span>
              </button>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Create your free account
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  100% free forever — no credit card or subscription required.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 flex items-center gap-2 animate-fadeIn">
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Professor Sarah Miller"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@school.edu or you@company.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Create Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
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
                    <span>Creating your profile...</span>
                  ) : (
                    <>
                      <span>Complete Sign Up</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-[11px] text-center text-slate-400 mt-4 leading-relaxed">
                By signing up, you agree to Bopzi's Terms of Service and Privacy Policy.
              </p>
            </div>
          )}

        </div>
      </main>

      {/* Footer copyright */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-400">
        © 2026 BOPZI. Free Real-Time Multiplayer Quiz Arena.
      </footer>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 text-white font-bold text-sm">
          Loading Bopzi Sign Up...
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
