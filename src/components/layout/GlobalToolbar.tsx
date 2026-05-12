'use client';

import { usePathname, useRouter } from 'next/navigation';
import { 
  Search, HelpCircle, Settings, User, 
  Bell, Command, ChevronDown, Menu, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useHearsStore } from '@/store/useHearsStore';
import { GlobalTaskModal } from '@/components/GlobalTaskModal';
import { useState } from 'react';

export function GlobalToolbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setMobileMenuOpen } = useHearsStore();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  
  const getPageTitle = (path: string) => {
    if (path === '/') return 'ダッシュボード';
    if (path.startsWith('/hearing')) return 'ヒアリング管理';
    if (path.startsWith('/cases')) return '案件マネジメント';
    if (path.startsWith('/finance')) return '収益アナリティクス';
    if (path.startsWith('/todo')) return '全体タスク管理';
    if (path.startsWith('/settings')) return 'システム設定';
    return 'ALCHEMIST SFA';
  };

  return (
    <header className="h-16 lg:h-20 shrink-0 bg-background border-b border-border z-40 px-4 lg:px-8 flex items-center justify-between font-sans">
      {/* Left: Page Title */}
      <div className="flex items-center gap-2 lg:gap-6 min-w-0">
        <div className="lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </Button>
        </div>
        <div className="flex flex-col min-w-0">
          <h2 className="text-sm lg:text-xl font-bold italic tracking-tighter text-foreground uppercase font-[family-name:var(--font-outfit)] truncate">
            {getPageTitle(pathname)}
          </h2>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[8px] lg:text-[9px] font-bold uppercase tracking-widest px-2 py-0 font-[family-name:var(--font-outfit)]">
              Ver 6.3.0
            </Badge>
            <span className="text-[8px] lg:text-[9px] font-medium text-muted-foreground uppercase tracking-widest opacity-60 hidden sm:inline">System Active</span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 lg:gap-4 shrink-0">
        <div className="hidden xl:flex items-center gap-3 bg-secondary px-4 py-2 rounded-md border border-border group focus-within:ring-1 focus-within:ring-primary transition-all">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="クイック検索..." 
            className="bg-transparent border-none text-xs font-medium focus:outline-none w-48 text-foreground"
          />
          <div className="flex items-center gap-1 bg-background border border-border px-1.5 py-0.5 rounded-md">
            <Command className="w-2.5 h-2.5 text-muted-foreground" />
            <span className="text-[9px] font-bold text-muted-foreground uppercase">K</span>
          </div>
        </div>

        <Button 
          onClick={() => setIsTaskModalOpen(true)}
          className="hidden sm:flex items-center gap-2 bg-primary hover:brightness-110 text-primary-foreground font-bold h-10 px-4 rounded-md transition-all active:scale-95 ml-2 lg:ml-4"
        >
          <Plus className="w-4 h-4" />
          <span className="text-xs uppercase tracking-widest font-black">NEW TASK</span>
        </Button>

        <div className="flex items-center gap-1 lg:border-l border-border lg:pl-4">
          <Button variant="ghost" size="icon" className="hidden sm:flex text-muted-foreground hover:text-primary rounded-xl" title="ヘルプ">
            <HelpCircle className="w-5 h-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary rounded-xl relative" title="通知">
                <Bell className="w-5 h-5" />
                <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 rounded-2xl p-2 border-border paper-shadow-lg" align="end">
              <DropdownMenuLabel className="font-bold text-xs uppercase tracking-widest p-4">通知センター</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-4 text-center text-[10px] text-muted-foreground font-medium italic">新しい通知はありません</div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-primary rounded-xl" 
            title="設定"
            onClick={() => router.push('/settings')}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 lg:gap-3 bg-secondary pl-2 lg:pl-4 pr-2 py-1.5 rounded-md border border-border hover:bg-secondary/80 transition-all cursor-pointer group">
              <div className="flex flex-col items-end hidden md:flex">
                <span className="text-[10px] font-bold text-foreground uppercase tracking-tight">ADMIN</span>
                <span className="text-[8px] font-medium text-primary uppercase tracking-widest">管理者</span>
              </div>
              <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs group-hover:scale-105 transition-transform">
                AU
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground opacity-40 group-hover:opacity-100" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-md p-2 border-border bg-popover" align="end">
            <DropdownMenuItem onClick={() => router.push('/settings')} className="rounded-sm p-3 font-bold text-xs flex gap-3 cursor-pointer">
              <Settings className="w-4 h-4" /> プロフィール設定
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-sm p-3 font-bold text-xs flex gap-3 text-destructive cursor-pointer">
              <User className="w-4 h-4" /> ログアウト
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <GlobalTaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)}
        editingTodo={null}
      />
    </header>
  );
}
