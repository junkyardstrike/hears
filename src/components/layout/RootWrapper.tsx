'use client';

import { useState, useEffect } from 'react';
import { useHearsStore } from '@/store/useHearsStore';
import { SplashScreen } from '@/components/SplashScreen';
import { PasscodeLock } from '@/components/PasscodeLock';
import { AppHeader } from './AppHeader';
import { usePathname } from 'next/navigation';

export function RootWrapper({ children }: { children: React.ReactNode }) {
  const { isLocked, setLocked } = useHearsStore();
  const [showSplash, setShowSplash] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Splash screen only on initial load of the portal or entire app
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // Security lock
  if (isLocked) {
    return <PasscodeLock onSuccess={() => setLocked(false)} />;
  }

  // Dashboard has no header, sub-pages have header
  const isEditor = pathname.startsWith('/editor');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!isEditor && <AppHeader />}
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}
