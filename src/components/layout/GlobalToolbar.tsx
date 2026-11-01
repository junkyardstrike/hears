'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  Search, HelpCircle, Settings, User,
  Bell, Command, ChevronDown, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GlobalTaskModal } from '@/components/GlobalTaskModal';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export function GlobalToolbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const getPageTitle = (path: string) => {
    if (path === '/temple') return 'ステータス・神殿';
    if (path === '/clients') return '取引先・案件管理';
    if (path === '/') return 'ステータス・神殿'; // Home is now temple
    if (path.startsWith('/hearing')) return 'ヒアリング管理';
    if (path.startsWith('/cases')) return '案件マネジメント';
    if (path.startsWith('/finance')) return '収益アナリティクス';
    if (path.startsWith('/todo')) return '全体タスク管理';
    if (path.startsWith('/settings')) return 'システム設定';
    return 'ALCHEMIST SFA';
  };

  return (
    <header className="h-12 shrink-0 bg-card border-b border-border z-40 px-3 lg:px-4 flex items-center justify-between font-sans">
      {/* Left: Breadcrumb / Page Title */}
      <div className="flex items-center gap-2 lg:gap-3 min-w-0">
        <span className="hidden sm:inline text-[11px] text-muted-foreground tracking-wider">ALCHEMIST</span>
        <span className="hidden sm:inline text-muted-foreground">›</span>
        <h2 className="text-sm lg:text-[13px] font-bold text-foreground truncate">
          {getPageTitle(pathname)}
        </h2>
        <Badge variant="outline" className="bg-transparent text-muted-foreground border-border text-[9px] font-bold px-2 py-0 hidden sm:inline-flex">
          Ver 6.3.0
        </Badge>
        <span className="text-[10px] font-medium text-muted-foreground hidden md:inline">● System Active</span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 lg:gap-3 shrink-0">
        <div className="hidden xl:flex items-center gap-2 bg-input px-3 py-1.5 rounded-md border border-border group focus-within:ring-1 focus-within:ring-primary transition-all">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="クイック検索..."
            className="bg-transparent border-none text-xs font-medium focus:outline-none w-44 text-foreground"
          />
          <div className="flex items-center gap-1 bg-background border border-border px-1.5 py-0.5 rounded-md">
            <Command className="w-2.5 h-2.5 text-muted-foreground" />
            <span className="text-[9px] font-bold text-muted-foreground uppercase">K</span>
          </div>
        </div>

        <Button
          onClick={() => setIsTaskModalOpen(true)}
          className="flex items-center gap-1.5 bg-primary hover:brightness-110 text-primary-foreground font-bold h-8 px-3 rounded-md transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px] uppercase tracking-wider font-bold">NEW TASK</span>
          <span className="sm:hidden text-[11px] font-bold">タスク</span>
        </Button>

        <div className="flex items-center gap-0.5 lg:border-l border-border lg:pl-3">
          <Button variant="ghost" size="icon" className="hidden sm:flex text-muted-foreground hover:text-primary rounded-md h-8 w-8" title="ヘルプ">
            <HelpCircle className="w-4 h-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary rounded-md relative h-8 w-8" title="通知">
                <Bell className="w-4 h-4" />
                <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-card" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 rounded-md p-2 border-border paper-shadow-lg" align="end">
              <DropdownMenuLabel className="font-bold text-xs uppercase tracking-widest p-4">通知センター</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-4 text-center text-[10px] text-muted-foreground font-medium">新しい通知はありません</div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex text-muted-foreground hover:text-primary rounded-md h-8 w-8"
            title="設定"
            onClick={() => router.push('/settings')}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 bg-input pl-2 lg:pl-3 pr-1.5 py-1 rounded-md border border-border hover:bg-secondary transition-all cursor-pointer group">
              <div className="flex flex-col items-end hidden md:flex">
                <span className="text-[10px] font-bold text-foreground uppercase tracking-tight leading-tight">ADMIN</span>
                <span className="text-[8px] font-medium text-primary tracking-widest leading-tight">管理者</span>
              </div>
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-[10px]">
                AU
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground opacity-50 group-hover:opacity-100" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-md p-2 border-border bg-popover" align="end">
          <DropdownMenuItem onClick={() => router.push('/settings')} className="rounded-sm p-3 font-bold text-xs flex gap-3 cursor-pointer">
            <Settings className="w-4 h-4" /> プロフィール設定
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} className="rounded-sm p-3 font-bold text-xs flex gap-3 text-destructive cursor-pointer">
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
