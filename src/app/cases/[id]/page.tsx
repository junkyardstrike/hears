'use client';

import { use, useState, useEffect, useMemo } from 'react';
import { useHearsStore, CaseData, ProjectData, ClientData } from '@/store/useHearsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumericInput } from '@/components/ui/numeric-input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { 
  ChevronLeft, Shield, Server, FileText, CheckCircle2, 
  Circle, Plus, Trash2, X, ExternalLink, Globe, Lock, Info,
  Layout, ListTodo, ClipboardList, TrendingUp, Wallet, Database,
  ChevronRight, Tag, Boxes, Save, Check, RefreshCw, Building2,
  DollarSign, Clock, CalendarDays, Percent
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SideTree, TreeItem } from '@/components/layout/SideTree';

const labelCls = "text-[10px] font-bold text-muted-foreground uppercase tracking-wide";
const moneyInputCls = "h-9 bg-input border border-border rounded-md font-bold text-base pl-8 pr-3 focus-visible:ring-1 focus-visible:ring-primary";

const MonthPicker = ({ value, onChange, placeholder = "月を選択" }: { value: string, onChange: (val: string) => void, placeholder?: string }) => {
  const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const options = years.flatMap(y => months.map(m => `${y}-${m.toString().padStart(2, '0')}`));
  
  return (
    <Select value={value || "none"} onValueChange={(val) => onChange(val === "none" ? "" : val)}>
      <SelectTrigger className="h-9 bg-input border border-border rounded-md font-bold text-sm px-3 focus:ring-1 focus:ring-primary">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px] rounded-md border-border bg-popover custom-scrollbar">
        <SelectItem value="none" className="font-bold py-2 text-muted-foreground">未設定</SelectItem>
        {options.map(opt => {
          const [y, m] = opt.split('-');
          return <SelectItem key={opt} value={opt} className="font-bold py-2">{`${y}年 ${parseInt(m)}月`}</SelectItem>;
        })}
      </SelectContent>
    </Select>
  );
};

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { cases, projects, clients, updateCase, globalGenres, addGenre } = useHearsStore();
  const [newGenre, setNewGenre] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  // 表示専用: ツリーで折りたたんだ取引先グループ
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const c = cases.find(item => item.id === id);
  const project = projects.find(p => p.id === c?.projectId);

  // 表示専用: 案件を取引先ごとにまとめたツリー用データ（紐づけが取れない案件は「取引先なし」）
  const treeGroups = useMemo(() => {
    const map = new Map<string, CaseData[]>();
    cases.forEach(cs => {
      const key = clients.find(cl => cl.id === cs.clientId)?.name || cs.contractEntity || cs.clientName || '';
      map.set(key, [...(map.get(key) || []), cs]);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => (a === '' ? 1 : b === '' ? -1 : a.localeCompare(b, 'ja')))
      .map(([key, items]) => ({ key, name: key || '取引先なし', items }));
  }, [cases, clients]);

  const toggleGroup = (key: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  if (!c) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center font-sans">
        <h2 className="text-2xl font-bold text-foreground mb-4">案件が見つかりません</h2>
        <Button onClick={() => router.push('/cases')} className="bg-primary text-primary-foreground font-bold rounded-md">案件一覧へ戻る</Button>
      </div>
    );
  }

  // Check if it's a Stock Type case (HP or SNS)
  const isStockType = c.genre === 'HP制作' || c.genre === 'SNS運用';

  const handleUpdate = (updater: (draft: CaseData) => void) => {
    updateCase(c.id, updater);
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  const toggleStatus = () => {
    handleUpdate(draft => {
      draft.status = draft.status === 'active' ? 'completed' : 'active';
    });
  };

  const updateTechnicalInfo = (key: keyof CaseData['technicalInfo'], val: string) => {
    handleUpdate(draft => {
      draft.technicalInfo[key] = val;
    });
  };

  const updateFinance = (key: keyof CaseData['finance'], val: any) => {
    handleUpdate(draft => {
      if (!draft.finance) draft.finance = { maintenanceFee: 0, oneTimeFee: 0, revenueStartMonth: '', spotRate: 40 };
      (draft.finance as any)[key] = val;
      
      if (key === 'oneTimeFee') {
        draft.finance.oneTimeFeeTakeHome = Math.floor(val * 0.4);
      }
    });
  };

  const handleAddGenre = () => {
    if (!newGenre.trim()) return;
    addGenre(newGenre.trim());
    handleUpdate(draft => { draft.genre = newGenre.trim(); });
    setNewGenre('');
  };

  const handleClientSelect = (clientId: string) => {
    const client = clients.find(cl => cl.id === clientId);
    if (!client) return;
    handleUpdate(draft => {
      draft.clientId = client.id;
      draft.contractEntity = client.name;
    });
  };

  const handleCreateClient = () => {
    const name = prompt('取引先法人名を入力してください', '新規契約先');
    if (name && name.trim()) {
      const newId = useHearsStore.getState().createClient(name.trim());
      handleUpdate(draft => {
        draft.clientId = newId;
        draft.contractEntity = name.trim();
      });
    }
  };

  const oneTimeTakeHome = c.finance?.oneTimeFeeTakeHome ?? Math.floor((c.finance?.oneTimeFee || 0) * 0.4);
  const spotTakeHome = Math.floor((c.finance?.spotFee || 0) * ((c.finance?.spotRate || 40) / 100));

  return (
    <div className="space-y-3 lg:space-y-4 animate-in fade-in duration-300 pb-24 font-sans">
      {/* PC: 取引先と案件のツリー（スマホでは非表示） */}
      <SideTree title="取引先と案件">
        {treeGroups.map(group => {
          const open = !collapsedGroups.has(group.key);
          return (
            <div key={group.key || '__none__'} className="flex flex-col gap-px">
              <TreeItem
                depth={0}
                glyph={open ? '▾' : '▸'}
                label={group.name}
                badge={group.items.length}
                onClick={() => toggleGroup(group.key)}
              />
              {open && group.items.map(item => (
                <TreeItem
                  key={item.id}
                  depth={1}
                  label={item.name}
                  active={item.id === c.id}
                  href={`/cases/${item.id}`}
                  badge={item.status === 'completed' ? '完了' : item.status === 'archived' ? '保管' : undefined}
                />
              ))}
            </div>
          );
        })}
      </SideTree>

      {/* ページヘッダー */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Button variant="ghost" size="icon" onClick={() => router.push('/cases')} className="text-muted-foreground hover:text-primary hover:bg-secondary border border-transparent hover:border-border rounded-md shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge className={cn(
                "px-2 py-0.5 text-[10px] font-bold rounded-md border-none shadow-none",
                c.status === 'active' ? 'bg-emerald-700/10 text-emerald-700' :
                c.status === 'completed' ? 'bg-blue-700/10 text-blue-700' :
                'bg-secondary text-muted-foreground'
              )}>
                {c.status === 'active' ? '進行中 / active' : c.status === 'completed' ? '完了 / completed' : 'アーカイブ / archived'}
              </Badge>
              <div className="flex items-center gap-1 text-[10px] font-bold text-primary">
                <Tag className="w-3 h-3" /> {c.genre || '未分類 / no category'}
              </div>
              {isSaving && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 animate-pulse">
                  <Check className="w-3 h-3" /> 保存済み
                </div>
              )}
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground break-words sm:truncate leading-tight">
              {c.name}
            </h1>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto shrink-0">
          <Button 
            onClick={toggleStatus}
            variant="outline"
            className={cn(
              "flex-1 sm:flex-none h-10 px-4 rounded-md font-bold transition-colors border",
              c.status === 'active' 
                ? "border-emerald-700/50 text-emerald-700 hover:bg-emerald-700/10" 
                : "border-blue-700/50 text-blue-700 hover:bg-blue-700/10"
            )}
          >
            {c.status === 'active' ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <div className="flex flex-col items-start leading-none text-left">
                  <span className="text-[11px] font-bold uppercase">COMPLETE</span>
                  <span className="text-[9px] opacity-70 mt-0.5">案件を完了にする</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                <div className="flex flex-col items-start leading-none text-left">
                  <span className="text-[11px] font-bold uppercase">REACTIVATE</span>
                  <span className="text-[9px] opacity-70 mt-0.5">進行中に戻す</span>
                </div>
              </div>
            )}
          </Button>
          <Button 
            onClick={() => router.push('/cases')}
            className="flex-1 sm:flex-none bg-primary hover:brightness-110 text-primary-foreground font-bold h-10 px-5 rounded-md transition-colors shadow-none"
          >
            <div className="flex flex-col items-center leading-none">
              <span className="text-[11px] uppercase font-bold">SAVE & EXIT</span>
              <span className="text-[9px] font-medium opacity-80 mt-0.5">保存して戻る</span>
            </div>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-secondary border border-border p-0.5 h-auto mb-3 w-full rounded-md flex items-stretch lg:bg-transparent lg:border-0 lg:border-b lg:rounded-none lg:p-0 lg:mb-4 lg:justify-start">
          <TabsTrigger value="overview" className="flex-1 lg:flex-none lg:px-5 h-auto py-1.5 rounded-md lg:rounded-none data-active:bg-card data-active:text-primary data-active:border-border data-active:shadow-none lg:data-active:bg-transparent lg:data-active:border-transparent lg:data-active:shadow-[inset_0_-2px_0_var(--primary)] transition-colors">
            <div className="flex flex-col items-center justify-center gap-0.5">
              <span className="text-[11px] font-bold uppercase flex items-center gap-1.5"><Layout className="w-3.5 h-3.5" /> OVERVIEW</span>
              <span className="text-[9px] font-medium opacity-70 leading-none">基本・収益</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="hearing" className="flex-1 lg:flex-none lg:px-5 h-auto py-1.5 rounded-md lg:rounded-none data-active:bg-card data-active:text-primary data-active:border-border data-active:shadow-none lg:data-active:bg-transparent lg:data-active:border-transparent lg:data-active:shadow-[inset_0_-2px_0_var(--primary)] transition-colors">
            <div className="flex flex-col items-center justify-center gap-0.5">
              <span className="text-[11px] font-bold uppercase flex items-center gap-1.5"><ClipboardList className="w-3.5 h-3.5" /> HEARING</span>
              <span className="text-[9px] font-medium opacity-70 leading-none">ヒアリング詳細</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="technical" className="flex-1 lg:flex-none lg:px-5 h-auto py-1.5 rounded-md lg:rounded-none data-active:bg-card data-active:text-primary data-active:border-border data-active:shadow-none lg:data-active:bg-transparent lg:data-active:border-transparent lg:data-active:shadow-[inset_0_-2px_0_var(--primary)] transition-colors">
            <div className="flex flex-col items-center justify-center gap-0.5">
              <span className="text-[11px] font-bold uppercase flex items-center gap-1.5"><Database className="w-3.5 h-3.5" /> TECHNICAL</span>
              <span className="text-[9px] font-medium opacity-70 leading-none">技術・サーバー</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4 items-start">
            <div className="lg:col-span-2 space-y-3 lg:space-y-4 min-w-0">
              <Card className="bg-card border border-border rounded-md overflow-hidden shadow-none ring-0 py-0 gap-0">
                <CardHeader className="px-3 py-2 border-b border-border bg-secondary/50">
                  <div className="flex flex-col">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                      <Boxes className="w-3.5 h-3.5 text-primary" /> CATEGORY & GENRE
                    </CardTitle>
                    <p className="text-[10px] font-medium text-muted-foreground opacity-70 ml-5.5">案件カテゴリ・ジャンル設定</p>
                  </div>
                </CardHeader>
                <CardContent className="p-3 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className={labelCls}>CURRENT GENRE / 現在のジャンル</label>
                      <Select 
                        value={c.genre || "none"} 
                        onValueChange={(val) => handleUpdate(draft => { draft.genre = val === "none" ? undefined : val; })}
                      >
                        <SelectTrigger className="h-9 bg-input border border-border rounded-md font-bold text-foreground px-3 focus:ring-1 focus:ring-primary">
                          <SelectValue placeholder="ジャンルを選択" />
                        </SelectTrigger>
                        <SelectContent className="rounded-md border-border bg-popover">
                          <SelectItem value="none" className="font-bold py-2 text-muted-foreground">未設定 / none</SelectItem>
                          {globalGenres.map(g => (
                            <SelectItem key={g} value={g} className="font-bold py-2">{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <label className={labelCls}>ADD NEW / 新規追加</label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="ジャンル名..." 
                          value={newGenre}
                          onChange={(e) => setNewGenre(e.target.value)}
                          className="h-9 bg-input border border-border rounded-md font-bold px-3 focus-visible:ring-1 focus-visible:ring-primary"
                        />
                        <Button onClick={handleAddGenre} size="icon" className="h-9 w-9 rounded-md shrink-0 shadow-none border border-transparent hover:border-primary/50 transition-colors">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border border-border rounded-md overflow-hidden shadow-none ring-0 py-0 gap-0">
                <CardHeader className="px-3 py-2 border-b border-border bg-secondary/50">
                  <div className="flex flex-col">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                      <Wallet className="w-3.5 h-3.5 text-primary" /> FINANCE & CONTRACT
                    </CardTitle>
                    <p className="text-[10px] font-medium text-muted-foreground opacity-70 ml-5.5">収益・契約法人管理</p>
                  </div>
                </CardHeader>
                <CardContent className="p-3 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className={labelCls}>CONTRACT ENTITY / 契約先</label>
                      <div className="flex gap-2">
                        <Select value={c.clientId || "none"} onValueChange={handleClientSelect}>
                          <SelectTrigger className="h-9 bg-input border border-border rounded-md font-bold text-foreground px-3 flex-1 min-w-0 focus:ring-1 focus:ring-primary">
                            <SelectValue placeholder="取引先を選択" />
                          </SelectTrigger>
                          <SelectContent className="rounded-md border-border bg-popover">
                            <SelectItem value="none" className="font-bold py-2 text-muted-foreground">未設定 / none</SelectItem>
                            {clients.map(cl => <SelectItem key={cl.id} value={cl.id} className="font-bold py-2">{cl.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={handleCreateClient} className="h-9 bg-secondary text-primary hover:bg-primary/10 border border-border px-3 font-bold flex items-center gap-1.5 shrink-0"><Plus className="w-4 h-4" /> 新規作成</Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className={labelCls}>REVENUE START / 収益開始月</label>
                      <MonthPicker value={c.finance?.revenueStartMonth || ''} onChange={(val) => updateFinance('revenueStartMonth', val)} />
                    </div>
                  </div>

                  {isStockType ? (
                    /* Stock Type (HP/SNS) Layout */
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      <div className="space-y-3 min-w-0">
                        <h4 className="text-[11px] font-bold text-primary uppercase flex items-center gap-2 border-b border-border pb-1.5"><Clock className="w-3.5 h-3.5" /> MAINTENANCE REVENUE / 保守運用収益</h4>
                        <div className="grid grid-cols-1 gap-3">
                          <div className="space-y-1">
                            <label className={labelCls}>MONTHLY FEE / 月額保守料 (Gross)</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-primary text-base">¥</span>
                              <NumericInput value={c.finance?.maintenanceFee || 0} onChange={(val) => updateFinance('maintenanceFee', val)} className={moneyInputCls} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className={labelCls}>NET (40%) / 保守歩合額</label>
                            <div className="h-9 bg-secondary/50 rounded-md flex items-center px-3 border border-border">
                              <span className="text-base font-bold text-emerald-700">¥{Math.floor((c.finance?.maintenanceFee || 0) * 0.4).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3 min-w-0">
                        <h4 className="text-[11px] font-bold text-blue-700 uppercase flex items-center gap-2 border-b border-border pb-1.5"><TrendingUp className="w-3.5 h-3.5" /> PRODUCTION REVENUE / 制作案件収益</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1 sm:col-span-2">
                            <label className={labelCls}>PRODUCTION FEE / 制作費 (Gross)</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-blue-700 text-base">¥</span>
                              <NumericInput value={c.finance?.oneTimeFee || 0} onChange={(val) => updateFinance('oneTimeFee', val)} className={moneyInputCls} />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-blue-700 uppercase tracking-wide">COMMISSION / 歩合額</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-emerald-700 text-base">¥</span>
                              <NumericInput value={c.finance?.oneTimeFeeTakeHome ?? Math.floor((c.finance?.oneTimeFee || 0) * 0.4)} onChange={(val) => updateFinance('oneTimeFeeTakeHome', val)} className="h-9 bg-input border border-border focus-visible:border-emerald-700/50 rounded-md font-bold text-base pl-8 pr-3 text-emerald-700 focus-visible:ring-1 focus-visible:ring-emerald-700" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-amber-700 uppercase tracking-wide flex items-center gap-1.5"><CalendarDays className="w-3 h-3" /> PAYMENT MONTH / 計上月</label>
                            <MonthPicker value={c.finance?.oneTimeFeeMonth || ''} onChange={(val) => updateFinance('oneTimeFeeMonth', val)} placeholder="未設定" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Spot Type (Other Genres) Layout */
                    <div className="space-y-3">
                      <h4 className="text-[11px] font-bold text-amber-700 uppercase flex items-center gap-2 border-b border-border pb-1.5"><TrendingUp className="w-3.5 h-3.5" /> SPOT REVENUE / スポット収益管理</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                        <div className="space-y-1 xl:col-span-2">
                          <label className={labelCls}>TOTAL AMOUNT / 案件総額 (Gross)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-amber-700 text-base">¥</span>
                            <NumericInput value={c.finance?.spotFee || 0} onChange={(val) => updateFinance('spotFee', val)} className={moneyInputCls} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className={labelCls}>TAKE-HOME RATE / 還元率 (%)</label>
                          <div className="relative">
                            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                            <NumericInput value={c.finance?.spotRate ?? 40} onChange={(val) => updateFinance('spotRate', val)} className={moneyInputCls} />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">CALCULATED NET / 歩合額</label>
                          <div className="h-9 bg-secondary/50 border border-border rounded-md flex items-center px-3">
                            <span className="text-base font-bold text-emerald-700">¥{spotTakeHome.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-amber-700 uppercase tracking-wide flex items-center gap-1.5"><CalendarDays className="w-3 h-3" /> PAYMENT MONTH / 計上月 (上書き用)</label>
                        <MonthPicker value={c.finance?.spotMonth || ''} onChange={(val) => updateFinance('spotMonth', val)} placeholder="未設定" />
                        <p className="text-[10px] font-medium text-muted-foreground opacity-70">※ 未入力の場合は「収益開始月」に計上されます</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* スマホ: 子要素を親グリッドに展開して TOTAL COMMISSION を最上段へ / PC: 右1/3の縦積み */}
            <div className="contents lg:block lg:space-y-4 lg:min-w-0">
              <Card className="order-3 lg:order-none bg-card border border-border rounded-md overflow-hidden shadow-none ring-0 py-0 gap-0 border-l-[3px] border-l-primary/60">
                <CardHeader className="px-3 py-2 border-b border-border bg-secondary/50">
                  <div className="flex flex-col"><CardTitle className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2"><Lock className="w-3.5 h-3.5 text-primary" /> ACCESS AUTH</CardTitle><p className="text-[10px] font-medium text-muted-foreground opacity-70 ml-5.5">アクセス認証情報</p></div>
                </CardHeader>
                <CardContent className="p-3 space-y-3">
                  <div className="space-y-1"><p className={labelCls}>ID & PASSWORD</p><div className="p-3 bg-secondary/50 rounded-md text-sm font-mono text-primary font-bold break-all border border-border">{c.technicalInfo.idPass || '未設定'}</div></div>
                  <div className="space-y-1"><p className={labelCls}>SERVER INFO</p><div className="p-3 bg-secondary/50 rounded-md text-sm font-mono text-foreground font-bold break-all border border-border">{c.technicalInfo.server || '未設定'}</div></div>
                </CardContent>
              </Card>

              <Card className="order-first lg:order-none bg-primary text-primary-foreground border border-primary rounded-md overflow-hidden shadow-none ring-0 py-0 gap-0">
                <CardHeader className="px-3 py-2 border-b border-primary-foreground/20">
                  <div className="flex flex-col"><CardTitle className="text-xs font-bold text-primary-foreground/80 uppercase flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5" /> TOTAL COMMISSION</CardTitle><p className="text-[10px] font-medium text-primary-foreground/70 ml-5.5">この案件の歩合額合計</p></div>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-2xl lg:text-3xl font-bold text-primary-foreground">
                      ¥{ (isStockType ? (Math.floor((c.finance?.maintenanceFee || 0) * 0.4) + oneTimeTakeHome) : spotTakeHome).toLocaleString() }
                    </span>
                    <span className="text-[10px] font-bold text-primary-foreground/80 uppercase">/ net</span>
                  </div>
                  <p className="text-[10px] font-medium text-primary-foreground/80">{isStockType ? '保守 ＋ 制作の還元合算' : `総額の ${c.finance?.spotRate ?? 40}% 還元`}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="hearing">
          {!project ? (
            <Card className="bg-card border border-border rounded-md p-8 text-center shadow-none ring-0"><ClipboardList className="w-10 h-10 text-muted-foreground mx-auto opacity-30 mb-3" /><h3 className="text-base font-bold text-foreground uppercase mb-1">NO HEARING DATA</h3><p className="text-xs font-medium text-muted-foreground opacity-70">この案件はヒアリングシートと紐付いていません。</p></Card>
          ) : (
            <div className="space-y-3 pb-12">
              <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
                <div className="flex flex-col min-w-0"><h2 className="text-base font-bold text-foreground flex items-center gap-2 uppercase"><ClipboardList className="w-5 h-5 text-primary shrink-0" /> PROJECT MASTER</h2><p className="text-[10px] font-medium text-muted-foreground opacity-70 ml-7">ヒアリング ・ プロジェクト原本データ</p></div>
                <Button variant="outline" onClick={() => router.push(`/editor/${project.id}`)} className="text-primary hover:bg-secondary h-9 px-3 rounded-md font-bold text-xs uppercase border border-border shrink-0"><span className="flex items-center gap-2">エディタで確認 <ExternalLink className="w-4 h-4" /></span></Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">{Object.entries(project.basicInfo).map(([key, value]) => (<div key={key} className="bg-card border border-border p-3 rounded-md flex flex-col gap-1 min-w-0"><span className="text-[10px] font-bold text-muted-foreground uppercase">{key}</span><div className="text-foreground font-medium text-sm leading-relaxed break-words">{value || <span className="opacity-40">---</span>}</div></div>))}</div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="technical">
          <Card className="bg-card border border-border rounded-md p-4 lg:p-5 space-y-5 shadow-none ring-0 gap-0">
            <div className="flex flex-col border-b border-border pb-3"><CardTitle className="text-base font-bold text-foreground flex items-center gap-2 uppercase"><Database className="w-5 h-5 text-primary" /> TECHNICAL INFO</CardTitle><p className="text-[10px] font-medium text-muted-foreground opacity-70 ml-7">技術構成 ・ サーバー運用情報の編集</p></div>
            <div className="space-y-4">
              <div className="space-y-1"><label className={labelCls}>PUBLIC URL / 公開用 URL ・ ドメイン</label><Input value={c.technicalInfo.url} onChange={(e) => updateTechnicalInfo('url', e.target.value)} placeholder="https://example.com" className="h-9 bg-input border border-border rounded-md font-bold text-sm px-3 focus-visible:ring-1 focus-visible:ring-primary" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1"><label className={labelCls}>ADMIN ID / 管理用 ID ・ パスワード</label><Input value={c.technicalInfo.idPass} onChange={(e) => updateTechnicalInfo('idPass', e.target.value)} className="h-9 bg-input border border-border rounded-md font-bold text-sm px-3 focus-visible:ring-1 focus-visible:ring-primary" /></div>
                <div className="space-y-1"><label className={labelCls}>SERVER / サーバー ・ FTP情報</label><Input value={c.technicalInfo.server} onChange={(e) => updateTechnicalInfo('server', e.target.value)} className="h-9 bg-input border border-border rounded-md font-bold text-sm px-3 focus-visible:ring-1 focus-visible:ring-primary" /></div>
              </div>
              <div className="space-y-1 pt-2"><label className={labelCls}>MAINTENANCE MEMO / 運用 ・ 保守メモ</label><Textarea value={c.technicalInfo.memo} onChange={(e) => updateTechnicalInfo('memo', e.target.value)} className="min-h-[200px] bg-input border border-border rounded-md p-3 text-sm font-medium leading-relaxed focus-visible:ring-1 focus-visible:ring-primary" placeholder="案件に関する特記事項..." /></div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
