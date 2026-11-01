'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ClipboardList, Briefcase, BarChart3, ListTodo, Settings, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { label: 'TEMPLE', jpLabel: '神殿', icon: Crown, href: '/temple' },
  { label: 'DASHBOARD', jpLabel: '取引先', icon: LayoutDashboard, href: '/clients' },
  { label: 'HEARING', jpLabel: 'ヒアリング', icon: ClipboardList, href: '/hearing' },
  { label: 'CASES', jpLabel: '案件', icon: Briefcase, href: '/cases' },
  { label: 'FINANCE', jpLabel: '収益', icon: BarChart3, href: '/finance' },
  { label: 'TASKS', jpLabel: 'タスク', icon: ListTodo, href: '/todo' },
];

export function NavRail() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <aside className="w-14 lg:w-12 shrink-0 h-full flex flex-col items-center gap-1.5 py-3 bg-card border-r border-border z-40">
      <Link
        href="/temple"
        title="ALCHEMIST"
        className="font-bold text-base text-foreground mb-2 hover:text-primary transition-colors"
      >
        A
      </Link>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          title={`${item.label} ${item.jpLabel}`}
          aria-label={`${item.label} ${item.jpLabel}`}
          className={cn(
            'w-11 lg:w-9 flex flex-col items-center justify-center gap-0.5 rounded-md py-1.5 lg:py-2 transition-colors',
            isActive(item.href)
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          )}
        >
          <item.icon className="w-4 h-4" />
          <span className="text-[8px] font-bold leading-none lg:hidden">{item.jpLabel.slice(0, 4)}</span>
        </Link>
      ))}
      <div className="flex-1" />
      <Link
        href="/settings"
        title="SETTINGS 設定"
        aria-label="SETTINGS 設定"
        className={cn(
          'w-11 lg:w-9 flex items-center justify-center rounded-md py-2 transition-colors',
          isActive('/settings')
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        )}
      >
        <Settings className="w-4 h-4" />
      </Link>
    </aside>
  );
}
