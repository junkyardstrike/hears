'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, ClipboardList, Briefcase, 
  BarChart3, ListTodo, Settings, Lock,
  TrendingUp, Wallet, ShieldCheck, ChevronRight, Crown
} from 'lucide-react';
import { useHearsStore } from '@/store/useHearsStore';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const PixelBot = () => (
  <div className="w-full flex justify-center mb-6">
    <div className="w-8 h-8 text-primary/30 animate-bounce hover:text-primary transition-colors cursor-default" style={{ animationDuration: '2.5s' }}>
      <svg viewBox="0 0 16 16" width="100%" height="100%" shapeRendering="crispEdges">
        <path d="M 4 2 h 8 v 2 H 4 Z M 2 4 h 2 v 2 H 2 Z M 12 4 h 2 v 2 H 12 Z M 2 6 h 12 v 6 H 2 Z M 5 7 v 2 h 2 v -2 Z M 9 7 v 2 h 2 v -2 Z M 4 12 h 2 v 2 H 4 Z M 10 12 h 2 v 2 H 10 Z" fill="currentColor" fillRule="evenodd" />
      </svg>
    </div>
  </div>
);


const menuItems = [
  { label: 'DASHBOARD', jpLabel: '取引先・案件管理', icon: LayoutDashboard, href: '/', color: 'text-white' },
  { label: 'HEARING', jpLabel: 'ヒアリング管理', icon: ClipboardList, href: '/hearing', color: 'text-white' },
  { label: 'CASES', jpLabel: '案件管理', icon: Briefcase, href: '/cases', color: 'text-white' },
  { label: 'FINANCE', jpLabel: '収益分析', icon: BarChart3, href: '/finance', color: 'text-white' },
  { label: 'TEMPLE', jpLabel: 'ステータス・神殿', icon: Crown, href: '/temple', color: 'text-white' },
  { label: 'TASKS', jpLabel: '全体タスク', icon: ListTodo, href: '/todo', color: 'text-white' },
];

export function Sidebar({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();
  const { cases, globalFinance } = useHearsStore();
  
  // Calculate revenue for meter
  const baseSalary = globalFinance?.baseSalary || 0;
  const totalMaintenance = cases.reduce((sum, c) => sum + (c.finance?.maintenanceFee || 0), 0);
  const currentRevenue = baseSalary + (totalMaintenance * 0.4);
  const revenueGoal = 500000;
  const progressPercent = Math.min(Math.round((currentRevenue / revenueGoal) * 100), 100);

  return (
    <aside className={cn(
      "flex flex-col w-72 bg-[var(--sidebar-bg)] text-[var(--sidebar-fg)] h-full z-50 border-r border-border font-sans tracking-tight",
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
                "flex items-center gap-4 px-4 py-3 rounded-md text-sm transition-all group relative overflow-hidden",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-105", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              <div className="flex flex-col">
                <span className={cn("text-[11px] font-bold tracking-wider", isActive ? "text-primary" : "text-foreground")}>{item.label}</span>
                <span className={cn("text-[8px] font-medium opacity-80 leading-none mt-0.5", isActive ? "text-primary/80" : "text-muted-foreground")}>{item.jpLabel}</span>
              </div>
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Revenue Meter */}
      <div className="p-6 mt-auto border-t border-border bg-card/50">
        <PixelBot />
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex flex-col">
              <span className="flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5" /> REVENUE RATE</span>
              <span className="text-[8px] opacity-80 ml-5">収益達成率</span>
            </span>
            <span className="text-xs font-bold text-foreground">{progressPercent}%</span>
          </div>
          <Progress 
            value={progressPercent} 
            className="h-1.5 bg-secondary [&>div]:bg-primary" 
          />
          <div className="mt-4 flex flex-col font-sans">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold tracking-tight text-foreground">¥{Math.floor(currentRevenue).toLocaleString()}</span>
              <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight">/ 500k TARGET</span>
            </div>
            <span className="text-[7px] font-medium text-muted-foreground uppercase tracking-widest mt-1">現在の月額歩合額 / 目標 50万円</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Link 
            href="/settings"
            className="flex flex-col items-center justify-center p-3 rounded-md bg-secondary hover:bg-secondary/80 transition-all border border-border group"
          >
            <Settings className="w-4 h-4 mb-1 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground">SETTINGS</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
