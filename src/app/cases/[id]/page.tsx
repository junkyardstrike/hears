'use client';

import { use, useState, useEffect } from 'react';
import { useHearsStore, CaseData, ProjectData, ClientData } from '@/store/useHearsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const MonthPicker = ({ value, onChange, placeholder = "月を選択" }: { value: string, onChange: (val: string) => void, placeholder?: string }) => {
  const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const options = years.flatMap(y => months.map(m => `${y}-${m.toString().padStart(2, '0')}`));
  
  return (
    <Select value={value || "none"} onValueChange={(val) => onChange(val === "none" ? "" : val)}>
      <SelectTrigger className="h-12 bg-input border border-border rounded-md font-bold text-base px-4 focus:ring-1 focus:ring-primary">
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

  const c = cases.find(item => item.id === id);
  const project = projects.find(p => p.id === c?.projectId);

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
    <div className="space-y-8 animate-in fade-in duration-500 pb-32 font-sans">
      {/* ページヘッダー */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-5 min-w-0 flex-1">
          <Button variant="ghost" size="icon" onClick={() => router.push('/cases')} className="text-muted-foreground hover:text-primary hover:bg-secondary border border-transparent hover:border-border rounded-md shrink-0">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <Badge className={cn(
                "px-3 py-1 text-[10px] font-bold tracking-widest rounded-lg border-none shadow-sm",
                c.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' :
                c.status === 'completed' ? 'bg-blue-500/10 text-blue-600' :
                'bg-zinc-100 text-zinc-500'
              )}>
                {c.status === 'active' ? '進行中 / active' : c.status === 'completed' ? '完了 / completed' : 'アーカイブ / archived'}
              </Badge>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary tracking-widest">
                <Tag className="w-3.5 h-3.5" /> {c.genre || '未分類 / no category'}
              </div>
              {isSaving && (
                <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 animate-pulse">
                  <Check className="w-3 h-3" /> 保存済み
                </div>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground truncate leading-tight">
              {c.name}
            </h1>
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto shrink-0">
          <Button 
            onClick={toggleStatus}
            variant="outline"
            className={cn(
              "flex-1 sm:flex-none h-12 px-6 rounded-md font-bold transition-all border",
              c.status === 'active' 
                ? "border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10" 
                : "border-blue-500/50 text-blue-500 hover:bg-blue-500/10"
            )}
          >
            {c.status === 'active' ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <div className="flex flex-col items-start leading-none text-left">
                  <span className="text-[11px] font-bold uppercase">COMPLETE</span>
                  <span className="text-[8px] opacity-60 mt-1">案件を完了にする</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                <div className="flex flex-col items-start leading-none text-left">
                  <span className="text-[11px] font-bold uppercase">REACTIVATE</span>
                  <span className="text-[8px] opacity-60 mt-1">進行中に戻す</span>
                </div>
              </div>
            )}
          </Button>
          <Button 
            onClick={() => router.push('/cases')}
            className="flex-1 sm:flex-none bg-primary hover:brightness-110 text-primary-foreground font-bold h-12 px-8 rounded-md transition-all active:scale-95 shadow-none"
          >
            <div className="flex flex-col items-center leading-none">
              <span className="text-[11px] uppercase font-bold">SAVE & EXIT</span>
              <span className="text-[8px] font-medium opacity-80 mt-1">保存して戻る</span>
            </div>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-secondary border border-border p-1 h-20 mb-10 w-full rounded-lg flex items-stretch">
          <TabsTrigger value="overview" className="flex-1 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-border rounded-md transition-all h-full py-2">
            <div className="flex flex-col items-center justify-center gap-1.5 h-full">
              <span className="text-[11px] font-bold uppercase flex items-center gap-2 tracking-widest"><Layout className="w-4 h-4" /> OVERVIEW</span>
              <span className="text-[9px] font-medium opacity-60 leading-none">基本・収益</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="hearing" className="flex-1 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-border rounded-md transition-all h-full py-2">
            <div className="flex flex-col items-center justify-center gap-1.5 h-full">
              <span className="text-[11px] font-bold uppercase flex items-center gap-2 tracking-widest"><ClipboardList className="w-4 h-4" /> HEARING</span>
              <span className="text-[9px] font-medium opacity-60 leading-none">ヒアリング詳細</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="technical" className="flex-1 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-border rounded-md transition-all h-full py-2">
            <div className="flex flex-col items-center justify-center gap-1.5 h-full">
              <span className="text-[11px] font-bold uppercase flex items-center gap-2 tracking-widest"><Database className="w-4 h-4" /> TECHNICAL</span>
              <span className="text-[9px] font-medium opacity-60 leading-none">技術・サーバー</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              <Card className="bg-card border border-border rounded-lg overflow-hidden shadow-none">
                <CardHeader className="p-6 pb-4 border-b border-border/50 bg-secondary/50">
                  <div className="flex flex-col">
                    <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-3">
                      <Boxes className="w-4 h-4 text-primary" /> CATEGORY & GENRE
                    </CardTitle>
                    <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest opacity-60 ml-7">案件カテゴリ・ジャンル設定</p>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">CURRENT GENRE / 現在のジャンル</label>
                      <Select 
                        value={c.genre || "none"} 
                        onValueChange={(val) => handleUpdate(draft => { draft.genre = val === "none" ? undefined : val; })}
                      >
                        <SelectTrigger className="h-12 bg-input border border-border rounded-md font-bold text-foreground px-4 focus:ring-1 focus:ring-primary">
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
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">ADD NEW / 新規追加</label>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="ジャンル名..." 
                          value={newGenre}
                          onChange={(e) => setNewGenre(e.target.value)}
                          className="h-12 bg-input border border-border rounded-md font-bold px-4 focus-visible:ring-1 focus-visible:ring-primary"
                        />
                        <Button onClick={handleAddGenre} size="icon" className="h-12 w-12 rounded-md shrink-0 shadow-none border border-transparent hover:border-primary/50 active:scale-95 transition-all">
                          <Plus className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border border-border rounded-lg overflow-hidden shadow-none">
                <CardHeader className="p-6 pb-4 border-b border-border/50 bg-secondary/50">
                  <div className="flex flex-col">
                    <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-3">
                      <Wallet className="w-4 h-4 text-primary" /> FINANCE & CONTRACT
                    </CardTitle>
                    <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest opacity-60 ml-7">収益・契約法人管理</p>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-6 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">CONTRACT ENTITY / 契約先</label>
                      <div className="flex gap-2">
                        <Select value={c.clientId || "none"} onValueChange={handleClientSelect}>
                          <SelectTrigger className="h-12 bg-input border border-border rounded-md font-bold text-foreground px-4 flex-1 focus:ring-1 focus:ring-primary">
                            <SelectValue placeholder="取引先を選択" />
                          </SelectTrigger>
                          <SelectContent className="rounded-md border-border bg-popover">
                            <SelectItem value="none" className="font-bold py-2 text-muted-foreground">未設定 / none</SelectItem>
                            {clients.map(cl => <SelectItem key={cl.id} value={cl.id} className="font-bold py-2">{cl.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={handleCreateClient} className="h-12 bg-secondary text-primary hover:bg-primary/10 border border-border px-4 font-bold flex items-center gap-2 shrink-0"><Plus className="w-4 h-4" /> 新規作成</Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">REVENUE START / 収益開始月</label>
                      <MonthPicker value={c.finance?.revenueStartMonth || ''} onChange={(val) => updateFinance('revenueStartMonth', val)} />
                    </div>
                  </div>

                  {isStockType ? (
                    /* Stock Type (HP/SNS) Layout */
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <h4 className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2 border-b border-primary/20 pb-2"><Clock className="w-4 h-4" /> MAINTENANCE REVENUE / 保守運用収益</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">MONTHLY FEE / 月額保守料 (Gross)</label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-primary text-lg">¥</span>
                              <Input type="number" value={c.finance?.maintenanceFee || 0} onChange={(e) => updateFinance('maintenanceFee', parseInt(e.target.value) || 0)} className="h-12 bg-input border border-border rounded-md font-bold text-xl pl-10 pr-4 focus-visible:ring-1 focus-visible:ring-primary" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">NET (40%) / 保守手取り額</label>
                            <div className="h-12 bg-secondary/50 rounded-md flex items-center px-4 border border-border">
                              <span className="text-xl font-bold text-emerald-500">¥{Math.floor((c.finance?.maintenanceFee || 0) * 0.4).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-[11px] font-bold text-blue-500 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-blue-500/20 pb-2"><TrendingUp className="w-4 h-4" /> PRODUCTION REVENUE / 制作案件収益</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">PRODUCTION FEE / 制作費 (Gross)</label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-blue-500 text-lg">¥</span>
                              <Input type="number" value={c.finance?.oneTimeFee || 0} onChange={(e) => updateFinance('oneTimeFee', parseInt(e.target.value) || 0)} className="h-12 bg-input border border-border rounded-md font-bold text-xl pl-10 pr-4 focus-visible:ring-1 focus-visible:ring-primary" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest ml-1">TAKE-HOME / 手取り額</label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-emerald-500 text-lg">¥</span>
                              <Input type="number" value={c.finance?.oneTimeFeeTakeHome ?? Math.floor((c.finance?.oneTimeFee || 0) * 0.4)} onChange={(e) => updateFinance('oneTimeFeeTakeHome', parseInt(e.target.value) || 0)} className="h-12 bg-input border border-border focus-visible:border-emerald-500/50 rounded-md font-bold text-xl pl-10 pr-4 text-emerald-500 focus-visible:ring-1 focus-visible:ring-emerald-500" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-amber-500 uppercase tracking-widest ml-1 flex items-center gap-2"><CalendarDays className="w-3 h-3" /> PAYMENT MONTH / 計上月</label>
                            <MonthPicker value={c.finance?.oneTimeFeeMonth || ''} onChange={(val) => updateFinance('oneTimeFeeMonth', val)} placeholder="未設定" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Spot Type (Other Genres) Layout */
                    <div className="space-y-6">
                      <h4 className="text-[11px] font-bold text-amber-500 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-amber-500/20 pb-2"><TrendingUp className="w-4 h-4" /> SPOT REVENUE / スポット収益管理</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2 lg:col-span-2">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">TOTAL AMOUNT / 案件総額 (Gross)</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-amber-500 text-lg">¥</span>
                            <Input type="number" value={c.finance?.spotFee || 0} onChange={(e) => updateFinance('spotFee', parseInt(e.target.value) || 0)} className="h-12 bg-input border border-border rounded-md font-bold text-xl pl-10 pr-4 focus-visible:ring-1 focus-visible:ring-primary" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">TAKE-HOME RATE / 還元率 (%)</label>
                          <div className="relative">
                            <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                            <Input type="number" value={c.finance?.spotRate ?? 40} onChange={(e) => updateFinance('spotRate', parseInt(e.target.value) || 0)} className="h-12 bg-input border border-border rounded-md font-bold text-xl pl-10 pr-4 focus-visible:ring-1 focus-visible:ring-primary" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest ml-1">CALCULATED NET / 手取り額</label>
                          <div className="h-12 bg-secondary/50 border border-border rounded-md flex items-center px-4">
                            <span className="text-xl font-bold text-emerald-500">¥{spotTakeHome.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-amber-500 uppercase tracking-widest ml-1 flex items-center gap-2"><CalendarDays className="w-3 h-3" /> PAYMENT MONTH / 計上月 (上書き用)</label>
                        <MonthPicker value={c.finance?.spotMonth || ''} onChange={(val) => updateFinance('spotMonth', val)} placeholder="未設定" />
                        <p className="text-[9px] font-medium text-muted-foreground opacity-60 uppercase tracking-widest ml-1">※ 未入力の場合は「収益開始月」に計上されます</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-10">
              <Card className="bg-card border border-border rounded-lg overflow-hidden shadow-none border-l-[4px] border-l-blue-500/50">
                <CardHeader className="p-6 pb-4 border-b border-border/50 bg-secondary/50">
                  <div className="flex flex-col"><CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-3"><Lock className="w-4 h-4 text-blue-500" /> ACCESS AUTH</CardTitle><p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest opacity-60 ml-7">アクセス認証情報</p></div>
                </CardHeader>
                <CardContent className="p-6 pt-6 space-y-4">
                  <div className="space-y-2"><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">ID & PASSWORD</p><div className="p-4 bg-secondary/50 rounded-md text-sm font-mono text-blue-500 font-bold break-all border border-border">{c.technicalInfo.idPass || '未設定'}</div></div>
                  <div className="space-y-2"><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">SERVER INFO</p><div className="p-4 bg-secondary/50 rounded-md text-sm font-mono text-foreground font-bold break-all border border-border">{c.technicalInfo.server || '未設定'}</div></div>
                </CardContent>
              </Card>

              <Card className="bg-card border border-border rounded-lg overflow-hidden shadow-none">
                <CardHeader className="p-6 pb-4 border-b border-border/50 bg-secondary/50">
                  <div className="flex flex-col"><CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-3"><TrendingUp className="w-4 h-4 text-emerald-500" /> TOTAL TAKE-HOME</CardTitle><p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest opacity-60 ml-7">この案件の手取り額合計</p></div>
                </CardHeader>
                <CardContent className="p-6 pt-6">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold tracking-tight text-emerald-500">
                      ¥{ (isStockType ? (Math.floor((c.finance?.maintenanceFee || 0) * 0.4) + oneTimeTakeHome) : spotTakeHome).toLocaleString() }
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">/ net</span>
                  </div>
                  <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest opacity-60">{isStockType ? '保守 ＋ 制作の還元合算' : `総額の ${c.finance?.spotRate ?? 40}% 還元`}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="hearing" className="animate-in fade-in duration-500">
          {!project ? (
            <Card className="bg-card border border-border rounded-lg p-16 text-center shadow-none"><ClipboardList className="w-12 h-12 text-muted-foreground mx-auto opacity-20 mb-4" /><h3 className="text-xl font-bold tracking-tight text-foreground uppercase mb-2">NO HEARING DATA</h3><p className="text-xs font-medium text-muted-foreground opacity-60">この案件はヒアリングシートと紐付いていません。</p></Card>
          ) : (
            <div className="space-y-6 pb-20">
              <div className="flex items-center justify-between px-2 border-b border-border/50 pb-4">
                <div className="flex flex-col"><h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3 uppercase"><ClipboardList className="w-6 h-6 text-primary" /> PROJECT MASTER</h2><p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest opacity-60 ml-9">ヒアリング ・ プロジェクト原本データ</p></div>
                <Button variant="outline" onClick={() => router.push(`/editor/${project.id}`)} className="text-primary hover:bg-secondary h-10 px-4 rounded-md font-bold text-xs uppercase tracking-widest border border-border"><span className="flex items-center gap-2">エディタで確認 <ExternalLink className="w-4 h-4" /></span></Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{Object.entries(project.basicInfo).map(([key, value]) => (<div key={key} className="bg-card border border-border p-5 rounded-md flex flex-col gap-2 min-w-0"><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{key}</span><div className="text-foreground font-medium text-sm leading-relaxed break-words">{value || <span className="opacity-40 italic">---</span>}</div></div>))}</div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="technical" className="space-y-10 animate-in fade-in duration-500">
          <Card className="bg-card border border-border rounded-lg p-6 lg:p-8 space-y-8 shadow-none">
            <div className="flex flex-col border-b border-border/50 pb-4"><CardTitle className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3 uppercase"><Database className="w-6 h-6 text-blue-500" /> TECHNICAL INFO</CardTitle><p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest opacity-60 ml-9">技術構成 ・ サーバー運用情報の編集</p></div>
            <div className="space-y-6">
              <div className="space-y-2"><label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">PUBLIC URL / 公開用 URL ・ ドメイン</label><Input value={c.technicalInfo.url} onChange={(e) => updateTechnicalInfo('url', e.target.value)} placeholder="https://example.com" className="h-12 bg-input border border-border rounded-md font-bold text-base px-4 focus-visible:ring-1 focus-visible:ring-primary" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">ADMIN ID / 管理用 ID ・ パスワード</label><Input value={c.technicalInfo.idPass} onChange={(e) => updateTechnicalInfo('idPass', e.target.value)} className="h-12 bg-input border border-border rounded-md font-bold text-base px-4 focus-visible:ring-1 focus-visible:ring-primary" /></div>
                <div className="space-y-2"><label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">SERVER / サーバー ・ FTP情報</label><Input value={c.technicalInfo.server} onChange={(e) => updateTechnicalInfo('server', e.target.value)} className="h-12 bg-input border border-border rounded-md font-bold text-base px-4 focus-visible:ring-1 focus-visible:ring-primary" /></div>
              </div>
              <div className="space-y-2 pt-4"><label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">MAINTENANCE MEMO / 運用 ・ 保守メモ</label><Textarea value={c.technicalInfo.memo} onChange={(e) => updateTechnicalInfo('memo', e.target.value)} className="min-h-[200px] bg-input border border-border rounded-md p-4 text-sm font-medium leading-relaxed focus-visible:ring-1 focus-visible:ring-primary" placeholder="案件に関する特記事項..." /></div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
