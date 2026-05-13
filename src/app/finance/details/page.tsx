'use client';

import { useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useHearsStore } from '@/store/useHearsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ChevronLeft, Wallet, ArrowUpRight, TrendingUp, Calendar, 
  Landmark, Activity, Briefcase, FileText, LayoutGrid, List,
  ChevronRight, CalendarDays, Percent, Settings2, Check
} from 'lucide-react';
import { format, parseISO, isAfter, startOfMonth, getYear, getMonth, addMonths, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';

function FinanceDetailsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cases, globalFinance, updateGlobalFinance } = useHearsStore();

  const mode = searchParams.get('mode') || 'month';
  const yearParam = parseInt(searchParams.get('year') || '') || new Date().getFullYear();
  const monthParam = parseInt(searchParams.get('month') || '') || (new Date().getMonth() + 1);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const currentDate = new Date(yearParam, monthParam - 1, 1);
    const newDate = direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1);
    router.push(`/finance/details?mode=month&year=${newDate.getFullYear()}&month=${newDate.getMonth() + 1}`);
  };

  const handleUpdateBaseSalary = (monthStr: string, amount: number) => {
    updateGlobalFinance((f) => {
      if (!f.baseSalaryOverrides) f.baseSalaryOverrides = {};
      f.baseSalaryOverrides[monthStr] = amount;
    });
  };

  const isGross = mode === 'gross';

  const { items, groupedItems, totalTakeHome, baseSalaryTotal } = useMemo(() => {
    const defaultBaseSalary = globalFinance?.baseSalary || 0;
    const overrides = globalFinance?.baseSalaryOverrides || {};
    const now = new Date();
    
    let earliestDate = now;
    if (mode === 'gross') {
      cases.forEach(c => {
        if (c.finance?.revenueStartMonth) {
          const d = parseISO(`${c.finance.revenueStartMonth}-01`);
          if (d < earliestDate) earliestDate = d;
        }
        if (c.finance?.oneTimeFeeMonth) {
          const d = parseISO(`${c.finance.oneTimeFeeMonth}-01`);
          if (d < earliestDate) earliestDate = d;
        }
        if (c.finance?.spotMonth) {
          const d = parseISO(`${c.finance.spotMonth}-01`);
          if (d < earliestDate) earliestDate = d;
        }
      });
    }

    const monthsToCalculateStr: string[] = [];
    if (mode === 'gross') {
      let currentD = earliestDate;
      const endD = startOfMonth(now);
      while (currentD <= endD) {
        monthsToCalculateStr.push(format(currentD, 'yyyy-MM'));
        currentD = addMonths(currentD, 1);
      }
    } else if (mode === 'year') {
      for (let i = 1; i <= 12; i++) monthsToCalculateStr.push(`${yearParam}-${i.toString().padStart(2, '0')}`);
    } else {
      monthsToCalculateStr.push(`${yearParam}-${monthParam.toString().padStart(2, '0')}`);
    }

    const results: any[] = [];
    const grouped: Record<string, any[]> = {};
    let totalStock = 0;
    let totalShot = 0;
    let combinedBaseSalaryTotal = 0;

    monthsToCalculateStr.forEach(mStr => {
      const dMonth = parseISO(`${mStr}-01`);
      const y = dMonth.getFullYear();
      const isFuture = y > now.getFullYear() || (y === now.getFullYear() && isAfter(startOfMonth(dMonth), startOfMonth(now)));
      
      if ((mode === 'year' || mode === 'gross') && isFuture) return; 
      
      const monthLabel = mode === 'gross' ? format(dMonth, 'yyyy年M月') : `${dMonth.getMonth() + 1}月`;
      if (!grouped[monthLabel]) grouped[monthLabel] = [];

      // Get specific base salary for this month
      const currentBaseSalary = overrides[mStr] !== undefined ? overrides[mStr] : defaultBaseSalary;
      if (!isGross) {
        combinedBaseSalaryTotal += currentBaseSalary;
      }

      cases.forEach(c => {
        if (!c.finance) return;
        const isStockType = c.genre === 'HP制作' || c.genre === 'SNS運用';
        const start = c.finance.revenueStartMonth;
        if (!start) return;

        if (isStockType) {
          const recognitionMonth = c.finance.oneTimeFeeMonth || start;
          if (recognitionMonth === mStr) {
            const takeHome = c.finance.oneTimeFeeTakeHome ?? Math.floor((c.finance.oneTimeFee || 0) * 0.4);
            const gross = c.finance.oneTimeFee || 0;
            const amount = isGross ? gross : takeHome;
            const item = { id: `${c.id}-shot-${mStr}`, caseId: c.id, caseName: c.name, client: c.contractEntity || '未設定', type: '制作費 (SHOT)', amount, date: `${mStr} 計上`, isStock: false, gross, isManualRecognized: !!c.finance.oneTimeFeeMonth, monthLabel };
            results.push(item); grouped[monthLabel].push(item); totalShot += amount;
          }
          if (mStr === start || isAfter(dMonth, parseISO(start))) {
            const fee = c.finance.maintenanceFee || 0;
            const takeHome = Math.floor(fee * 0.4);
            const amount = isGross ? fee : takeHome;
            const item = { id: `${c.id}-stock-${mStr}`, caseId: c.id, caseName: c.name, client: c.contractEntity || '未設定', type: '保守還元 (STOCK)', amount, date: `${mStr}分`, isStock: true, gross: fee, monthLabel };
            results.push(item); grouped[monthLabel].push(item); totalStock += amount;
          }
        } else {
          const recognitionMonth = c.finance.spotMonth || start;
          if (recognitionMonth === mStr) {
            const rate = c.finance.spotRate ?? 40;
            const takeHome = Math.floor((c.finance.spotFee || 0) * (rate / 100));
            const gross = c.finance.spotFee || 0;
            const amount = isGross ? gross : takeHome;
            const item = { id: `${c.id}-spot-${mStr}`, caseId: c.id, caseName: c.name, client: c.contractEntity || '未設定', type: 'スポット収益', amount, date: `${mStr} 計上`, isStock: false, gross, isManualRecognized: !!c.finance.spotMonth, rate, monthLabel };
            results.push(item); grouped[monthLabel].push(item); totalShot += amount;
          }
        }
      });
      
      if (!isGross) {
        grouped[monthLabel].push({ 
          id: `base-salary-${mStr}`, 
          caseName: '基本給', 
          client: 'SYSTEM', 
          type: '固定給', 
          amount: currentBaseSalary, 
          date: `${mStr}分`, 
          isStock: true, 
          isBase: true, 
          monthLabel,
          monthStr: mStr,
          isOverridden: overrides[mStr] !== undefined
        });
      }
    });

    return { items: results.sort((a, b) => b.amount - a.amount), groupedItems: grouped, totalTakeHome: totalStock + totalShot + combinedBaseSalaryTotal, baseSalaryTotal: combinedBaseSalaryTotal };
  }, [cases, globalFinance, mode, yearParam, monthParam, isGross]);

  const pageTitle = mode === 'gross' ? `${yearParam}年度 法人総売上内訳` : mode === 'year' ? `${yearParam}年度 累計実績内訳` : `${yearParam}年 ${monthParam}月度 内訳`;
  const pageSubTitle = mode === 'gross' ? 'YEARLY GROSS REVENUE BREAKDOWN' : mode === 'year' ? 'YEARLY CUMULATIVE REVENUE BREAKDOWN' : 'MONTHLY ESTIMATED REVENUE BREAKDOWN';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-card p-8 rounded-lg border border-border gap-6">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.push('/finance')} className="text-muted-foreground hover:text-primary rounded-md shrink-0"><ChevronLeft className="w-8 h-8" /></Button>
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">{pageTitle}</h1>
              {mode === 'month' && (<div className="flex items-center bg-input p-1 rounded-md border border-border"><Button variant="ghost" size="icon" onClick={() => navigateMonth('prev')} className="h-8 w-8 hover:bg-secondary hover:text-primary rounded-md"><ChevronLeft className="w-4 h-4" /></Button><span className="px-3 text-[10px] font-bold">{monthParam}月</span><Button variant="ghost" size="icon" onClick={() => navigateMonth('next')} className="h-8 w-8 hover:bg-secondary hover:text-primary rounded-md"><ChevronRight className="w-4 h-4" /></Button></div>)}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-40">{pageSubTitle}</p>
          </div>
        </div>
        <div className="text-right"><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 block mb-1">{mode === 'gross' ? 'TOTAL GROSS REVENUE / 法人総売上' : 'TOTAL TAKE-HOME / 合計手取り額'}</span><span className="text-4xl font-bold tracking-tight text-primary">¥{totalTakeHome.toLocaleString()}</span></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card className="bg-card border border-border rounded-lg overflow-hidden shadow-none">
            <CardHeader className="p-6 pb-4 border-b border-border/50 bg-secondary/50"><CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-3"><Activity className="w-4 h-4 text-primary" /> REVENUE SUMMARY</CardTitle></CardHeader>
            {mode === 'gross' ? (
              <CardContent className="p-6 pt-6 space-y-6">
                <SummaryItem label="案件売上合計 (100%)" value={`¥${totalTakeHome.toLocaleString()}`} sub="GROSS REVENUE TOTAL" color="text-indigo-500" isLarge />
              </CardContent>
            ) : (
              <CardContent className="p-6 pt-6 space-y-6"><SummaryItem label="基本給 (計上分)" value={`¥${baseSalaryTotal.toLocaleString()}`} sub="BASE SALARY TOTAL" color="text-muted-foreground" /><SummaryItem label="案件手取り合計" value={`¥${(totalTakeHome - baseSalaryTotal).toLocaleString()}`} sub="CASE REVENUE TOTAL" color="text-emerald-500" /><div className="pt-4 border-t border-dashed border-border"><SummaryItem label="総合計額" value={`¥${totalTakeHome.toLocaleString()}`} sub="GRAND TOTAL" color="text-primary" isLarge /></div></CardContent>
            )}
          </Card>
          <Card className="bg-card border border-border rounded-lg overflow-hidden shadow-none p-6"><div className="flex items-center gap-4 text-amber-500 mb-4"><Landmark className="w-6 h-6" /><span className="text-[10px] font-bold uppercase tracking-widest leading-tight">計算ルール<br/><span className="opacity-60 text-[8px]">REVENUE RULE</span></span></div><p className="text-xs font-bold text-muted-foreground leading-relaxed">基本給は内訳から直接編集して月ごとに調整可能です。案件の収益計算は各還元率に基づきます。</p></Card>
        </div>
        <div className="lg:col-span-2 space-y-8">
          {(mode === 'year' || mode === 'gross') ? (Object.entries(groupedItems).reverse().map(([month, monthItems]) => (
            <div key={month} className="space-y-4">
              <div className="flex items-center gap-4 px-4"><Badge className="bg-primary/20 text-primary border-none text-[10px] font-bold px-3 py-1 rounded-md tracking-widest">{month}</Badge><div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent" /><span className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase tracking-widest">MONTHLY TOTAL: ¥{monthItems.reduce((s, i) => s + i.amount, 0).toLocaleString()}</span></div>
              <div className="space-y-3">{monthItems.sort((a, b) => b.amount - a.amount).map((item) => (<BreakdownCard key={item.id} item={item} onUpdateBaseSalary={handleUpdateBaseSalary} />))}</div>
            </div>
          ))) : (<div className="space-y-3"><div className="flex items-center justify-between px-4 mb-2"><h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2"><List className="w-4 h-4" /> BREAKDOWN ITEMS / 明細一覧</h3><Badge variant="outline" className="rounded-md font-bold text-[10px] border-primary/20 text-primary">{items.length} ITEMS</Badge></div>{items.map((item) => (<BreakdownCard key={item.id} item={item} onUpdateBaseSalary={handleUpdateBaseSalary} />))}{!isGross && (<BreakdownCard item={{ id: `base-salary-${yearParam}-${monthParam}`, caseName: '基本給', client: 'SYSTEM', type: '固定給', amount: globalFinance?.baseSalaryOverrides?.[`${yearParam}-${monthParam.toString().padStart(2, '0')}`] ?? globalFinance?.baseSalary ?? 0, date: `${yearParam}-${monthParam.toString().padStart(2, '0')}分`, isStock: true, isBase: true, monthStr: `${yearParam}-${monthParam.toString().padStart(2, '0')}`, isOverridden: globalFinance?.baseSalaryOverrides?.[`${yearParam}-${monthParam.toString().padStart(2, '0')}`] !== undefined }} onUpdateBaseSalary={handleUpdateBaseSalary} />)}</div>)}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';

function BreakdownCard({ item, onUpdateBaseSalary }: { item: any, onUpdateBaseSalary: (m: string, a: number) => void }) {
  const router = useRouter();
  const [localAmount, setLocalAmount] = useState(item.amount?.toString() || '0');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setLocalAmount(item.amount?.toString() || '0');
  }, [item.amount]);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateBaseSalary(item.monthStr, parseInt(localAmount) || 0);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div 
      onClick={() => item.caseId && router.push(`/cases/${item.caseId}`)} 
      className={cn("bg-card p-5 rounded-lg border hover:border-primary/50 transition-all flex items-center gap-6 group shadow-sm", item.isBase ? "bg-secondary/30 border-dashed border-border" : "border-border", item.caseId && "cursor-pointer")}
    >
      <div className={cn("p-3 rounded-md shrink-0", item.isBase ? "bg-secondary text-muted-foreground" : item.isStock ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500")}>{item.isBase ? <Landmark className="w-5 h-5" /> : item.isStock ? <TrendingUp className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
            {item.caseName}
            {item.caseId && <ArrowUpRight className="w-3 h-3 text-muted-foreground opacity-30 group-hover:opacity-100 transition-opacity" />}
          </span>
          <Badge className={cn("text-[8px] font-bold border-none px-2 rounded-md shrink-0", item.isBase ? (item.isOverridden ? "bg-emerald-500/20 text-emerald-500" : "bg-secondary text-muted-foreground") : item.isManualRecognized ? "bg-amber-500/20 text-amber-500" : "bg-secondary text-muted-foreground")}>{item.type} {item.isManualRecognized && "• 手動計上"} {item.rate && ` (${item.rate}%)`} {item.isOverridden && "• 個別調整済み"}</Badge>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground opacity-60">
          <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {item.client}</span>
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.date}</span>
        </div>
      </div>
      <div className="text-right shrink-0" onClick={e => e.stopPropagation()}>
        {item.isBase ? (
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <div className="relative group/input">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs">¥</span>
                <Input 
                  type="number" 
                  value={localAmount} 
                  onChange={(e) => setLocalAmount(e.target.value)} 
                  className="h-10 w-32 bg-input border border-border rounded-md font-bold text-base pl-7 pr-3 text-foreground focus:border-primary transition-all text-right"
                />
              </div>
              <Button onClick={handleSave} variant="secondary" className="h-10 px-3 border border-border">
                {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <span className="text-[10px] font-bold">保存</span>}
              </Button>
            </div>
            <span className="text-[7px] font-bold text-muted-foreground uppercase opacity-40">EDIT BASE SALARY</span>
          </div>
        ) : (
          <>
            <div className="text-lg font-bold text-foreground">¥{item.amount.toLocaleString()}</div>
            {item.gross && item.gross !== item.amount && (<div className="text-[9px] font-bold text-muted-foreground opacity-60 mt-1">GROSS: ¥{item.gross?.toLocaleString()}</div>)}
          </>
        )}
      </div>
    </div>
  );
}

function SummaryItem({ label, value, sub, color, isLarge }: any) {
  return (<div className="flex justify-between items-end"><div><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block opacity-60">{label}</span><span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter block opacity-30">{sub}</span></div><span className={cn("font-bold tracking-tight", color, isLarge ? "text-2xl" : "text-lg")}>{value}</span></div>);
}

export default function FinanceDetailsPage() {
  return (<Suspense fallback={<div>Loading...</div>}><FinanceDetailsContent /></Suspense>);
}
