'use client';

import { useState, useMemo } from 'react';
import { useHearsStore } from '@/store/useHearsStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, Legend, BarChart, Bar, Label
} from 'recharts';
import { 
  Wallet, TrendingUp, PieChart as PieIcon, ArrowUpRight, 
  Calendar, Briefcase, Settings2, Check, BarChart3,
  DollarSign, Activity, Users, Target, History, Landmark, Target as TargetIcon,
  ClipboardList, Clock, Building2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format, startOfMonth, addMonths, isAfter, parseISO, subMonths, getYear, subYears } from 'date-fns';
import { ja } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const COLORS = ['#00896B', '#3498db', '#9b59b6', '#f1c40f', '#e67e22', '#e74c3c', '#2ecc71', '#1abc9c'];

export default function FinancePage() {
  const router = useRouter();
  const { projects, cases, clients, globalFinance, updateGlobalFinance } = useHearsStore();
  const [baseSalaryInput, setBaseSalaryInput] = useState(globalFinance?.baseSalary?.toString() || '200000');
  const [isSalarySaved, setIsSalarySaved] = useState(false);
  const [viewYear, setViewYear] = useState<number>(new Date().getFullYear());

  const handleSaveBaseSalary = () => {
    const val = parseInt(baseSalaryInput) || 0;
    updateGlobalFinance((f) => { f.baseSalary = val; });
    setIsSalarySaved(true);
    setTimeout(() => setIsSalarySaved(false), 2000);
  };

  const { currentYearData, lastYearData, yoyComparison, stackData, lastYearFullTotal, genreMix, totalCaseCountForMix } = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const now = new Date();
    const currentYear = now.getFullYear();
    const defaultBaseSalary = globalFinance?.baseSalary || 0;
    const overrides = globalFinance?.baseSalaryOverrides || {};
    
    const getDataForYear = (year: number) => {
      return months.map(m => {
        const mStr = `${year}-${m.toString().padStart(2, '0')}`;
        const dMonth = parseISO(`${mStr}-01`);
        const isFuture = year > currentYear || (year === currentYear && isAfter(startOfMonth(dMonth), startOfMonth(now)));

        let stockTakeHome = 0;
        let shotTakeHome = 0;
        
        cases.forEach(c => {
          if (!c.finance) return;
          const isStockType = c.genre === 'HP制作' || c.genre === 'SNS運用';
          const start = c.finance.revenueStartMonth;
          if (!start) return;

          if (isStockType) {
            const recognitionMonth = c.finance.oneTimeFeeMonth || start;
            if (recognitionMonth === mStr) {
              shotTakeHome += c.finance.oneTimeFeeTakeHome ?? Math.floor((c.finance.oneTimeFee || 0) * 0.4);
            }
            if (mStr === start || isAfter(dMonth, parseISO(start))) {
              stockTakeHome += Math.floor((c.finance.maintenanceFee || 0) * 0.4);
            }
          } else {
            const recognitionMonth = c.finance.spotMonth || start;
            if (recognitionMonth === mStr) {
              const rate = c.finance.spotRate ?? 40;
              shotTakeHome += Math.floor((c.finance.spotFee || 0) * (rate / 100));
            }
          }
        });

        const currentBaseSalary = overrides[mStr] !== undefined ? overrides[mStr] : defaultBaseSalary;
        const monthTakeHome = stockTakeHome + shotTakeHome;
        const totalWithBase = monthTakeHome + currentBaseSalary;

        return {
          month: `${m}月`,
          stock: stockTakeHome,
          shot: shotTakeHome,
          total: totalWithBase,
          isFuture
        };
      });
    };

    const current = getDataForYear(viewYear);
    const last = getDataForYear(viewYear - 1);
    const lastFullTotal = last.reduce((s, d) => s + d.total, 0);

    const genreMap = new Map<string, { value: number, count: number }>();
    cases.forEach(c => {
      if (!c.finance) return;
      const genre = c.genre || '未分類';
      const isStockType = genre === 'HP制作' || genre === 'SNS運用';
      let genreTotal = 0;
      let hasRevenueInYear = false;

      current.forEach((d, idx) => {
        const mStr = `${viewYear}-${(idx + 1).toString().padStart(2, '0')}`;
        const dMonth = parseISO(`${mStr}-01`);
        const start = c.finance.revenueStartMonth;
        if (!start) return;

        if (isStockType) {
          const recognitionMonth = c.finance.oneTimeFeeMonth || start;
          if (recognitionMonth === mStr) {
            genreTotal += c.finance.oneTimeFeeTakeHome ?? Math.floor((c.finance.oneTimeFee || 0) * 0.4);
            hasRevenueInYear = true;
          }
          if (mStr === start || isAfter(dMonth, parseISO(start))) {
            genreTotal += Math.floor((c.finance.maintenanceFee || 0) * 0.4);
            hasRevenueInYear = true;
          }
        } else {
          const recognitionMonth = c.finance.spotMonth || start;
          if (recognitionMonth === mStr) {
            const rate = c.finance.spotRate ?? 40;
            genreTotal += Math.floor((c.finance.spotFee || 0) * (rate / 100));
            hasRevenueInYear = true;
          }
        }
      });

      if (hasRevenueInYear) {
        const prev = genreMap.get(genre) || { value: 0, count: 0 };
        genreMap.set(genre, { value: prev.value + genreTotal, count: prev.count + 1 });
      }
    });

    const totalGenreValue = Array.from(genreMap.values()).reduce((s, v) => s + v.value, 0);
    const totalCaseCount = Array.from(genreMap.values()).reduce((s, v) => s + v.count, 0);
    
    const mix = Array.from(genreMap.entries()).map(([name, data], idx) => ({
      name,
      value: data.value,
      count: data.count,
      percent: totalGenreValue ? Math.round((data.value / totalGenreValue) * 100) : 0,
      color: COLORS[idx % COLORS.length]
    })).sort((a, b) => b.value - a.value);

    const comparison = current.map((curr, i) => ({
      name: curr.month,
      confirmed: curr.isFuture ? null : curr.total,
      planned: curr.isFuture ? curr.total : null,
      lastYear: last[i].total
    }));

    const stack = current.map(curr => ({
      name: curr.month,
      stock: curr.stock,
      shot: curr.shot,
      isFuture: curr.isFuture
    }));

    return { 
      currentYearData: current, lastYearData: last, yoyComparison: comparison, 
      stackData: stack, lastYearFullTotal: lastFullTotal, 
      genreMix: mix, totalCaseCountForMix: totalCaseCount 
    };
  }, [cases, viewYear, globalFinance]);

  const stats = useMemo(() => {
    let yearlyTotal = 0;
    currentYearData.forEach(d => { if (!d.isFuture) yearlyTotal += d.total; });

    const now = new Date();
    const currentMonthNum = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const currentMonthStr = format(now, 'yyyy-MM');
    
    const isCurrentYear = viewYear === currentYear;
    let currentMonthPrediction = 0;
    
    if (isCurrentYear) {
      const overrides = globalFinance?.baseSalaryOverrides || {};
      const currentBaseSalary = overrides[currentMonthStr] !== undefined ? overrides[currentMonthStr] : (globalFinance?.baseSalary || 0);
      currentMonthPrediction = currentBaseSalary;

      cases.forEach(c => {
        if (!c.finance) return;
        const isStockType = c.genre === 'HP制作' || c.genre === 'SNS運用';
        const start = c.finance.revenueStartMonth;
        if (!start) return;
        
        if (isStockType) {
          const recognitionMonth = c.finance.oneTimeFeeMonth || start;
          if (recognitionMonth === currentMonthStr) {
            currentMonthPrediction += c.finance.oneTimeFeeTakeHome ?? Math.floor((c.finance.oneTimeFee || 0) * 0.4);
          }
          if (currentMonthStr === start || isAfter(now, parseISO(start))) {
            currentMonthPrediction += (c.finance.maintenanceFee || 0) * 0.4;
          }
        } else {
          const recognitionMonth = c.finance.spotMonth || start;
          if (recognitionMonth === currentMonthStr) {
            const rate = c.finance.spotRate ?? 40;
            currentMonthPrediction += Math.floor((c.finance.spotFee || 0) * (rate / 100));
          }
        }
      });
    }

    const reachRate = lastYearFullTotal === 0 ? 0 : Math.round((yearlyTotal / lastYearFullTotal) * 100);

    return { 
      yearlyTotal, 
      currentMonthPrediction: Math.floor(currentMonthPrediction), 
      reachRate,
      totalProjects: cases.length,
      activeCases: cases.filter(c => c.status === 'active').length,
      totalClients: clients.length,
      currentMonthNum
    };
  }, [currentYearData, globalFinance, cases, lastYearFullTotal, clients.length, viewYear]);

  return (
    <div className="space-y-4 animate-in fade-in duration-500 font-[family-name:var(--font-noto)] pb-10">
      {/* 小型化されたナビゲーションカード */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <NavCard 
          label="累計プロジェクト" 
          subLabel="TOTAL PROJECTS" 
          value={stats.totalProjects} 
          unit="件" 
          icon={<ClipboardList className="w-5 h-5" />} 
          color="emerald" 
          onClick={() => router.push('/cases?filter=all')} 
        />
        <NavCard 
          label="進行中案件" 
          subLabel="ACTIVE CASES" 
          value={stats.activeCases} 
          unit="件" 
          icon={<Clock className="w-5 h-5" />} 
          color="blue" 
          onClick={() => router.push('/cases?filter=active')} 
        />
        <NavCard 
          label="取引クライアント" 
          subLabel="CLIENTS" 
          value={stats.totalClients} 
          unit="社" 
          icon={<Users className="w-5 h-5" />} 
          color="amber" 
          onClick={() => router.push('/clients')} 
        />
      </div>

      <div className="flex justify-between items-center bg-white p-5 rounded-[1.8rem] paper-shadow">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl"><BarChart3 className="w-5 h-5 text-primary" /></div>
          <div>
            <h1 className="text-lg font-bold italic tracking-tighter text-foreground font-[family-name:var(--font-outfit)] uppercase leading-none">FINANCIAL ANALYSIS</h1>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-40">収益分析 ・ 経営目標管理</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-secondary/50 p-0.5 rounded-lg border border-border">
            {[viewYear - 1, viewYear, viewYear + 1].map(y => (
              <button key={y} onClick={() => setViewYear(y)} className={cn("px-3 py-1 rounded-md text-[9px] font-bold uppercase transition-all", viewYear === y ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}>{y}年度</button>
            ))}
          </div>
          <div className="flex items-center gap-2.5 bg-secondary/20 px-3 py-1 rounded-lg border border-border">
             <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 leading-none">基本給設定</span>
             <Input type="number" value={baseSalaryInput} onChange={(e) => setBaseSalaryInput(e.target.value)} className="h-5 w-16 border-none bg-transparent font-bold text-sm p-0 focus-visible:ring-0 text-foreground font-[family-name:var(--font-outfit)] text-right" />
             <Button size="icon" variant="ghost" onClick={handleSaveBaseSalary} className="h-6 w-6 hover:bg-primary/10 rounded-md">{isSalarySaved ? <Check className="w-3 h-3 text-emerald-500" /> : <Settings2 className="w-3 h-3" />}</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCardCompact label={`${viewYear}年度 累計実績`} subLabel="CUMULATIVE" value={`¥${stats.yearlyTotal.toLocaleString()}`} sub="今日までの確定手取り額" icon={<Wallet className="w-4 h-4" />} color="bg-primary" onClick={() => router.push(`/finance/details?year=${viewYear}&mode=year`)} />
        <StatCardCompact label={`${viewYear - 1}年度 実績`} subLabel="PREVIOUS" value={`¥${lastYearFullTotal.toLocaleString()}`} sub="前年度の最終着地実績" icon={<TargetIcon className="w-4 h-4" />} color="bg-zinc-800" onClick={() => router.push(`/finance/details?year=${viewYear - 1}&mode=year`)} />
        <StatCardCompact label="当月推定手取り額" subLabel="MONTHLY" value={`¥${stats.currentMonthPrediction.toLocaleString()}`} sub="基本給 ＋ 保守還元合算" icon={<Activity className="w-4 h-4" />} color="bg-blue-600" onClick={() => router.push(`/finance/details?year=${new Date().getFullYear()}&month=${stats.currentMonthNum}&mode=month`)} />
        <StatCardCompact label="前年目標達成率" subLabel="RATE" value={`${stats.reachRate}%`} sub={`前年 ¥${lastYearFullTotal.toLocaleString()} 比`} icon={<TrendingUp className="w-4 h-4" />} color="bg-emerald-600" isPercent />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* YoY Performance カードの余白と高さを調整 */}
        <Card className="xl:col-span-2 bg-white border-none paper-shadow-lg rounded-[2rem] p-5 pb-2">
          <div className="flex justify-between items-center mb-3">
            <div><h3 className="text-sm font-bold italic tracking-tighter flex items-center gap-2 font-[family-name:var(--font-outfit)] uppercase"><History className="w-4 h-4 text-primary" /> YoY PERFORMANCE</h3><p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 ml-6">実績比較：<span className="text-emerald-600">確定</span> • <span className="text-amber-500">予定</span> • <span className="text-slate-300">前年</span></p></div>
            <div className="flex gap-3">
               <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-primary" /><span className="text-[9px] font-bold text-muted-foreground">確定</span></div>
               <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-400" /><span className="text-[9px] font-bold text-muted-foreground">予定</span></div>
            </div>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yoyComparison}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'bold', fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'bold', fill: '#94a3b8'}} tickFormatter={(v) => `${(v/1000).toLocaleString()}k`} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '10px' }} formatter={(v: any) => v === null ? '---' : `${(v/1000).toLocaleString()}千円`} />
                <Bar dataKey="confirmed" fill="#00896B" radius={[3, 3, 0, 0]} barSize={16} name="確定収益" />
                <Bar dataKey="planned" fill="#f59e0b" radius={[3, 3, 0, 0]} barSize={16} name="収益予定" />
                <Bar dataKey="lastYear" fill="#e2e8f0" radius={[3, 3, 0, 0]} barSize={16} name="前年度" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Genre Mix を隣のカードと高さを合わせる */}
        <Card className="bg-white border-none paper-shadow-lg rounded-[2rem] p-5 flex flex-col h-full overflow-hidden">
          <div className="mb-2"><h3 className="text-sm font-bold italic tracking-tighter flex items-center gap-2 font-[family-name:var(--font-outfit)] uppercase"><PieIcon className="w-4 h-4 text-primary" /> GENRE MIX</h3><p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 ml-6">ジャンル別 収益構成比</p></div>
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            <div className="h-[120px] w-full shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie 
                    data={genreMix} 
                    cx="50%" cy="50%" 
                    innerRadius={40} 
                    outerRadius={55} 
                    paddingAngle={4} 
                    dataKey="value"
                    label={({ count }) => `${count}`}
                    labelLine={false}
                  >
                    {genreMix.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    <Label 
                      value={`${totalCaseCountForMix}件`} 
                      position="center" 
                      className="text-sm font-bold font-[family-name:var(--font-outfit)] fill-foreground"
                    />
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '9px' }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1 overflow-y-auto pr-1 custom-scrollbar max-h-[85px] mt-2">
              {genreMix.map((item) => (
                <div key={item.name} className="flex justify-between items-center p-1.5 rounded-lg bg-secondary/10 group hover:bg-secondary/20 transition-all shrink-0">
                  <div className="flex items-center gap-1.5 min-w-0"><div className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: item.color }} /><span className="text-[8px] font-black text-foreground uppercase tracking-tight truncate">{item.name}</span></div>
                  <div className="text-right shrink-0"><span className="text-[10px] font-bold italic font-[family-name:var(--font-outfit)] block leading-none">¥{item.value.toLocaleString()}</span></div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card className="bg-white border-none paper-shadow-lg rounded-[2rem] p-5">
        <div className="mb-3"><h3 className="text-sm font-bold italic tracking-tighter flex items-center gap-2 font-[family-name:var(--font-outfit)] uppercase"><TrendingUp className="w-4 h-4 text-primary" /> REVENUE STACK</h3><p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 ml-6">収益種別 積み上げ推移分析</p></div>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stackData}>
              <defs><linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00896B" stopOpacity={0.1}/><stop offset="95%" stopColor="#00896B" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'bold', fill: '#94a3b8'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'bold', fill: '#94a3b8'}} tickFormatter={(v) => `${(v/1000).toLocaleString()}k`} />
              <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '10px' }} formatter={(v: any) => v === null ? '---' : `${(v/1000).toLocaleString()}k`} />
              <Area type="monotone" dataKey="stock" stroke="#00896B" strokeWidth={2.5} fill="url(#colorStock)" stackId="1" name="保守" />
              <Area type="monotone" dataKey="shot" stroke="#3498db" strokeWidth={1} fillOpacity={0.05} stackId="1" name="案件" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function NavCard({ label, subLabel, value, unit, icon, color, onClick }: any) {
  const colorClasses = {
    emerald: "from-emerald-500 to-teal-600 shadow-emerald-200/50",
    blue: "from-blue-500 to-indigo-600 shadow-blue-200/50",
    amber: "from-amber-500 to-orange-600 shadow-amber-200/50"
  };
  
  return (
    <button 
      onClick={onClick}
      className="relative group overflow-hidden bg-white p-4 rounded-[1.8rem] paper-shadow hover:paper-shadow-lg transition-all text-left border border-transparent hover:border-primary/20 active:scale-95"
    >
      <div className={cn(
        "absolute right-[-5px] top-[-5px] w-20 h-20 bg-gradient-to-br opacity-[0.03] group-hover:opacity-[0.08] transition-all rounded-full",
        color === 'emerald' ? 'from-emerald-500 to-teal-600' :
        color === 'blue' ? 'from-blue-500 to-indigo-600' : 'from-amber-500 to-orange-600'
      )} />
      
      <div className="flex justify-between items-start mb-3">
        <div className={cn(
          "p-2 rounded-xl text-white shadow-lg bg-gradient-to-br",
          (colorClasses as any)[color]
        )}>
          {icon}
        </div>
        <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-10 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
      </div>
      
      <div className="relative z-10">
        <div className="flex flex-col mb-0.5">
          <span className="text-[9px] font-black text-foreground uppercase tracking-widest">{label}</span>
          <span className="text-[6px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">{subLabel}</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold italic tracking-tighter text-foreground font-[family-name:var(--font-outfit)] leading-none">{value}</span>
          <span className="text-[9px] font-bold text-muted-foreground">{unit}</span>
        </div>
      </div>
      
      <div className={cn(
        "absolute bottom-0 left-0 h-1 transition-all",
        color === 'emerald' ? 'bg-emerald-500 w-0 group-hover:w-full' :
        color === 'blue' ? 'bg-blue-500 w-0 group-hover:w-full' : 'bg-amber-500 w-0 group-hover:w-full'
      )} />
    </button>
  );
}

function StatCardCompact({ label, subLabel, value, sub, icon, color, isPercent, onClick }: any) {
  return (
    <Card className={cn("bg-white border-none paper-shadow rounded-[1.2rem] overflow-hidden group transition-all", onClick && "cursor-pointer hover:scale-[1.01]")} onClick={onClick}>
      <div className={cn("h-1 w-full", color)} />
      <CardContent className="p-3.5"><div className="flex justify-between items-center mb-2"><div className={cn("p-1.5 rounded-lg text-white shadow-sm", color)}>{icon}</div><div className="text-right leading-none"><span className="text-[9px] font-extrabold text-foreground uppercase tracking-widest block mb-0.5">{label}</span><span className="text-[6px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">{subLabel}</span></div></div><div className="flex items-baseline gap-1.5"><span className={cn("text-2xl font-bold italic tracking-tighter font-[family-name:var(--font-outfit)]", isPercent ? (parseInt(value) >= 0 ? "text-emerald-600" : "text-red-500") : "text-foreground")}>{value}</span></div><p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 mt-1 truncate">{sub}</p></CardContent>
    </Card>
  );
}
