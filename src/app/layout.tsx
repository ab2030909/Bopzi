import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'Anti Kahoot — Free Real-Time Multiplayer Quiz Arena',
  description:
    'The 100% free, modern real-time multiplayer quiz game platform. Host interactive live games, join instantly with PIN or QR code, featuring 4 original themes and mascots.',
  keywords: ['quiz game', 'trivia', 'anti kahoot', 'realtime multiplayer', 'classroom game', 'kahoot alternative free'],
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
        <ThemeProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
