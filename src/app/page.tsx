'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useHearsStore } from '@/store/useHearsStore';
import { Button } from '@/components/ui/button';
import { 
  FileSearch, Briefcase, ListTodo, Settings, ChevronLeft, Lock
} from 'lucide-react';
import { SplashScreen } from '@/components/SplashScreen';
import Link from 'next/link';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto flex flex-col justify-center min-h-[calc(100vh-180px)]">
      <div className="grid grid-cols-2 gap-4 sm:gap-6 animate-in fade-in zoom-in-95 duration-500">
        <PortalButton 
          title="Hearing" 
          label="ヒアリング"
          subtitle="作成・管理"
          icon={<FileSearch className="w-6 h-6 sm:w-8 h-8" />}
          href="/hearing"
          color="from-emerald-500/20 to-emerald-500/5 hover:border-emerald-500/40"
        />
        <PortalButton 
          title="Cases" 
          label="進行案件"
          subtitle="案件管理"
          icon={<Briefcase className="w-6 h-6 sm:w-8 h-8" />}
          href="/cases"
          color="from-blue-500/20 to-blue-500/5 hover:border-blue-500/40"
        />
        <PortalButton 
          title="Global ToDo" 
          label="全体タスク"
          subtitle="全案件一覧"
          icon={<ListTodo className="w-6 h-6 sm:w-8 h-8" />}
          href="/todo"
          color="from-purple-500/20 to-purple-500/5 hover:border-purple-500/40"
        />
        <PortalButton 
          title="Settings" 
          label="設定"
          subtitle="PIN・データ"
          icon={<Settings className="w-6 h-6 sm:w-8 h-8" />}
          href="/settings"
          color="from-zinc-500/20 to-zinc-500/5 hover:border-zinc-500/40"
        />
      </div>
      
      <div className="mt-12 text-center opacity-30 text-[10px] font-bold tracking-widest uppercase text-white">
        Professional Management Infrastructure
      </div>
    </div>
  );
}

function PortalButton({ title, label, subtitle, icon, href, color }: any) {
  return (
    <Link 
      href={href}
      className={`group relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-[2rem] border border-white/5 bg-gradient-to-br ${color} transition-all hover:scale-[1.02] active:scale-95 text-center`}
    >
      <div className="p-3 sm:p-4 rounded-2xl bg-black/40 border border-white/5 mb-4 group-hover:text-primary group-hover:glow-text transition-all">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-[10px] font-black tracking-widest uppercase opacity-40 mb-1 text-white">{title}</h3>
        <p className="text-lg sm:text-2xl font-bold text-white tracking-tight">{label}</p>
        <p className="text-[10px] sm:text-xs font-medium text-white/40">{subtitle}</p>
      </div>
    </Link>
  );
}
