'use client';

import { useHearsStore } from '@/store/useHearsStore';

export function StatusBar() {
  const { cases, globalFinance, syncStatus } = useHearsStore();

  // 旧 Sidebar の収益達成率メーターと同じ計算
  const baseSalary = globalFinance?.baseSalary || 0;
  const totalMaintenance = cases.reduce((sum, c) => sum + (c.finance?.maintenanceFee || 0), 0);
  const currentRevenue = baseSalary + totalMaintenance * 0.4;
  const revenueGoal = 500000;
  const progressPercent = Math.min(Math.round((currentRevenue / revenueGoal) * 100), 100);

  const syncLabel =
    syncStatus === 'syncing' ? '… 同期中' : syncStatus === 'error' ? '! 同期エラー' : '✓ 同期済み';

  return (
    <footer className="shrink-0 h-6 px-3 flex items-center gap-3 lg:gap-5 bg-primary text-primary-foreground text-[10px] lg:text-[11px] font-bold whitespace-nowrap overflow-hidden">
      <span>{syncLabel}</span>
      <span>REVENUE RATE {progressPercent}%</span>
      <span className="hidden sm:inline">
        ¥{Math.floor(currentRevenue).toLocaleString()} / 500k TARGET
      </span>
      <span className="flex-1" />
      <span className="hidden md:inline opacity-90">ALCHEMIST SFA INFRASTRUCTURE</span>
    </footer>
  );
}
