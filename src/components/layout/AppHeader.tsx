'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home, Lock } from 'lucide-react';
import { useHearsStore } from '@/store/useHearsStore';
import { Button } from '@/components/ui/button';

export function AppHeader() {
  const pathname = usePathname();
  const { setLocked } = useHearsStore();

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
    <header className="pt-6 pb-8 px-4 flex flex-col items-center border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0 z-40">
      {/* Small Centered Logo */}
      <Link href="/" className="group mb-2">
        <h1 className="text-3xl font-black tracking-tighter text-white italic transition-all group-hover:text-primary group-hover:glow-text">
          ALCHEMIST
        </h1>
      </Link>
      
      <p className="text-[10px] sm:text-xs font-bold tracking-[0.3em] text-muted-foreground uppercase opacity-80 mb-4">
        案件管理・ヒアリングツール
      </p>

      {/* Breadcrumbs & Lock Button Container */}
      <div className="w-full max-w-6xl flex items-center justify-between gap-4">
        <nav className="flex items-center flex-wrap gap-1.5 text-[11px] font-medium overflow-hidden">
          <Link href="/" className="text-muted-foreground hover:text-white transition-colors shrink-0">
            <Home className="w-3 h-3" />
          </Link>
          {crumbs.length > 0 && crumbs.map((crumb, i) => (
            <div key={crumb.href} className="flex items-center gap-1.5 min-w-0">
              <ChevronRight className="w-3 h-3 text-muted-foreground/30 shrink-0" />
              <Link 
                href={crumb.href} 
                className={`truncate ${i === crumbs.length - 1 ? 'text-primary font-bold' : 'text-muted-foreground hover:text-white transition-colors'}`}
              >
                {crumb.label}
              </Link>
            </div>
          ))}
        </nav>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setLocked(true)}
          className="w-8 h-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 shrink-0"
        >
          <Lock className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
