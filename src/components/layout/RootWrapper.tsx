'use client';

import { useState, useEffect } from 'react';
import { useHearsStore } from '@/store/useHearsStore';
import { NavRail } from './NavRail';
import { StatusBar } from './StatusBar';
import { GlobalToolbar } from './GlobalToolbar';
import { SIDE_TREE_SLOT_ID } from './SideTree';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function RootWrapper({ children }: { children: React.ReactNode }) {
  const { syncStatus } = useHearsStore();

  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  const isEditor = pathname.startsWith('/editor');

  return (
    <div className="h-full flex flex-col w-full max-w-full">
      <div className="flex-1 min-h-0 flex w-full max-w-full">
        {!isEditor && <NavRail />}

        {/* ページごとのツリー（PCのみ）。中身が無いときは非表示 */}
        {!isEditor && (
          <aside
            id={SIDE_TREE_SLOT_ID}
            className="hidden lg:flex flex-col w-[228px] shrink-0 gap-px p-2 pt-3 bg-card border-r border-border overflow-hidden empty:hidden"
          />
        )}

        <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-hidden">
          {!isEditor && <GlobalToolbar />}

          {/* Sync Status Toast (Mini) */}
          {syncStatus !== 'idle' && (
            <div className={cn(
              "fixed bottom-10 right-6 z-[100] px-4 py-2 rounded-full flex items-center gap-3 paper-shadow animate-in slide-in-from-bottom-4",
              syncStatus === 'syncing' ? "bg-emerald-600 text-white" : "bg-destructive text-white"
            )}>
              {syncStatus === 'syncing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Cloud Syncing...</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Sync Error</span>
                </>
              )}
            </div>
          )}

          <main className={cn(
            "flex-1 w-full max-w-full overflow-y-auto overflow-x-hidden",
            !isEditor ? "p-3 sm:p-6 lg:p-4" : ""
          )}>
            {children}
          </main>
        </div>
      </div>

      {!isEditor && <StatusBar />}
    </div>
  );
}
