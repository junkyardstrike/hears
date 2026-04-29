'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, ClipboardList, Briefcase, 
  BarChart3, ListTodo, Settings, Lock,
  TrendingUp, Wallet, ShieldCheck, ChevronRight
} from 'lucide-react';
import { useHearsStore } from '@/store/useHearsStore';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const menuItems = [
  { label: 'DASHBOARD', jpLabel: 'ダッシュボード', icon: LayoutDashboard, href: '/', color: 'text-white' },
  { label: 'HEARING', jpLabel: 'ヒアリング管理', icon: ClipboardList, href: '/hearing', color: 'text-white' },
  { label: 'CASES', jpLabel: '案件管理', icon: Briefcase, href: '/cases', color: 'text-white' },
  { label: 'FINANCE', jpLabel: '収益分析', icon: BarChart3, href: '/finance', color: 'text-white' },
  { label: 'TASKS', jpLabel: '全体タスク', icon: ListTodo, href: '/todo', color: 'text-white' },
];

export function Sidebar({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const { setLocked, cases, globalFinance } = useHearsStore();
  
  // Calculate revenue for meter
  const baseSalary = globalFinance?.baseSalary || 0;
  const totalMaintenance = cases.reduce((sum, c) => sum + (c.finance?.maintenanceFee || 0), 0);
  const currentRevenue = baseSalary + (totalMaintenance * 0.4);
  const revenueGoal = 500000;
  const progressPercent = Math.min(Math.round((currentRevenue / revenueGoal) * 100), 100);

  return (
    <aside className={cn(
      "flex flex-col w-72 bg-[var(--sidebar-bg)] text-[var(--sidebar-fg)] h-screen sticky top-0 z-50 shadow-2xl font-[family-name:var(--font-noto)]",
      !isMobile && "hidden lg:flex"
    )}>
      {/* Branding */}
      <div className="p-10">
        <Link href="/" className="group inline-block">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white italic transition-all group-hover:scale-105 font-[family-name:var(--font-outfit)]">
              ALCHEMIST
            </h1>
          </div>
          <p className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase pl-1 font-[family-name:var(--font-outfit)]">
            SFA INFRASTRUCTURE
          </p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-5 py-4 rounded-2xl text-sm transition-all group relative overflow-hidden",
                isActive 
                  ? "bg-white text-[var(--sidebar-bg)] shadow-xl" 
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-[var(--sidebar-bg)]" : "text-white/50 group-hover:text-white")} />
              <div className="flex flex-col">
                <span className={cn("text-[11px] font-black tracking-widest", isActive ? "text-[var(--sidebar-bg)]" : "text-white")}>{item.label}</span>
                <span className={cn("text-[8px] font-bold opacity-60 leading-none mt-0.5", isActive ? "text-[var(--sidebar-bg)]" : "text-white/60")}>{item.jpLabel}</span>
              </div>
              {isActive && (
                <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-[var(--sidebar-bg)]/20" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Revenue Meter */}
      <div className="p-8 mt-auto border-t border-white/10 bg-black/10 backdrop-blur-sm">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest flex flex-col">
              <span className="flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5 text-white/60" /> REVENUE RATE</span>
              <span className="text-[8px] opacity-60 ml-5">収益達成率</span>
            </span>
            <span className="text-xs font-black text-white">{progressPercent}%</span>
          </div>
          <Progress 
            value={progressPercent} 
            className="h-2 bg-white/10 [&>div]:bg-white" 
          />
          <div className="mt-4 flex flex-col font-[family-name:var(--font-outfit)]">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black italic text-white">¥{Math.floor(currentRevenue).toLocaleString()}</span>
              <span className="text-[9px] text-white/30 font-black uppercase tracking-tighter">/ 500k TARGET</span>
            </div>
            <span className="text-[7px] font-bold text-white/20 uppercase tracking-[0.2em] mt-1">現在の月額手取り額 / 目標 50万円</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link 
            href="/settings"
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 group"
          >
            <Settings className="w-5 h-5 mb-1 text-white/50 group-hover:text-white transition-colors" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-white/80">SETTINGS</span>
            <span className="text-[7px] font-bold text-white/20 uppercase">設定</span>
          </Link>
          <button 
            onClick={() => setLocked(true)}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 hover:bg-white/20 transition-all border border-white/5 group"
          >
            <Lock className="w-5 h-5 mb-1 text-white/50 group-hover:text-white transition-colors" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-white/80">LOCK</span>
            <span className="text-[7px] font-bold text-white/20 uppercase">ロック</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
