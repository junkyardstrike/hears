'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home, Lock } from 'lucide-react';
import { useHearsStore } from '@/store/useHearsStore';
import { Button } from '@/components/ui/button';

export function AppHeader() {
  const pathname = usePathname();

  const getBreadcrumbs = () => {
    const parts = pathname.split('/').filter(Boolean);
    const crumbs = [];
    
    if (pathname !== '/') {
      crumbs.push({ label: 'トップ', href: '/' });
    }

    if (parts[0] === 'hearing') crumbs.push({ label: 'ヒアリング管理', href: '/hearing' });
    if (parts[0] === 'cases') crumbs.push({ label: '進行案件・管理', href: '/cases' });
    if (parts[0] === 'todo') crumbs.push({ label: '全体タスク', href: '/todo' });
    if (parts[0] === 'settings') crumbs.push({ label: '設定', href: '/settings' });
    if (parts[0] === 'editor') crumbs.push({ label: 'ヒアリング編集', href: pathname });

    return crumbs;
  };

  const crumbs = getBreadcrumbs();

  return (
    <header className="lg:hidden pt-6 pb-6 px-4 flex flex-col items-center border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
      {/* Small Centered Logo */}
      <Link href="/" className="group mb-1">
        <h1 className="text-2xl font-black tracking-tighter text-foreground italic transition-all group-hover:text-primary">
          ALCHEMIST
        </h1>
      </Link>
      
      <p className="text-[9px] font-bold tracking-[0.2em] text-muted-foreground uppercase opacity-60 mb-4">
        SFA Infrastructure
      </p>

      {/* Breadcrumbs & Lock Button Container */}
      <div className="w-full flex items-center justify-between gap-4">
        <nav className="flex items-center flex-wrap gap-1 text-[10px] font-bold overflow-hidden">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <Home className="w-3.5 h-3.5" />
          </Link>
          {crumbs.length > 0 && crumbs.map((crumb, i) => (
            <div key={crumb.href} className="flex items-center gap-1 min-w-0">
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0" />
              <Link 
                href={crumb.href} 
                className={`truncate ${i === crumbs.length - 1 ? 'text-primary' : 'text-muted-foreground hover:text-foreground transition-colors'}`}
              >
                {crumb.label}
              </Link>
            </div>
          ))}
        </nav>
      </div>
    </header>
  );
}
