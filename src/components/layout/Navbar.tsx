'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gamepad2, ArrowRight, User } from 'lucide-react';
import { sounds } from '@/lib/audio';

export function Navbar() {
  const pathname = usePathname();
  const isJoinPage = pathname === '/join';
  const [hovered, setHovered] = useState(false);

  return (
    <>
      {/* On join page: top edge invisible hover detector to open menu when user moves mouse to top */}
      {isJoinPage && (
        <div
          onMouseEnter={() => setHovered(true)}
          className="fixed top-0 left-0 right-0 h-4 z-[60]"
          aria-hidden="true"
        />
      )}

      <header
        onMouseEnter={() => isJoinPage && setHovered(true)}
        onMouseLeave={() => isJoinPage && setHovered(false)}
        className={`${
          isJoinPage
            ? `fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
                hovered ? 'translate-y-0 shadow-2xl' : '-translate-y-full'
              }`
            : 'sticky top-0 z-50'
        } bg-white/95 backdrop-blur-md border-b border-slate-100`}
      >
        <div className="max-w-[1550px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo matching official uploaded logo asset */}
          <Link href="/" className="flex items-center space-x-2 group select-none">
            <img
              src="/images/logo.png"
              alt="Bopzi Official Logo"
              className="h-9 sm:h-10 w-auto object-contain hover:scale-105 transition-transform"
            />
          </Link>

        {/* Center Nav Links matching screenshot */}
        <nav className="hidden md:flex items-center space-x-1 sm:space-x-2">
          <Link
            href="/"
            className="px-4 py-2 rounded-full text-sm font-bold bg-[#F3E8FF] text-[#7C3AED] hover:opacity-90 transition-all"
          >
            Home
          </Link>
          <a
            href="#features"
            className="px-4 py-2 rounded-full text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
          >
            Features
          </a>
          <a
            href="#themes"
            className="px-4 py-2 rounded-full text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
          >
            Themes
          </a>
          <a
            href="#how-it-works"
            className="px-4 py-2 rounded-full text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
          >
            How it Works
          </a>
          <a
            href="#faq"
            className="px-4 py-2 rounded-full text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
          >
            FAQ
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Join a Game Button */}
          <Link
            href="/join"
            onClick={() => sounds.playCountdownTick()}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
          >
            <Gamepad2 className="w-4 h-4 text-[#7C3AED]" />
            <span>Join a Game</span>
          </Link>

          {/* Create a Quiz Primary CTA */}
          <Link
            href="/dashboard"
            onClick={() => sounds.playQuestionStart()}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <span>Create a Quiz</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Profile Circle Avatar */}
          <Link
            href="/dashboard"
            className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-all"
            title="Account & Dashboard"
          >
            <User className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
    </>
  );
}
