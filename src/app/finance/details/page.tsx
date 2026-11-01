'use client';

import { useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useHearsStore } from '@/store/useHearsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { NumericInput } from '@/components/ui/numeric-input';
import { 
  ChevronLeft, Wallet, ArrowUpRight, TrendingUp, Calendar, 
  Landmark, Activity, Briefcase, FileText, LayoutGrid, List,
  ChevronRight, CalendarDays, Percent, Settings2, Check
} from 'lucide-react';
import { format, parseISO, isAfter, startOfMonth, getYear, getMonth, addMonths, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { SideTree, TreeItem } from '@/components/layout/SideTree';

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

  const pageTitle = mode === 'gross' ? '全期間 法人総売上内訳' : mode === 'year' ? `${yearParam}年度 累計実績内訳` : `${yearParam}年 ${monthParam}月度 内訳`;
  const pageSubTitle = mode === 'gross' ? 'ALL TIME GROSS REVENUE BREAKDOWN' : mode === 'year' ? 'YEARLY CUMULATIVE REVENUE BREAKDOWN' : 'MONTHLY ESTIMATED REVENUE BREAKDOWN';

  return (
    <div className="space-y-3 animate-in fade-in duration-500 font-sans pb-10">
      <SideTree title="表示する期間">
        <TreeItem glyph="▾" label={`${yearParam}年度`} />
        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
          <TreeItem key={m} depth={1} label={`${m}月`} active={mode === 'month' && monthParam === m} href={`/finance/details?mode=month&year=${yearParam}&month=${m}`} />
        ))}
        <TreeItem glyph="▸" label="年度の累計実績" active={mode === 'year'} href={`/finance/details?mode=year&year=${yearParam}`} />
        <TreeItem glyph="▸" label="全期間 法人総売上" active={mode === 'gross'} href={`/finance/details?mode=gross`} />
      </SideTree>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-card p-4 rounded-md border border-border gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/finance')} className="text-muted-foreground hover:text-primary rounded-md shrink-0"><ChevronLeft className="w-6 h-6" /></Button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-lg font-bold tracking-tight text-foreground uppercase">{pageTitle}</h1>
              {mode === 'month' && (<div className="flex items-center bg-input p-1 rounded-md border border-border"><Button variant="ghost" size="icon" onClick={() => navigateMonth('prev')} className="h-8 w-8 hover:bg-secondary hover:text-primary rounded-md"><ChevronLeft className="w-4 h-4" /></Button><span className="px-3 text-[11px] font-bold">{monthParam}月</span><Button variant="ghost" size="icon" onClick={() => navigateMonth('next')} className="h-8 w-8 hover:bg-secondary hover:text-primary rounded-md"><ChevronRight className="w-4 h-4" /></Button></div>)}
            </div>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{pageSubTitle}</p>
          </div>
        </div>
        <div className="text-right"><span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">{mode === 'gross' ? 'TOTAL GROSS REVENUE / 法人総売上' : 'TOTAL PAY / 確定給与総額'}</span><span className="text-2xl font-bold tracking-tight text-primary">¥{totalTakeHome.toLocaleString()}</span></div>
      </div>
      <div className="flex flex-wrap gap-1 lg:hidden">
        {[
          { key: 'month', label: '月ごとの内訳', href: `/finance/details?mode=month&year=${yearParam}&month=${monthParam}` },
          { key: 'year', label: '年度の累計実績', href: `/finance/details?mode=year&year=${yearParam}` },
          { key: 'gross', label: '全期間 法人総売上', href: `/finance/details?mode=gross` },
        ].map(m => (
          <button key={m.key} type="button" onClick={() => router.push(m.href)} className={cn("px-3 py-1.5 rounded-md border text-[11px] font-bold transition-colors", mode === m.key ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:text-foreground")}>{m.label}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(240px,290px)_minmax(0,1fr)] gap-3">
        <div className="space-y-3">
          <Card className="bg-card border border-border rounded-md ring-0 overflow-hidden shadow-none gap-0 py-0">
            <CardHeader className="p-3 border-b border-border bg-secondary/50"><CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> REVENUE SUMMARY</CardTitle></CardHeader>
            {mode === 'gross' ? (
              <CardContent className="p-4 space-y-4">
                <SummaryItem label="案件売上合計 (100%)" value={`¥${totalTakeHome.toLocaleString()}`} sub="GROSS REVENUE TOTAL" color="text-indigo-700" isLarge />
              </CardContent>
            ) : (
              <CardContent className="p-4 space-y-4"><SummaryItem label="基本給 (計上分)" value={`¥${baseSalaryTotal.toLocaleString()}`} sub="BASE SALARY TOTAL" color="text-muted-foreground" /><SummaryItem label="案件歩合合計" value={`¥${(totalTakeHome - baseSalaryTotal).toLocaleString()}`} sub="CASE COMMISSION TOTAL" color="text-emerald-700" /><div className="pt-3 border-t border-dashed border-border"><SummaryItem label="総合計額" value={`¥${totalTakeHome.toLocaleString()}`} sub="GRAND TOTAL" color="text-primary" isLarge /></div></CardContent>
            )}
          </Card>
          <Card className="bg-card border border-border rounded-md ring-0 overflow-hidden shadow-none p-4 gap-0"><div className="flex items-center gap-3 text-amber-700 mb-3"><Landmark className="w-5 h-5" /><span className="text-[11px] font-bold uppercase tracking-wider leading-tight">計算ルール<br/><span className="text-[10px]">REVENUE RULE</span></span></div><p className="text-xs font-bold text-muted-foreground leading-relaxed">基本給は内訳から直接編集して月ごとに調整可能です。案件の収益計算は各還元率に基づきます。</p></Card>
        </div>
        <div className="space-y-4 min-w-0">
          {(mode === 'year' || mode === 'gross') ? (Object.entries(groupedItems).reverse().map(([month, monthItems]) => (
            <div key={month} className="space-y-2">
              <div className="flex items-center gap-3 px-1"><Badge className="bg-primary/15 text-primary border-none text-[11px] font-bold px-3 py-1 rounded-md tracking-wider">{month}</Badge><div className="h-px flex-1 bg-border" /><span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">MONTHLY TOTAL: ¥{monthItems.reduce((s, i) => s + i.amount, 0).toLocaleString()}</span></div>
              <div className="space-y-2">{monthItems.sort((a, b) => b.amount - a.amount).map((item) => (<BreakdownCard key={item.id} item={item} onUpdateBaseSalary={handleUpdateBaseSalary} />))}</div>
            </div>
          ))) : (<div className="space-y-2"><div className="flex items-center justify-between px-1 mb-1"><h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2"><List className="w-4 h-4" /> BREAKDOWN ITEMS / 明細一覧</h3><Badge variant="outline" className="rounded-md font-bold text-[11px] border-primary/40 text-primary">{items.length} ITEMS</Badge></div>{items.map((item) => (<BreakdownCard key={item.id} item={item} onUpdateBaseSalary={handleUpdateBaseSalary} />))}{!isGross && (<BreakdownCard item={{ id: `base-salary-${yearParam}-${monthParam}`, caseName: '基本給', client: 'SYSTEM', type: '固定給', amount: globalFinance?.baseSalaryOverrides?.[`${yearParam}-${monthParam.toString().padStart(2, '0')}`] ?? globalFinance?.baseSalary ?? 0, date: `${yearParam}-${monthParam.toString().padStart(2, '0')}分`, isStock: true, isBase: true, monthStr: `${yearParam}-${monthParam.toString().padStart(2, '0')}`, isOverridden: globalFinance?.baseSalaryOverrides?.[`${yearParam}-${monthParam.toString().padStart(2, '0')}`] !== undefined }} onUpdateBaseSalary={handleUpdateBaseSalary} />)}</div>)}
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
      className={cn("bg-card p-3 rounded-md border hover:border-primary/60 transition-colors flex flex-wrap sm:flex-nowrap items-center gap-3 group", item.isBase ? "bg-secondary/30 border-dashed border-border" : "border-border", item.caseId && "cursor-pointer")}
    >
      <div className={cn("p-2 rounded-md shrink-0", item.isBase ? "bg-secondary text-muted-foreground" : item.isStock ? "bg-emerald-600/15 text-emerald-700" : "bg-blue-600/15 text-blue-700")}>{item.isBase ? <Landmark className="w-5 h-5" /> : item.isStock ? <TrendingUp className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}</div>
      <div className="flex-1 min-w-[8rem]">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
            {item.caseName}
            {item.caseId && <ArrowUpRight className="w-3 h-3 text-muted-foreground opacity-30 group-hover:opacity-100 transition-opacity" />}
          </span>
          <Badge className={cn("text-[10px] font-bold border-none px-2 rounded-md shrink-0", item.isBase ? (item.isOverridden ? "bg-emerald-600/20 text-emerald-700" : "bg-secondary text-muted-foreground") : item.isManualRecognized ? "bg-amber-600/20 text-amber-700" : "bg-secondary text-muted-foreground")}>{item.type} {item.isManualRecognized && "• 手動計上"} {item.rate && ` (${item.rate}%)`} {item.isOverridden && "• 個別調整済み"}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[11px] font-bold text-muted-foreground">
          <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {item.client}</span>
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.date}</span>
        </div>
      </div>
      <div className="text-right shrink-0 ml-auto" onClick={e => e.stopPropagation()}>
        {item.isBase ? (
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <div className="relative group/input">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs">¥</span>
                <NumericInput 
                  value={parseInt(localAmount) || 0} 
                  onChange={(val) => setLocalAmount(val.toString())} 
                  className="h-9 w-32 bg-input border border-border rounded-md font-bold text-base pl-7 pr-3 text-foreground focus:border-primary transition-all text-right"
                />
              </div>
              <Button onClick={handleSave} variant="secondary" className="h-9 px-3 border border-border">
                {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="text-[10px] font-bold">保存</span>}
              </Button>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">EDIT BASE SALARY</span>
          </div>
        ) : (
          <>
            <div className="text-lg font-bold text-foreground">¥{item.amount.toLocaleString()}</div>
            {item.gross && item.gross !== item.amount && (<div className="text-[10px] font-bold text-muted-foreground mt-1">GROSS: ¥{item.gross?.toLocaleString()}</div>)}
          </>
        )}
      </div>
    </div>
  );
}

function SummaryItem({ label, value, sub, color, isLarge }: any) {
  return (<div className="flex justify-between items-end"><div><span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">{label}</span><span className="text-[10px] font-bold text-muted-foreground uppercase block">{sub}</span></div><span className={cn("font-bold tracking-tight", color, isLarge ? "text-2xl" : "text-lg")}>{value}</span></div>);
}

export default function FinanceDetailsPage() {
  return (<Suspense fallback={<div>Loading...</div>}><FinanceDetailsContent /></Suspense>);
}
