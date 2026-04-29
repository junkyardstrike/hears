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
  ChevronRight, CalendarDays, Percent, Settings2
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

  const { items, groupedItems, totalTakeHome, baseSalaryTotal } = useMemo(() => {
    const defaultBaseSalary = globalFinance?.baseSalary || 0;
    const overrides = globalFinance?.baseSalaryOverrides || {};
    const now = new Date();
    const monthsToCalculate = mode === 'year' ? Array.from({ length: 12 }, (_, i) => i + 1) : [monthParam];

    const results: any[] = [];
    const grouped: Record<string, any[]> = {};
    let totalStock = 0;
    let totalShot = 0;
    let combinedBaseSalaryTotal = 0;
    let elapsedMonths = 0;

    monthsToCalculate.forEach(m => {
      const mStr = `${yearParam}-${m.toString().padStart(2, '0')}`;
      const dMonth = parseISO(`${mStr}-01`);
      const isFuture = yearParam > now.getFullYear() || (yearParam === now.getFullYear() && isAfter(startOfMonth(dMonth), startOfMonth(now)));
      
      if (mode === 'year' && isFuture) return; 
      
      elapsedMonths++;
      const monthLabel = `${m}月`;
      if (!grouped[monthLabel]) grouped[monthLabel] = [];

      // Get specific base salary for this month
      const currentBaseSalary = overrides[mStr] !== undefined ? overrides[mStr] : defaultBaseSalary;
      combinedBaseSalaryTotal += currentBaseSalary;

      cases.forEach(c => {
        if (!c.finance) return;
        const isStockType = c.genre === 'HP制作' || c.genre === 'SNS運用';
        const start = c.finance.revenueStartMonth;
        if (!start) return;

        if (isStockType) {
          const recognitionMonth = c.finance.oneTimeFeeMonth || start;
          if (recognitionMonth === mStr) {
            const takeHome = c.finance.oneTimeFeeTakeHome ?? Math.floor((c.finance.oneTimeFee || 0) * 0.4);
            const item = { id: `${c.id}-shot-${m}`, caseName: c.name, client: c.contractEntity || '未設定', type: '制作費 (SHOT)', amount: takeHome, date: `${mStr} 計上`, isStock: false, gross: c.finance.oneTimeFee, isManualRecognized: !!c.finance.oneTimeFeeMonth, monthLabel };
            results.push(item); grouped[monthLabel].push(item); totalShot += takeHome;
          }
          if (mStr === start || isAfter(dMonth, parseISO(start))) {
            const fee = c.finance.maintenanceFee || 0;
            const takeHome = Math.floor(fee * 0.4);
            const item = { id: `${c.id}-stock-${m}`, caseName: c.name, client: c.contractEntity || '未設定', type: '保守還元 (STOCK)', amount: takeHome, date: `${mStr}分`, isStock: true, gross: fee, monthLabel };
            results.push(item); grouped[monthLabel].push(item); totalStock += takeHome;
          }
        } else {
          const recognitionMonth = c.finance.spotMonth || start;
          if (recognitionMonth === mStr) {
            const rate = c.finance.spotRate ?? 40;
            const takeHome = Math.floor((c.finance.spotFee || 0) * (rate / 100));
            const item = { id: `${c.id}-spot-${m}`, caseName: c.name, client: c.contractEntity || '未設定', type: 'スポット収益', amount: takeHome, date: `${mStr} 計上`, isStock: false, gross: c.finance.spotFee, isManualRecognized: !!c.finance.spotMonth, rate, monthLabel };
            results.push(item); grouped[monthLabel].push(item); totalShot += takeHome;
          }
        }
      });
      
      grouped[monthLabel].push({ 
        id: `base-salary-${m}`, 
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
    });

    return { items: results.sort((a, b) => b.amount - a.amount), groupedItems: grouped, totalTakeHome: totalStock + totalShot + combinedBaseSalaryTotal, baseSalaryTotal: combinedBaseSalaryTotal };
  }, [cases, globalFinance, mode, yearParam, monthParam]);

  const pageTitle = mode === 'year' ? `${yearParam}年度 累計実績内訳` : `${yearParam}年 ${monthParam}月度 内訳`;
  const pageSubTitle = mode === 'year' ? 'YEARLY CUMULATIVE REVENUE BREAKDOWN' : 'MONTHLY ESTIMATED REVENUE BREAKDOWN';

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-[family-name:var(--font-noto)] pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-8 rounded-[3rem] paper-shadow gap-6">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.push('/finance')} className="text-muted-foreground hover:text-primary rounded-2xl shrink-0"><ChevronLeft className="w-8 h-8" /></Button>
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold italic tracking-tighter text-foreground font-[family-name:var(--font-outfit)] uppercase">{pageTitle}</h1>
              {mode === 'month' && (<div className="flex items-center bg-secondary/50 p-1 rounded-xl border border-border"><Button variant="ghost" size="icon" onClick={() => navigateMonth('prev')} className="h-8 w-8 hover:bg-white hover:text-primary rounded-lg"><ChevronLeft className="w-4 h-4" /></Button><span className="px-3 text-[10px] font-black font-[family-name:var(--font-outfit)]">{monthParam}月</span><Button variant="ghost" size="icon" onClick={() => navigateMonth('next')} className="h-8 w-8 hover:bg-white hover:text-primary rounded-lg"><ChevronRight className="w-4 h-4" /></Button></div>)}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-40">{pageSubTitle}</p>
          </div>
        </div>
        <div className="text-right"><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 block mb-1">TOTAL TAKE-HOME / 合計手取り額</span><span className="text-4xl font-bold italic tracking-tighter text-primary font-[family-name:var(--font-outfit)]">¥{totalTakeHome.toLocaleString()}</span></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card className="bg-white border-none paper-shadow rounded-[2.5rem] overflow-hidden"><CardHeader className="p-8 pb-4"><CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-3"><Activity className="w-4 h-4 text-primary" /> REVENUE SUMMARY</CardTitle></CardHeader><CardContent className="p-8 pt-0 space-y-6"><SummaryItem label="基本給 (計上分)" value={`¥${baseSalaryTotal.toLocaleString()}`} sub="BASE SALARY TOTAL" color="text-slate-600" /><SummaryItem label="案件手取り合計" value={`¥${(totalTakeHome - baseSalaryTotal).toLocaleString()}`} sub="CASE REVENUE TOTAL" color="text-emerald-600" /><div className="pt-4 border-t border-dashed border-border"><SummaryItem label="総合計額" value={`¥${totalTakeHome.toLocaleString()}`} sub="GRAND TOTAL" color="text-primary" isLarge /></div></CardContent></Card>
          <Card className="bg-white border-none paper-shadow rounded-[2.5rem] overflow-hidden p-8"><div className="flex items-center gap-4 text-amber-600 mb-4"><Landmark className="w-6 h-6" /><span className="text-[10px] font-bold uppercase tracking-widest leading-tight">計算ルール<br/><span className="opacity-60 text-[8px]">REVENUE RULE</span></span></div><p className="text-xs font-bold text-muted-foreground leading-relaxed">基本給は内訳から直接編集して月ごとに調整可能です。案件の収益計算は各還元率に基づきます。</p></Card>
        </div>
        <div className="lg:col-span-2 space-y-8">
          {mode === 'year' ? (Object.entries(groupedItems).reverse().map(([month, monthItems]) => (
            <div key={month} className="space-y-4">
              <div className="flex items-center gap-4 px-4"><Badge className="bg-primary/10 text-primary border-none text-[10px] font-black px-4 py-1 rounded-lg tracking-widest">{month}</Badge><div className="h-px flex-1 bg-gradient-to-r from-primary/10 to-transparent" /><span className="text-[10px] font-bold text-muted-foreground opacity-40 uppercase tracking-widest">MONTHLY TOTAL: ¥{monthItems.reduce((s, i) => s + i.amount, 0).toLocaleString()}</span></div>
              <div className="space-y-3">{monthItems.sort((a, b) => b.amount - a.amount).map((item) => (<BreakdownCard key={item.id} item={item} onUpdateBaseSalary={handleUpdateBaseSalary} />))}</div>
            </div>
          ))) : (<div className="space-y-3"><div className="flex items-center justify-between px-4 mb-2"><h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2"><List className="w-4 h-4" /> BREAKDOWN ITEMS / 明細一覧</h3><Badge variant="outline" className="rounded-lg font-bold text-[10px] border-primary/20 text-primary">{items.length} ITEMS</Badge></div>{items.map((item) => (<BreakdownCard key={item.id} item={item} onUpdateBaseSalary={handleUpdateBaseSalary} />))}<BreakdownCard item={{ id: `base-salary-${yearParam}-${monthParam}`, caseName: '基本給', client: 'SYSTEM', type: '固定給', amount: globalFinance?.baseSalaryOverrides?.[`${yearParam}-${monthParam.toString().padStart(2, '0')}`] ?? globalFinance?.baseSalary ?? 0, date: `${yearParam}-${monthParam.toString().padStart(2, '0')}分`, isStock: true, isBase: true, monthStr: `${yearParam}-${monthParam.toString().padStart(2, '0')}`, isOverridden: globalFinance?.baseSalaryOverrides?.[`${yearParam}-${monthParam.toString().padStart(2, '0')}`] !== undefined }} onUpdateBaseSalary={handleUpdateBaseSalary} /></div>)}
        </div>
      </div>
    </div>
  );
}

function BreakdownCard({ item, onUpdateBaseSalary }: { item: any, onUpdateBaseSalary: (m: string, a: number) => void }) {
  return (
    <div className={cn("bg-white p-6 rounded-[2rem] paper-shadow hover:paper-shadow-lg transition-all flex items-center gap-6 border border-transparent hover:border-primary/10 group", item.isBase && "bg-slate-50/50 border-dashed border-slate-200")}>
      <div className={cn("p-3 rounded-2xl shrink-0", item.isBase ? "bg-slate-200 text-slate-600" : item.isStock ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600")}>{item.isBase ? <Landmark className="w-5 h-5" /> : item.isStock ? <TrendingUp className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.caseName}</span>
          <Badge className={cn("text-[8px] font-bold border-none px-2", item.isBase ? (item.isOverridden ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600") : item.isManualRecognized ? "bg-amber-100 text-amber-700" : "bg-secondary/50 text-muted-foreground")}>{item.type} {item.isManualRecognized && "• 手動計上"} {item.rate && ` (${item.rate}%)`} {item.isOverridden && "• 個別調整済み"}</Badge>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground opacity-60">
          <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {item.client}</span>
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.date}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        {item.isBase ? (
          <div className="flex flex-col items-end gap-1">
            <div className="relative group/input">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs font-[family-name:var(--font-outfit)]">¥</span>
              <Input 
                type="number" 
                value={item.amount} 
                onChange={(e) => onUpdateBaseSalary(item.monthStr, parseInt(e.target.value) || 0)} 
                className="h-10 w-32 bg-white border-2 border-slate-200 rounded-xl font-bold text-base pl-7 pr-3 text-slate-700 focus:border-primary transition-all text-right font-[family-name:var(--font-outfit)]"
              />
            </div>
            <span className="text-[7px] font-bold text-muted-foreground uppercase opacity-40">EDIT BASE SALARY</span>
          </div>
        ) : (
          <>
            <div className="text-lg font-bold italic font-[family-name:var(--font-outfit)] text-foreground">¥{item.amount.toLocaleString()}</div>
            {item.gross && (<div className="text-[9px] font-bold text-muted-foreground opacity-40">GROSS: ¥{item.gross?.toLocaleString()}</div>)}
          </>
        )}
      </div>
    </div>
  );
}

function SummaryItem({ label, value, sub, color, isLarge }: any) {
  return (<div className="flex justify-between items-end"><div><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block opacity-60">{label}</span><span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter block opacity-30">{sub}</span></div><span className={cn("font-bold italic tracking-tighter font-[family-name:var(--font-outfit)]", color, isLarge ? "text-2xl" : "text-lg")}>{value}</span></div>);
}

export default function FinanceDetailsPage() {
  return (<Suspense fallback={<div>Loading...</div>}><FinanceDetailsContent /></Suspense>);
}
