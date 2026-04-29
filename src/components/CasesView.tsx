'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useHearsStore } from '@/store/useHearsStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { 
  Plus, Trash2, ExternalLink, Shield, Server, FileText, 
  CheckCircle2, Circle, MoreVertical, X, Check, Clock, ChevronRight, Briefcase,
  Search, Filter, Tag, LayoutGrid, List, Calendar, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Suspense } from 'react';

function CasesViewContent() {
  const { cases, createCase, deleteCase, updateCase } = useHearsStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialFilter = searchParams.get('filter') || 'all';

  const handleCreate = () => {
    const name = prompt('案件名を入力してください', '新規案件');
    if (name) createCase(name);
  };

  const toggleStatus = (id: string, currentStatus: string) => {
    updateCase(id, (draft) => {
      draft.status = currentStatus === 'active' ? 'completed' : 'active';
    });
  };

  const renderCaseList = (filter: string) => {
    const list = cases.filter(c => {
      if (filter === 'active') return c.status === 'active';
      if (filter === 'completed') return c.status === 'completed';
      return true;
    });

    if (list.length === 0) {
      return (
        <div className="py-32 text-center bg-white/50 border-2 border-dashed border-border rounded-[3rem] animate-in fade-in duration-700">
          <div className="bg-secondary/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-12 h-12 text-muted-foreground opacity-20" />
          </div>
          <h3 className="text-xl font-bold italic tracking-tighter text-foreground mb-2">No Cases Found</h3>
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest opacity-40">該当する案件はありません</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4">
        {list.sort((a, b) => b.updatedAt - a.updatedAt).map((c, idx) => (
          <div key={`${c.id}-${idx}`} className="block group relative">
            <Link href={`/cases/${c.id}`} className="absolute inset-0 z-0 rounded-[2.5rem]" />
            <div className="bg-white p-8 rounded-[2.5rem] paper-shadow group-hover:paper-shadow-lg transition-all flex flex-col lg:flex-row items-center gap-8 border border-transparent group-hover:border-primary/20 relative overflow-hidden pointer-events-none">
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-2 transition-all",
                c.status === 'active' ? "bg-emerald-500" : "bg-blue-500"
              )} />
              
              <div className="flex flex-col items-center lg:items-start min-w-[140px] shrink-0">
                <Badge className={cn(
                  "rounded-lg px-3 py-1 text-[9px] font-bold tracking-widest border-none mb-3",
                  c.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600'
                )}>
                  {c.status === 'active' ? '進行中 / active' : '完了済 / completed'}
                </Badge>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-primary tracking-tighter italic">
                    <Tag className="w-3.5 h-3.5" /> {c.genre || '未設定'}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground tracking-widest opacity-60">
                    <Calendar className="w-3.5 h-3.5" /> {c.finance?.revenueStartMonth || '未設定'}
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-[300px] text-center lg:text-left py-2 group-hover:translate-x-1 transition-transform">
                <h3 className="text-2xl font-bold italic tracking-tighter text-foreground group-hover:text-primary transition-colors mb-2 font-[family-name:var(--font-outfit)] leading-tight">
                  {c.name}
                </h3>
                <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] opacity-40 truncate">
                  {c.contractEntity || '法人契約なし / no contract entity'}
                </p>
              </div>

              <div className="flex items-center gap-10 px-10 border-x border-border/50 shrink-0">
                {c.genre === 'HP制作' || c.genre === 'SNS運用' ? (
                  <>
                    <div className="flex flex-col text-center min-w-[120px]">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 mb-1">GROSS / 保守料</span>
                      <span className="text-xl font-bold italic tracking-tighter text-foreground font-[family-name:var(--font-outfit)]">¥{(c.finance?.maintenanceFee || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col text-center min-w-[120px]">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 mb-1">NET (40%) / 手取り額</span>
                      <span className="text-xl font-bold italic tracking-tighter text-emerald-600 font-[family-name:var(--font-outfit)]">¥{Math.floor((c.finance?.maintenanceFee || 0) * 0.4).toLocaleString()}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col text-center min-w-[120px]">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 mb-1">SPOT TOTAL / 案件総額</span>
                      <span className="text-xl font-bold italic tracking-tighter text-foreground font-[family-name:var(--font-outfit)]">¥{(c.finance?.spotFee || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col text-center min-w-[120px]">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 mb-1">NET ({c.finance?.spotRate ?? 40}%) / 手取り額</span>
                      <span className="text-xl font-bold italic tracking-tighter text-emerald-600 font-[family-name:var(--font-outfit)]">¥{Math.floor((c.finance?.spotFee || 0) * ((c.finance?.spotRate ?? 40) / 100)).toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0 lg:ml-auto pointer-events-auto relative z-10">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStatus(c.id, c.status);
                  }}
                  className={cn(
                    "h-12 w-12 rounded-2xl transition-all border border-transparent hover:border-border",
                    c.status === 'active' ? "text-emerald-600 hover:bg-emerald-50" : "text-blue-600 hover:bg-blue-50"
                  )}
                  title={c.status === 'active' ? "完了にする" : "進行中に戻す"}
                >
                  {c.status === 'active' ? <CheckCircle2 className="w-5 h-5" /> : <RefreshCw className="w-5 h-5" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={(e) => {
                    e.stopPropagation();
                    if(confirm('案件を削除しますか？')) deleteCase(c.id);
                  }}
                  className="h-12 w-12 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
                <div className="bg-secondary/50 p-3 rounded-2xl group-hover:bg-primary/10 transition-all">
                  <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 font-[family-name:var(--font-noto)] pb-10">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-white p-10 rounded-[3rem] paper-shadow">
        <div className="flex-1 min-w-0">
          <h2 className="text-3xl font-bold italic tracking-tighter text-foreground flex items-center gap-4 uppercase mb-1 font-[family-name:var(--font-outfit)]">
            <Briefcase className="w-10 h-10 text-primary" /> Case Repository
          </h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-40 ml-14 mb-6">案件管理リポジトリ ・ プロジェクト一括管理</p>
          
          <div className="flex flex-wrap items-center gap-x-10 gap-y-4 ml-14">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">TOTAL CASES / 全案件数</span>
              <span className="text-2xl font-bold italic tracking-tighter font-[family-name:var(--font-outfit)]">{cases.length}</span>
            </div>
            <div className="w-px h-6 bg-border hidden sm:block" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest opacity-60">ACTIVE / 進行中</span>
              <span className="text-2xl font-bold italic tracking-tighter text-emerald-600 font-[family-name:var(--font-outfit)]">{cases.filter(c => c.status === 'active').length}</span>
            </div>
            <div className="w-px h-6 bg-border hidden sm:block" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest opacity-60">COMPLETED / 完了済</span>
              <span className="text-2xl font-bold italic tracking-tighter text-blue-600 font-[family-name:var(--font-outfit)]">{cases.filter(c => c.status === 'completed').length}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto shrink-0">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-30" />
            <Input 
              placeholder="案件名・法人名で検索... / SEARCH" 
              className="h-16 bg-secondary/30 border-none rounded-2xl pl-12 font-bold text-xs"
            />
          </div>
          <Button 
            onClick={handleCreate} 
            className="h-16 px-10 bg-primary hover:bg-primary/90 text-white font-bold italic tracking-tight rounded-2xl shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 shrink-0 flex items-center gap-3"
          >
            <Plus className="w-7 h-7" />
            <span className="text-base uppercase tracking-widest flex flex-col items-start leading-none">
              <span className="text-[11px] font-black">NEW CASE</span>
              <span className="text-[8px] font-bold opacity-60 mt-1">新規案件を作成</span>
            </span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <NavTab 
          active={initialFilter === 'all'} 
          onClick={() => router.push('/cases?filter=all')}
          icon={<LayoutGrid className="w-5 h-5" />}
          label="ALL CASES"
          subLabel="すべての案件"
          count={cases.length}
          color="primary"
        />
        <NavTab 
          active={initialFilter === 'active'} 
          onClick={() => router.push('/cases?filter=active')}
          icon={<Clock className="w-5 h-5" />}
          label="ACTIVE"
          subLabel="進行中の案件"
          count={cases.filter(c => c.status === 'active').length}
          color="emerald"
        />
        <NavTab 
          active={initialFilter === 'completed'} 
          onClick={() => router.push('/cases?filter=completed')}
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="COMPLETED"
          subLabel="完了済みの案件"
          count={cases.filter(c => c.status === 'completed').length}
          color="blue"
        />
      </div>

      <div className="animate-in fade-in duration-500">
        {renderCaseList(initialFilter)}
      </div>
    </div>
  );
}

function NavTab({ active, onClick, icon, label, subLabel, count, color }: any) {
  const activeColors = {
    primary: "border-primary text-primary",
    emerald: "border-emerald-500 text-emerald-600",
    blue: "border-blue-500 text-blue-600"
  };

  return (
    <button 
      onClick={onClick}
      className={cn(
        "relative flex flex-col p-6 rounded-[2rem] transition-all text-left group active:scale-95",
        active 
          ? "bg-white paper-shadow-lg border-b-4 " + (activeColors as any)[color]
          : "bg-secondary/20 hover:bg-white hover:paper-shadow border-b-4 border-transparent"
      )}
    >
      <div className={cn(
        "p-2.5 rounded-xl mb-4 w-fit transition-all",
        active ? "bg-primary/10 text-primary" : "bg-muted-foreground/10 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
      )}>
        {icon}
      </div>
      
      <div className="flex justify-between items-end">
        <div>
          <span className={cn("text-[11px] font-black uppercase tracking-[0.2em] block mb-1", active ? "text-foreground" : "text-muted-foreground")}>{label}</span>
          <span className="text-[9px] font-bold text-muted-foreground opacity-40 uppercase tracking-widest">{subLabel}</span>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-lg text-[10px] font-black font-[family-name:var(--font-outfit)]",
          active ? "bg-primary text-white" : "bg-muted-foreground/10 text-muted-foreground"
        )}>
          {count}
        </div>
      </div>
    </button>
  );
}

export function CasesView() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CasesViewContent />
    </Suspense>
  );
}
