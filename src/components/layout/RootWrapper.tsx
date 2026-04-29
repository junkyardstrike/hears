'use client';

import { useState, useEffect } from 'react';
import { useHearsStore } from '@/store/useHearsStore';
import { PasscodeLock } from '@/components/PasscodeLock';
import { Sidebar } from './Sidebar';
import { GlobalToolbar } from './GlobalToolbar';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function RootWrapper({ children }: { children: React.ReactNode }) {
  const { isLocked, setLocked } = useHearsStore();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Security lock
  if (isLocked) {
    return <PasscodeLock onSuccess={() => setLocked(false)} />;
  }

  const isEditor = pathname.startsWith('/editor');

  return (
    <div className="min-h-screen bg-background flex">
      {!isEditor && <Sidebar />}
      
      <div className="flex-1 flex flex-col min-w-0">
        {!isEditor && <GlobalToolbar />}
        <main className={cn(
          "flex-1 w-full max-w-full overflow-y-auto",
          !isEditor ? "p-6 sm:p-10 lg:p-12" : ""
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}
