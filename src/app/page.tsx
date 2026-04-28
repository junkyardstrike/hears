'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useHearsStore } from '@/store/useHearsStore';
import { Button } from '@/components/ui/button';
import { 
  FileSearch, Briefcase, ListTodo, Settings, ChevronLeft, Lock
} from 'lucide-react';
import { SplashScreen } from '@/components/SplashScreen';
import { PasscodeLock } from '@/components/PasscodeLock';
import { HearingView } from '@/components/HearingView';
import { CasesView } from '@/components/CasesView';
import { TodoView } from '@/components/GlobalTodoView';
import { SettingsView } from '@/components/SettingsView';

export default function Dashboard() {
  const router = useRouter();
  const { 
    isLocked, setLocked
  } = useHearsStore();
  
  const [mounted, setMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [currentView, setCurrentView] = useState<'portal' | 'hearing' | 'cases' | 'todo' | 'settings'>('portal');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (showSplash) return <SplashScreen onComplete={() => setShowSplash(false)} />;
  if (isLocked) return <PasscodeLock onSuccess={() => setLocked(false)} />;

  const renderPortal = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-in fade-in zoom-in-95 duration-500">
      <PortalButton 
        title="Hearing" 
        subtitle="ヒアリング管理・作成"
        icon={<FileSearch className="w-8 h-8" />}
        onClick={() => setCurrentView('hearing')}
        color="from-emerald-500/20 to-emerald-500/5"
      />
      <PortalButton 
        title="Cases" 
        subtitle="進行案件・管理"
        icon={<Briefcase className="w-8 h-8" />}
        onClick={() => setCurrentView('cases')}
        color="from-blue-500/20 to-blue-500/5"
      />
      <PortalButton 
        title="Global ToDo" 
        subtitle="全体タスク一覧"
        icon={<ListTodo className="w-8 h-8" />}
        onClick={() => setCurrentView('todo')}
        color="from-purple-500/20 to-purple-500/5"
      />
      <PortalButton 
        title="Settings" 
        subtitle="設定・パスコード"
        icon={<Settings className="w-8 h-8" />}
        onClick={() => setCurrentView('settings')}
        color="from-zinc-500/20 to-zinc-500/5"
      />
    </div>
  );

  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-8 max-w-6xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-12 sm:mb-16">
          <div className="relative pl-0 sm:pl-6">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary via-primary/50 to-transparent rounded-full hidden sm:block"></div>
            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter text-white leading-[0.8] mb-4 italic">
              ALCHEMIST
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base font-medium max-w-xs leading-relaxed opacity-60">
              案件管理・ヒアリングツール
            </p>
          </div>
          <div className="flex items-center gap-4">
            {currentView !== 'portal' && (
              <Button variant="ghost" onClick={() => setCurrentView('portal')} className="text-primary hover:bg-primary/10">
                <ChevronLeft className="w-5 h-5 mr-1" /> Portal
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setLocked(true)} className="text-muted-foreground hover:text-primary">
              <Lock className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* View Switcher */}
        {currentView === 'portal' && renderPortal()}
        {currentView === 'hearing' && <HearingView />}
        {currentView === 'cases' && <CasesView />}
        {currentView === 'todo' && <TodoView />}
        {currentView === 'settings' && <SettingsView />}
      </div>
    </main>
  );
}

function PortalButton({ title, subtitle, icon, onClick, color }: any) {
  return (
    <button 
      onClick={onClick}
      className={`group relative flex flex-col items-start p-8 rounded-3xl border border-white/5 bg-gradient-to-br ${color} transition-all hover:scale-[1.02] hover:glow-border active:scale-95`}
    >
      <div className="p-4 rounded-2xl bg-black/40 border border-white/5 mb-6 group-hover:text-primary transition-colors">
        {icon}
      </div>
      <div className="text-left">
        <h3 className="text-2xl font-black tracking-widest uppercase mb-1">{title}</h3>
        <p className="text-muted-foreground text-sm font-medium opacity-60">{subtitle}</p>
      </div>
      <div className="absolute top-8 right-8 w-2 h-2 rounded-full bg-primary/20 group-hover:bg-primary animate-pulse" />
    </button>
  );
}
