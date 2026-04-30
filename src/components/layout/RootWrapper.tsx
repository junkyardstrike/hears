'use client';

import { useState, useEffect, useCallback } from 'react';
import { useHearsStore } from '@/store/useHearsStore';
import { PasscodeLock } from '@/components/PasscodeLock';
import { Sidebar } from './Sidebar';
import { GlobalToolbar } from './GlobalToolbar';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { X, AlertCircle, RefreshCw } from 'lucide-react';

export function RootWrapper({ children }: { children: React.ReactNode }) {
  const { 
    isLocked, setLocked, mobileMenuOpen, setMobileMenuOpen,
    backupSettings, loadSyncDirHandle, importDatabase, exportDatabase, setBackupSettings
  } = useHearsStore();
  
  const [mounted, setMounted] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const pathname = usePathname();

  // Initialization: Load handle and check for latest data
  useEffect(() => {
    const initSync = async () => {
      setMounted(true);
      
      // 1. Load directory handle from IDB
      await loadSyncDirHandle();
      
      // We need to get the latest state after loadSyncDirHandle
      const currentStore = useHearsStore.getState();
      const { enabled, syncDirHandle, masterPassword, lastBackupDate } = currentStore.backupSettings;

      if (enabled && syncDirHandle && masterPassword) {
        setSyncStatus('syncing');
        try {
          // 2. Point 2: Auto Load at startup
          // Find the latest .alchemist file in the directory
          let latestFile: any = null;
          let latestTime = 0;

          for await (const entry of (syncDirHandle as any).values()) {
            if (entry.kind === 'file' && entry.name.endsWith('.alchemist')) {
              const file = await entry.getFile();
              if (file.lastModified > latestTime) {
                latestTime = file.lastModified;
                latestFile = entry;
              }
            }
          }

          if (latestFile) {
            // Auto import if found
            await importDatabase(latestFile, masterPassword);
          }

          // 3. Point 3: 3-day backup check
          const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
          if (!lastBackupDate || (Date.now() - lastBackupDate > THREE_DAYS_MS)) {
            console.log('Last backup was more than 3 days ago. Triggering auto-backup...');
            const res = await exportDatabase(syncDirHandle, masterPassword);
            if (res.success) {
              setBackupSettings({ lastBackupDate: Date.now() });
            }
          }
          
          setSyncStatus('idle');
        } catch (e) {
          console.error('Auto-sync failed:', e);
          setSyncStatus('error');
        }
      }
    };

    initSync();
  }, [loadSyncDirHandle, importDatabase, exportDatabase, setBackupSettings]);

  // Point 2: Auto Save on beforeunload
  useEffect(() => {
    const handleBeforeUnload = async () => {
      const { enabled, syncDirHandle, masterPassword } = useHearsStore.getState().backupSettings;
      if (enabled && syncDirHandle && masterPassword) {
        // Note: Async calls in beforeunload are tricky in browsers.
        // We trigger it, but it might not complete if the tab closes too fast.
        // For PWAs, we'd typically use a background sync service, 
        // but here we follow the instruction to "アプリ終了時に実行".
        exportDatabase(syncDirHandle, masterPassword).then(res => {
          if (res.success) {
            useHearsStore.getState().setBackupSettings({ lastBackupDate: Date.now() });
          }
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [exportDatabase]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, setMobileMenuOpen]);

  if (!mounted) return null;

  // Security lock
  if (isLocked) {
    return <PasscodeLock onSuccess={() => setLocked(false)} />;
  }

  const isEditor = pathname.startsWith('/editor');

  return (
    <div className="min-h-screen bg-background flex overflow-x-hidden max-w-full">
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
