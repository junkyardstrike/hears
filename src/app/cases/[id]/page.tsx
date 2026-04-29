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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center font-[family-name:var(--font-noto)]">
        <h2 className="text-2xl font-bold text-foreground mb-4">案件が見つかりません</h2>
        <Button onClick={() => router.push('/cases')} className="bg-primary text-white font-bold">案件一覧へ戻る</Button>
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

  const oneTimeTakeHome = c.finance?.oneTimeFeeTakeHome ?? Math.floor((c.finance?.oneTimeFee || 0) * 0.4);
  const spotTakeHome = Math.floor((c.finance?.spotFee || 0) * ((c.finance?.spotRate || 40) / 100));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-32 font-[family-name:var(--font-noto)]">
      {/* ページヘッダー */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-5 min-w-0 flex-1">
          <Button variant="ghost" size="icon" onClick={() => router.push('/cases')} className="text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-2xl shrink-0">
            <ChevronLeft className="w-8 h-8" />
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
            <h1 className="text-3xl sm:text-4xl font-bold italic tracking-tighter text-foreground truncate font-[family-name:var(--font-outfit)] leading-tight">
              {c.name}
            </h1>
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto shrink-0">
          <Button 
            onClick={toggleStatus}
            variant="outline"
            className={cn(
              "flex-1 sm:flex-none h-14 px-8 rounded-2xl font-bold transition-all border-2",
              c.status === 'active' 
                ? "border-emerald-500/20 text-emerald-600 hover:bg-emerald-50" 
                : "border-blue-500/20 text-blue-600 hover:bg-blue-50"
            )}
          >
            {c.status === 'active' ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <div className="flex flex-col items-start leading-none text-left">
                  <span className="text-[11px] font-black uppercase">COMPLETE</span>
                  <span className="text-[8px] opacity-60 mt-1">案件を完了にする</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                <div className="flex flex-col items-start leading-none text-left">
                  <span className="text-[11px] font-black uppercase">REACTIVATE</span>
                  <span className="text-[8px] opacity-60 mt-1">進行中に戻す</span>
                </div>
              </div>
            )}
          </Button>
          <Button 
            onClick={() => router.push('/cases')}
            className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-white font-bold h-14 px-10 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <div className="flex flex-col items-center leading-none">
              <span className="text-[11px] uppercase font-black">SAVE & EXIT</span>
              <span className="text-[8px] font-bold opacity-60 mt-1">保存して戻る</span>
            </div>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-secondary/50 border border-border p-1 h-24 mb-10 w-full rounded-[2.2rem] flex items-stretch">
          <TabsTrigger value="overview" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:paper-shadow rounded-[1.8rem] transition-all h-full py-4">
            <div className="flex flex-col items-center justify-center gap-1.5 h-full">
              <span className="text-[11px] font-black uppercase flex items-center gap-2 tracking-widest"><Layout className="w-4 h-4" /> OVERVIEW</span>
              <span className="text-[9px] font-bold opacity-60 leading-none">基本・収益</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="hearing" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:paper-shadow rounded-[1.8rem] transition-all h-full py-4">
            <div className="flex flex-col items-center justify-center gap-1.5 h-full">
              <span className="text-[11px] font-black uppercase flex items-center gap-2 tracking-widest"><ClipboardList className="w-4 h-4" /> HEARING</span>
              <span className="text-[9px] font-bold opacity-60 leading-none">ヒアリング詳細</span>
            </div>
          </TabsTrigger>
          <TabsTrigger value="technical" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:paper-shadow rounded-[1.8rem] transition-all h-full py-4">
            <div className="flex flex-col items-center justify-center gap-1.5 h-full">
              <span className="text-[11px] font-black uppercase flex items-center gap-2 tracking-widest"><Database className="w-4 h-4" /> TECHNICAL</span>
              <span className="text-[9px] font-bold opacity-60 leading-none">技術・サーバー</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              <Card className="bg-white border-none paper-shadow-lg rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <div className="flex flex-col">
                    <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-3">
                      <Boxes className="w-5 h-5 text-primary" /> CATEGORY & GENRE
                    </CardTitle>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 ml-8">案件カテゴリ・ジャンル設定</p>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-4 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">CURRENT GENRE / 現在のジャンル</label>
                      <Select 
                        value={c.genre || "none"} 
                        onValueChange={(val) => handleUpdate(draft => { draft.genre = val === "none" ? undefined : val; })}
                      >
                        <SelectTrigger className="h-16 bg-secondary/30 border-none rounded-2xl font-bold text-foreground px-6 focus:ring-0">
                          <SelectValue placeholder="ジャンルを選択" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-border paper-shadow-lg">
                          <SelectItem value="none" className="font-bold py-3 text-muted-foreground">未設定 / none</SelectItem>
                          {globalGenres.map(g => (
                            <SelectItem key={g} value={g} className="font-bold py-3">{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">ADD NEW / 新規追加</label>
                      <div className="flex gap-3">
                        <Input 
                          placeholder="ジャンル名..." 
                          value={newGenre}
                          onChange={(e) => setNewGenre(e.target.value)}
                          className="h-16 bg-secondary/30 border-none rounded-2xl font-bold px-6"
                        />
                        <Button onClick={handleAddGenre} size="icon" className="h-16 w-16 rounded-2xl shrink-0 shadow-lg hover:scale-105 active:scale-95 transition-all">
                          <Plus className="w-6 h-6" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-none paper-shadow-lg rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <div className="flex flex-col">
                    <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-3">
                      <Wallet className="w-5 h-5 text-primary" /> FINANCE & CONTRACT
                    </CardTitle>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 ml-8">収益・契約法人管理</p>
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-4 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">CONTRACT ENTITY / 契約先</label>
                      <div className="flex gap-2">
                        <Select value={c.clientId || "none"} onValueChange={handleClientSelect}>
                          <SelectTrigger className="h-16 bg-secondary/30 border-none rounded-2xl font-bold text-foreground px-6 flex-1 focus:ring-0">
                            <SelectValue placeholder="取引先を選択" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-border paper-shadow-lg">
                            <SelectItem value="none" className="font-bold py-3 text-muted-foreground">未設定 / none</SelectItem>
                            {clients.map(cl => <SelectItem key={cl.id} value={cl.id} className="font-bold py-3">{cl.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" onClick={() => router.push('/clients')} className="h-16 w-16 bg-secondary/20 rounded-2xl text-primary hover:bg-primary/5 border border-primary/10"><Building2 className="w-6 h-6" /></Button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">REVENUE START / 収益開始月</label>
                      <Input type="month" value={c.finance?.revenueStartMonth || ''} onChange={(e) => updateFinance('revenueStartMonth', e.target.value)} className="h-16 bg-secondary/30 border-none rounded-2xl font-bold text-lg px-8" />
                    </div>
                  </div>

                  {isStockType ? (
                    /* Stock Type (HP/SNS) Layout */
                    <div className="space-y-10">
                      <div className="space-y-4">
                        <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 border-b border-primary/10 pb-2"><Clock className="w-4 h-4" /> MAINTENANCE REVENUE / 保守運用収益</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">MONTHLY FEE / 月額保守料 (Gross)</label>
                            <div className="relative">
                              <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-primary text-xl font-[family-name:var(--font-outfit)]">¥</span>
                              <Input type="number" value={c.finance?.maintenanceFee || 0} onChange={(e) => updateFinance('maintenanceFee', parseInt(e.target.value) || 0)} className="h-16 bg-secondary/30 border-none rounded-2xl font-bold text-2xl pl-12 pr-6 font-[family-name:var(--font-outfit)]" />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">NET (40%) / 保守手取り額</label>
                            <div className="h-16 bg-emerald-50/50 rounded-2xl flex items-center px-8 border border-emerald-100">
                              <span className="text-2xl font-bold italic text-emerald-600 font-[family-name:var(--font-outfit)]">¥{Math.floor((c.finance?.maintenanceFee || 0) * 0.4).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-[11px] font-black text-blue-500 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-blue-500/10 pb-2"><TrendingUp className="w-4 h-4" /> PRODUCTION REVENUE / 制作案件収益</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="space-y-3">
                            <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">PRODUCTION FEE / 制作費 (Gross)</label>
                            <div className="relative">
                              <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-blue-500 text-xl font-[family-name:var(--font-outfit)]">¥</span>
                              <Input type="number" value={c.finance?.oneTimeFee || 0} onChange={(e) => updateFinance('oneTimeFee', parseInt(e.target.value) || 0)} className="h-16 bg-secondary/30 border-none rounded-2xl font-bold text-2xl pl-12 pr-6 font-[family-name:var(--font-outfit)]" />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest ml-1 font-black">TAKE-HOME / 手取り額</label>
                            <div className="relative">
                              <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-emerald-600 text-xl font-[family-name:var(--font-outfit)]">¥</span>
                              <Input type="number" value={c.finance?.oneTimeFeeTakeHome ?? Math.floor((c.finance?.oneTimeFee || 0) * 0.4)} onChange={(e) => updateFinance('oneTimeFeeTakeHome', parseInt(e.target.value) || 0)} className="h-16 bg-emerald-50 border-2 border-emerald-200 rounded-2xl font-bold text-2xl pl-12 pr-6 font-[family-name:var(--font-outfit)] text-emerald-700" />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <label className="text-[10px] font-bold text-amber-600 uppercase tracking-widest ml-1 font-black flex items-center gap-2"><CalendarDays className="w-3 h-3" /> PAYMENT MONTH / 計上月</label>
                            <Input type="month" value={c.finance?.oneTimeFeeMonth || ''} onChange={(e) => updateFinance('oneTimeFeeMonth', e.target.value)} className="h-16 bg-amber-50 border-2 border-amber-200 rounded-2xl font-bold text-lg px-6 text-amber-700" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Spot Type (Other Genres) Layout */
                    <div className="space-y-6">
                      <h4 className="text-[11px] font-black text-amber-600 uppercase tracking-[0.2em] flex items-center gap-2 border-b border-amber-600/10 pb-2"><TrendingUp className="w-4 h-4" /> SPOT REVENUE / スポット収益管理</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-3 lg:col-span-2">
                          <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">TOTAL AMOUNT / 案件総額 (Gross)</label>
                          <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-amber-600 text-xl font-[family-name:var(--font-outfit)]">¥</span>
                            <Input type="number" value={c.finance?.spotFee || 0} onChange={(e) => updateFinance('spotFee', parseInt(e.target.value) || 0)} className="h-16 bg-secondary/30 border-none rounded-2xl font-bold text-2xl pl-12 pr-6 font-[family-name:var(--font-outfit)]" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest ml-1">TAKE-HOME RATE / 還元率 (%)</label>
                          <div className="relative">
                            <Percent className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                            <Input type="number" value={c.finance?.spotRate ?? 40} onChange={(e) => updateFinance('spotRate', parseInt(e.target.value) || 0)} className="h-16 bg-secondary/30 border-none rounded-2xl font-bold text-2xl pl-14 pr-6 font-[family-name:var(--font-outfit)]" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest ml-1 font-black">CALCULATED NET / 手取り額</label>
                          <div className="h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center px-8">
                            <span className="text-2xl font-bold italic text-emerald-600 font-[family-name:var(--font-outfit)]">¥{spotTakeHome.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-amber-600 uppercase tracking-widest ml-1 font-black flex items-center gap-2"><CalendarDays className="w-3 h-3" /> PAYMENT MONTH / 計上月 (上書き用)</label>
                        <Input type="month" value={c.finance?.spotMonth || ''} onChange={(e) => updateFinance('spotMonth', e.target.value)} className="h-16 bg-amber-50 border-2 border-amber-200 rounded-2xl font-bold text-lg px-8 text-amber-700" />
                        <p className="text-[9px] font-bold text-muted-foreground opacity-40 uppercase tracking-widest ml-1">※ 未入力の場合は「収益開始月」に計上されます</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-10">
              <Card className="bg-white border-none paper-shadow-lg rounded-[2.5rem] overflow-hidden border-l-[10px] border-l-blue-500/20">
                <CardHeader className="p-8 pb-4">
                  <div className="flex flex-col"><CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-3"><Lock className="w-5 h-5 text-blue-500" /> ACCESS AUTH</CardTitle><p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 ml-8">アクセス認証情報</p></div>
                </CardHeader>
                <CardContent className="p-8 pt-4 space-y-6">
                  <div className="space-y-2"><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 ml-1">ID & PASSWORD</p><div className="p-5 bg-secondary/50 rounded-2xl text-sm font-mono text-blue-600 font-bold break-all border border-blue-500/5">{c.technicalInfo.idPass || '未設定'}</div></div>
                  <div className="space-y-2"><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 ml-1">SERVER INFO</p><div className="p-5 bg-secondary/50 rounded-2xl text-sm font-mono text-foreground font-bold break-all border border-border/5">{c.technicalInfo.server || '未設定'}</div></div>
                </CardContent>
              </Card>

              <Card className="bg-white border-none paper-shadow-lg rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 pb-4">
                  <div className="flex flex-col"><CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-3"><TrendingUp className="w-5 h-5 text-emerald-500" /> TOTAL TAKE-HOME</CardTitle><p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 ml-8">この案件の手取り額合計</p></div>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold italic font-[family-name:var(--font-outfit)] text-emerald-600">
                      ¥{ (isStockType ? (Math.floor((c.finance?.maintenanceFee || 0) * 0.4) + oneTimeTakeHome) : spotTakeHome).toLocaleString() }
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">/ net</span>
                  </div>
                  <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest opacity-50">{isStockType ? '保守 ＋ 制作の還元合算' : `総額の ${c.finance?.spotRate ?? 40}% 還元`}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="hearing" className="animate-in fade-in duration-500">
          {!project ? (
            <Card className="bg-white border-none paper-shadow-lg rounded-[2.5rem] p-24 text-center"><ClipboardList className="w-16 h-16 text-muted-foreground mx-auto opacity-10 mb-6" /><h3 className="text-xl font-bold italic tracking-tighter text-foreground uppercase mb-2">NO HEARING DATA</h3><p className="text-xs font-semibold text-muted-foreground opacity-60">この案件はヒアリングシートと紐付いていません。</p></Card>
          ) : (
            <div className="space-y-8 pb-20">
              <div className="flex items-center justify-between px-4">
                <div className="flex flex-col"><h2 className="text-2xl font-bold italic tracking-tighter text-foreground flex items-center gap-4 uppercase font-[family-name:var(--font-outfit)]"><ClipboardList className="w-8 h-8 text-primary" /> PROJECT MASTER</h2><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 ml-12">ヒアリング ・ プロジェクト原本データ</p></div>
                <Button variant="ghost" onClick={() => router.push(`/editor/${project.id}`)} className="text-primary hover:bg-primary/5 h-12 px-6 rounded-2xl font-bold text-xs uppercase tracking-widest border border-primary/20"><span className="flex flex-col items-end leading-none"><span className="text-[11px] font-black uppercase">OPEN EDITOR</span><span className="text-[8px] font-bold opacity-60 mt-1">エディタで詳細を確認</span></span><ExternalLink className="ml-3 w-4 h-4" /></Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{Object.entries(project.basicInfo).map(([key, value]) => (<div key={key} className="bg-white p-6 rounded-[2rem] paper-shadow flex flex-col gap-2 min-w-0"><span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-1">{key}</span><div className="text-[#2D3436] font-bold text-base leading-relaxed break-words">{value || <span className="opacity-20 italic">---</span>}</div></div>))}</div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="technical" className="space-y-10 animate-in fade-in duration-500">
          <Card className="bg-white border-none paper-shadow-lg rounded-[3rem] p-10 space-y-10">
            <div className="flex flex-col"><CardTitle className="text-2xl font-bold italic tracking-tighter text-foreground flex items-center gap-4 uppercase font-[family-name:var(--font-outfit)]"><Database className="w-8 h-8 text-blue-500" /> TECHNICAL INFO</CardTitle><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 ml-12">技術構成 ・ サーバー運用情報の編集</p></div>
            <div className="space-y-8">
              <div className="space-y-3"><label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-40 ml-1">PUBLIC URL / 公開用 URL ・ ドメイン</label><Input value={c.technicalInfo.url} onChange={(e) => updateTechnicalInfo('url', e.target.value)} placeholder="https://example.com" className="h-16 bg-secondary/30 border-none rounded-2xl font-bold text-lg px-8" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3"><label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-40 ml-1">ADMIN ID / 管理用 ID ・ パスワード</label><Input value={c.technicalInfo.idPass} onChange={(e) => updateTechnicalInfo('idPass', e.target.value)} className="h-16 bg-secondary/30 border-none rounded-2xl font-bold text-lg px-8" /></div>
                <div className="space-y-3"><label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-40 ml-1">SERVER / サーバー ・ FTP情報</label><Input value={c.technicalInfo.server} onChange={(e) => updateTechnicalInfo('server', e.target.value)} className="h-16 bg-secondary/30 border-none rounded-2xl font-bold text-lg px-8" /></div>
              </div>
              <div className="space-y-3 pt-6"><label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-40 ml-1">MAINTENANCE MEMO / 運用 ・ 保守メモ</label><Textarea value={c.technicalInfo.memo} onChange={(e) => updateTechnicalInfo('memo', e.target.value)} className="min-h-[300px] bg-secondary/30 border-none rounded-[2rem] p-10 text-lg font-semibold leading-relaxed" placeholder="案件に関する特記事項..." /></div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
