'use client';

import { useState, useEffect, useCallback } from 'react';
import { useHearsStore } from '@/store/useHearsStore';
import { Sidebar } from './Sidebar';
import { GlobalToolbar } from './GlobalToolbar';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { X, AlertCircle, RefreshCw } from 'lucide-react';

export function RootWrapper({ children }: { children: React.ReactNode }) {
  const { 
    mobileMenuOpen, setMobileMenuOpen, syncStatus
  } = useHearsStore();
  
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);


  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, setMobileMenuOpen]);

  if (!mounted) return null;
  const isEditor = pathname.startsWith('/editor');

  return (
    <div className="h-full flex w-full max-w-full">
      {!isEditor && <Sidebar />}
      
      {/* Mobile Sidebar Overlay */}
      {!isEditor && mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          <div className="relative w-72 h-full bg-[var(--sidebar-bg)] animate-in slide-in-from-left duration-500 shadow-2xl">
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="absolute right-4 top-4 p-2 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <Sidebar isMobile />
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-hidden">
        {!isEditor && <GlobalToolbar />}
        
        {/* Sync Status Toast (Mini) */}
        {syncStatus !== 'idle' && (
          <div className={cn(
            "fixed bottom-6 right-6 z-[100] px-4 py-2 rounded-full flex items-center gap-3 paper-shadow animate-in slide-in-from-bottom-4",
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
          !isEditor ? "p-4 sm:p-10 lg:p-12" : ""
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}
