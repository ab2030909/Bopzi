import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'Bopzi — Free Real-Time Multiplayer Quiz Arena',
  description:
    'The 100% free, modern real-time multiplayer quiz game platform. Host interactive live games, join instantly with PIN or QR code, featuring 4 original themes and mascots.',
  keywords: ['quiz game', 'trivia', 'bopzi', 'realtime multiplayer', 'classroom game', 'kahoot alternative free'],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap"
        />
      </head>
      <body className="antialiased selection:bg-purple-500 selection:text-white">
        <AuthProvider>
          <ThemeProvider>
            <Suspense fallback={<div className="h-16 w-full bg-white/95 border-b border-slate-100" />}>
              <Navbar />
            </Suspense>
            <main className="flex-1 flex flex-col">{children}</main>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
