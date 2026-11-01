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
  Search, Filter, Tag, LayoutGrid, List, Calendar, RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Suspense, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SideTree, TreeItem } from '@/components/layout/SideTree';

function CasesViewContent() {
  const { cases, createCase, deleteCase, updateCase } = useHearsStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialFilter = searchParams.get('filter') || 'all';
  const [sortOption, setSortOption] = useState<'revenueStartMonth' | 'updatedAt' | 'amount'>('revenueStartMonth');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

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
        <div className="py-12 text-center bg-card border border-dashed border-border rounded-md animate-in fade-in duration-300">
          <div className="bg-secondary w-12 h-12 rounded-md flex items-center justify-center mx-auto mb-3">
            <Briefcase className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1">No Cases Found</h3>
          <p className="text-muted-foreground font-bold text-xs">該当する案件はありません</p>
        </div>
      );
    }

    const sortedList = list.map(c => {
      let caseGross = 0;
      if (c.finance) {
        if (c.genre === 'HP制作' || c.genre === 'SNS運用') {
          const now = new Date();
          let caseStock = 0;
          let caseShot = c.finance.oneTimeFee || 0;
          const startStr = c.finance.revenueStartMonth;
          if (startStr) {
             const startYear = parseInt(startStr.split('-')[0]);
             const startMonth = parseInt(startStr.split('-')[1]) - 1;
             const startD = new Date(startYear, startMonth, 1);
             const nowD = new Date(now.getFullYear(), now.getMonth(), 1);
             if (nowD >= startD) {
                const monthsActive = (nowD.getFullYear() - startD.getFullYear()) * 12 + (nowD.getMonth() - startD.getMonth()) + 1;
                caseStock = (c.finance.maintenanceFee || 0) * monthsActive;
             }
          }
          caseGross = caseShot + caseStock;
        } else {
          caseGross = c.finance.spotFee || 0;
        }
      }
      return { ...c, caseGross };
    }).sort((a, b) => {
      let comparison = 0;
      if (sortOption === 'updatedAt') {
        comparison = a.updatedAt - b.updatedAt;
      } else if (sortOption === 'amount') {
        comparison = a.caseGross - b.caseGross;
      } else if (sortOption === 'revenueStartMonth') {
        const aMonth = a.finance?.revenueStartMonth || '';
        const bMonth = b.finance?.revenueStartMonth || '';
        if (!aMonth && bMonth) return 1; // empty always at bottom
        if (aMonth && !bMonth) return -1;
        comparison = aMonth.localeCompare(bMonth);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return (
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
        {sortedList.map((c, idx) => (
          <div key={`${c.id}-${idx}`} className="block group relative">
            <Link href={`/cases/${c.id}`} className="absolute inset-0 z-0 rounded-md" />
            <div className="bg-card p-3 lg:py-3 lg:pl-5 lg:pr-3 rounded-md border border-border hover:border-primary/50 transition-colors flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-6 relative overflow-hidden pointer-events-none">
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1 transition-all",
                c.status === 'active' ? "bg-emerald-500" : "bg-blue-500"
              )} />
              
              <div className="flex flex-col items-start min-w-0 lg:w-[150px] shrink-0 w-full">
                <Badge className={cn(
                  "rounded-md px-2 py-0.5 text-[7px] lg:text-[10px] font-bold tracking-wide border-none mb-1 lg:mb-1.5",
                  c.status === 'active' ? 'bg-emerald-500/10 text-emerald-700' : 'bg-blue-500/10 text-blue-700'
                )}>
                  {c.status === 'active' ? '進行中 / active' : '完了済 / completed'}
                </Badge>
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                    <Tag className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                    <span className="text-[8px] lg:text-[10px] font-bold truncate max-w-[100px] lg:max-w-none">
                      {c.genre || '未設定'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 lg:gap-1.5 text-[8px] lg:text-[10px] font-bold text-muted-foreground">
                    <Calendar className="w-3 h-3" /> {c.finance?.revenueStartMonth || '未設定'}
                  </div>
                </div>
              </div>

              <div className="flex-1 w-full lg:w-auto min-w-0 text-left py-1 lg:py-0">
                <h3 className="text-sm lg:text-base font-bold text-foreground group-hover:text-primary transition-colors mb-0 lg:mb-0.5 leading-tight truncate lg:whitespace-normal lg:line-clamp-2">
                  {c.name}
                </h3>
                <p className="text-[7px] lg:text-[11px] font-bold text-muted-foreground truncate">
                  {c.contractEntity || '法人契約なし'}
                </p>
              </div>

              <div className="flex flex-row items-center gap-2 lg:gap-4 px-0 border-t lg:border-t-0 border-border shrink-0 w-full lg:w-[280px] pt-2 lg:pt-0 justify-between lg:justify-end">
                {c.genre === 'HP制作' || c.genre === 'SNS運用' ? (
                  <>
                    <div className="flex flex-col text-left lg:text-right min-w-0 lg:min-w-[120px]">
                      <span className="text-[6px] lg:text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">保守 / MAINTENANCE</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] lg:text-xs font-bold text-foreground">¥{(c.finance?.maintenanceFee || 0).toLocaleString()} <span className="text-[7px] lg:text-[9px] text-muted-foreground">GROSS</span></span>
                        <span className="text-[10px] lg:text-xs font-bold text-emerald-700">¥{Math.floor((c.finance?.maintenanceFee || 0) * 0.4).toLocaleString()} <span className="text-[7px] lg:text-[9px] text-emerald-700">NET</span></span>
                      </div>
                    </div>
                    <div className="flex flex-col text-left lg:text-right min-w-0 lg:min-w-[120px] border-l border-border pl-3 lg:pl-4">
                      <span className="text-[6px] lg:text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">制作 / PRODUCTION</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] lg:text-xs font-bold text-foreground">¥{(c.finance?.oneTimeFee || 0).toLocaleString()} <span className="text-[7px] lg:text-[9px] text-muted-foreground">GROSS</span></span>
                        <span className="text-[10px] lg:text-xs font-bold text-emerald-700">¥{(c.finance?.oneTimeFeeTakeHome ?? Math.floor((c.finance?.oneTimeFee || 0) * 0.4)).toLocaleString()} <span className="text-[7px] lg:text-[9px] text-emerald-700">NET</span></span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col text-left lg:text-right min-w-0 lg:min-w-[120px]">
                    <span className="text-[6px] lg:text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">SPOT / スポット</span>
                    <div className="flex flex-col">
                      <span className="text-[10px] lg:text-xs font-bold text-foreground">¥{(c.finance?.spotFee || 0).toLocaleString()} <span className="text-[7px] lg:text-[9px] text-muted-foreground">GROSS</span></span>
                      <span className="text-[10px] lg:text-xs font-bold text-emerald-700">¥{Math.floor((c.finance?.spotFee || 0) * ((c.finance?.spotRate ?? 40) / 100)).toLocaleString()} <span className="text-[7px] lg:text-[9px] text-emerald-700">NET</span></span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex lg:flex items-center gap-1 lg:gap-1 shrink-0 lg:ml-auto pointer-events-auto absolute lg:relative right-2 top-2 lg:right-auto lg:top-auto z-10 bg-card/80 lg:bg-transparent p-1 lg:p-0 rounded-md backdrop-blur-md lg:backdrop-blur-none">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStatus(c.id, c.status);
                  }}
                  className={cn(
                    "h-6 w-6 lg:h-8 lg:w-8 rounded-md transition-all border border-transparent hover:border-border",
                    c.status === 'active' ? "text-emerald-700 hover:bg-emerald-500/10" : "text-blue-700 hover:bg-blue-500/10"
                  )}
                  title={c.status === 'active' ? "完了にする" : "進行中に戻す"}
                >
                  {c.status === 'active' ? <CheckCircle2 className="w-3 h-3 lg:w-4 lg:h-4" /> : <RefreshCw className="w-3 h-3 lg:w-4 lg:h-4" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={(e) => {
                    e.stopPropagation();
                    if(confirm('案件を削除しますか？')) deleteCase(c.id);
                  }}
                  className="h-6 w-6 lg:h-8 lg:w-8 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                >
                  <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                </Button>
                <div className="hidden lg:block bg-secondary p-1.5 rounded-md group-hover:bg-primary/10 transition-colors ml-1">
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-300 font-sans pb-4">
      <SideTree title="案件の絞り込み">
        <TreeItem glyph="▾" label="状態" />
        <TreeItem
          depth={1}
          label="ALL CASES すべての案件"
          badge={cases.length}
          active={initialFilter === 'all'}
          href="/cases?filter=all"
        />
        <TreeItem
          depth={1}
          label="ACTIVE 進行中の案件"
          badge={cases.filter(c => c.status === 'active').length}
          active={initialFilter === 'active'}
          href="/cases?filter=active"
        />
        <TreeItem
          depth={1}
          label="COMPLETED 完了済みの案件"
          badge={cases.filter(c => c.status === 'completed').length}
          active={initialFilter === 'completed'}
          href="/cases?filter=completed"
        />
      </SideTree>

      <div className="flex flex-col gap-3 bg-card p-4 rounded-md border border-border">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2 uppercase">
              <Briefcase className="w-5 h-5 text-primary" /> Case Repository
            </h2>
            <p className="text-[11px] font-bold text-muted-foreground mt-0.5">案件管理リポジトリ ・ プロジェクト一括管理</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto shrink-0 justify-end">
            <div className="flex items-center gap-2">
              <Select value={sortOption} onValueChange={(val: any) => setSortOption(val)}>
                <SelectTrigger className="h-10 bg-input border border-border rounded-md font-bold text-xs w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenueStartMonth">収益開始月順</SelectItem>
                  <SelectItem value="updatedAt">編集日順</SelectItem>
                  <SelectItem value="amount">累計金額順</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                className="h-10 w-10 px-0 bg-card"
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              >
                {sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </Button>
            </div>
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="案件名・法人名で検索... / SEARCH" 
                className="h-10 bg-input border border-border rounded-md pl-9 font-bold text-xs focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border pt-3">
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="flex flex-col">
              <span className="text-[8px] lg:text-[10px] font-bold text-muted-foreground uppercase tracking-wide">TOTAL CASES / 全案件数</span>
              <span className="text-lg font-bold">{cases.length}</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex flex-col">
              <span className="text-[8px] lg:text-[10px] font-bold text-emerald-700 uppercase tracking-wide">ACTIVE / 進行中</span>
              <span className="text-lg font-bold text-emerald-700">{cases.filter(c => c.status === 'active').length}</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex flex-col">
              <span className="text-[8px] lg:text-[10px] font-bold text-blue-700 uppercase tracking-wide">COMPLETED / 完了済</span>
              <span className="text-lg font-bold text-blue-700">{cases.filter(c => c.status === 'completed').length}</span>
            </div>
          </div>
          
          <Button 
            onClick={handleCreate} 
            className="h-10 px-4 bg-primary hover:brightness-110 text-primary-foreground font-bold rounded-md transition-all shrink-0 flex items-center gap-2 shadow-none"
          >
            <Plus className="w-5 h-5" />
            <span className="uppercase flex flex-col items-start leading-none">
              <span className="text-[11px] font-bold">NEW CASE</span>
              <span className="text-[8px] lg:text-[9px] font-bold opacity-80 mt-1">新規案件を作成</span>
            </span>
          </Button>
        </div>
      </div>

      {/* スマホ用タブ（PCは左のツリーに移動） */}
      <div className="lg:hidden grid grid-cols-3 gap-1 border-b border-border">
        <NavTab 
          active={initialFilter === 'all'} 
          onClick={() => router.push('/cases?filter=all')}
          icon={<LayoutGrid className="w-3.5 h-3.5" />}
          label="ALL CASES"
          subLabel="すべての案件"
          count={cases.length}
        />
        <NavTab 
          active={initialFilter === 'active'} 
          onClick={() => router.push('/cases?filter=active')}
          icon={<Clock className="w-3.5 h-3.5" />}
          label="ACTIVE"
          subLabel="進行中の案件"
          count={cases.filter(c => c.status === 'active').length}
        />
        <NavTab 
          active={initialFilter === 'completed'} 
          onClick={() => router.push('/cases?filter=completed')}
          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
          label="COMPLETED"
          subLabel="完了済みの案件"
          count={cases.filter(c => c.status === 'completed').length}
        />
      </div>

      <div className="animate-in fade-in duration-300">
        {renderCaseList(initialFilter)}
      </div>
    </div>
  );
}

function NavTab({ active, onClick, icon, label, subLabel, count }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col gap-0.5 px-2 py-2 border-b-2 transition-colors text-left min-w-0",
        active 
          ? "bg-card border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:bg-card"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-1 gap-y-0.5">
        <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase">
          <span className={cn("hidden sm:inline-flex", active ? "text-primary" : "")}>{icon}</span>
          {label}
        </span>
        <span className={cn(
          "px-1.5 py-0.5 rounded-md text-[10px] font-bold shrink-0",
          active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
        )}>
          {count}
        </span>
      </div>
      <span className="text-[9px] font-bold text-muted-foreground">{subLabel}</span>
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
