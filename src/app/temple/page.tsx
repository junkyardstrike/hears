'use client';

import { useMemo } from 'react';
import { useHearsStore, CaseData } from '@/store/useHearsStore';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { parseISO, isAfter, startOfMonth, format, min, addMonths, differenceInMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { Crown, Sparkles, Sword, Coins, ArrowUpRight, Flame, Shield, Star, Wand2, Castle } from 'lucide-react';

const TIER_THRESHOLDS = [
  { tier: 1, level: 1, min: 0 },
  { tier: 2, level: 20, min: 2000000 },
  { tier: 3, level: 50, min: 5000000 },
  { tier: 4, level: 100, min: 10000000 },
  { tier: 5, level: 500, min: 50000000 }
];

type ClassType = 'mage' | 'merchant' | 'hero';

const CLASS_INFO = {
  mage: {
    title: "魔法使い系統",
    subTitle: "Web / SNS 開発",
    icon: Wand2,
    jobs: ["見習い魔法使い", "魔導士", "大魔導士", "賢者", "星詠み"],
    colorClass: "text-emerald-500",
    bgClass: "bg-emerald-500",
    borderClass: "border-emerald-500/30",
    glowClass: "shadow-emerald-500/50"
  },
  merchant: {
    title: "商人系統",
    subTitle: "SiGMARK",
    icon: Coins,
    jobs: ["見習い商人", "行商人", "豪商", "大富豪", "貿易王"],
    colorClass: "text-amber-500",
    bgClass: "bg-amber-500",
    borderClass: "border-amber-500/30",
    glowClass: "shadow-amber-500/50"
  },
  hero: {
    title: "勇者系統",
    subTitle: "OTHER GENRES",
    icon: Sword,
    jobs: ["見習い戦士", "剣士", "騎士", "勇者", "伝説の勇者"],
    colorClass: "text-blue-500",
    bgClass: "bg-blue-500",
    borderClass: "border-blue-500/30",
    glowClass: "shadow-blue-500/50"
  }
};

const getTierFromRevenue = (revenue: number) => {
  let currentTier = 1;
  for (let i = TIER_THRESHOLDS.length - 1; i >= 0; i--) {
    if (revenue >= TIER_THRESHOLDS[i].min) {
      currentTier = TIER_THRESHOLDS[i].tier;
      break;
    }
  }
  return currentTier;
};

// Avatar Component
const AvatarNode = ({ classType, tier }: { classType: ClassType, tier: number }) => {
  const info = CLASS_INFO[classType];
  const Icon = info.icon;
  
  return (
    <div className={cn(
      "relative w-24 h-24 rounded-2xl flex items-center justify-center border-2 bg-card overflow-hidden",
      info.borderClass,
      tier >= 3 && info.glowClass,
      tier >= 3 && "shadow-lg"
    )}>
      <div className={cn("absolute inset-0 opacity-10", info.bgClass)} />
      {tier >= 4 && <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 animate-shimmer" />}
      
      <Icon className={cn(
        "w-12 h-12 transition-transform duration-500", 
        info.colorClass,
        tier >= 2 && "scale-110",
        tier >= 4 && "scale-125",
        tier === 5 && "animate-pulse drop-shadow-md"
      )} />

      {tier >= 3 && <Sparkles className="absolute top-2 right-2 w-4 h-4 text-amber-300 animate-pulse" />}
      {tier >= 5 && <Crown className="absolute -top-3 -right-3 w-8 h-8 text-yellow-400 drop-shadow-lg -rotate-12" />}
      
      <div className="absolute bottom-1 right-1 text-[10px] font-black opacity-40">T{tier}</div>
    </div>
  );
};

export default function TemplePage() {
  const { cases } = useHearsStore();

  const data = useMemo(() => {
    const nowD = startOfMonth(new Date());
    
    const totals = { mage: 0, merchant: 0, hero: 0 };
    const counts = { mage: 0, merchant: 0, hero: 0 };
    const history: Record<ClassType, { month: string, revenue: number }[]> = { mage: [], merchant: [], hero: [] };

    cases.forEach(c => {
      const g = c.genre || '';
      const t: ClassType = (g === 'HP制作' || g === 'SNS運用') ? 'mage' : (g === 'SiGMARK') ? 'merchant' : 'hero';
      
      if (!c.finance || !c.finance.revenueStartMonth) return;
      counts[t]++;
      
      const startStr = c.finance.revenueStartMonth;
      const startD = parseISO(`${startStr}-01`);
      
      // Calculate revenue up to current month by evaluating each month since start
      const isStockType = g === 'HP制作' || g === 'SNS運用';
      let caseTotal = 0;
      
      // Collect monthly increments
      const caseHistory: { month: string, amount: number }[] = [];
      
      if (isStockType) {
        const recM = c.finance.oneTimeFeeMonth || startStr;
        const recD = parseISO(`${recM}-01`);
        if (!isAfter(recD, nowD)) {
           caseHistory.push({ month: recM, amount: c.finance.oneTimeFee || 0 });
           caseTotal += c.finance.oneTimeFee || 0;
        }
        if (!isAfter(startD, nowD)) {
           const months = differenceInMonths(nowD, startD) + 1;
           for(let i=0; i<months; i++) {
              const mStr = format(addMonths(startD, i), 'yyyy-MM');
              caseHistory.push({ month: mStr, amount: c.finance.maintenanceFee || 0 });
              caseTotal += c.finance.maintenanceFee || 0;
           }
        }
      } else {
        const recM = c.finance.spotMonth || startStr;
        const recD = parseISO(`${recM}-01`);
        if (!isAfter(recD, nowD)) {
           caseHistory.push({ month: recM, amount: c.finance.spotFee || 0 });
           caseTotal += c.finance.spotFee || 0;
        }
      }
      
      totals[t] += caseTotal;
      
      // Merge into class history
      caseHistory.forEach(h => {
        if (h.amount > 0) {
           const existing = history[t].find(x => x.month === h.month);
           if (existing) existing.revenue += h.amount;
           else history[t].push({ month: h.month, revenue: h.amount });
        }
      });
    });

    // Compute stats for each class
    const result: Record<ClassType, any> = {} as any;
    (['mage', 'merchant', 'hero'] as ClassType[]).forEach(t => {
       const rev = totals[t];
       const level = Math.floor(rev / 100000);
       const tier = getTierFromRevenue(rev);
       const jobName = CLASS_INFO[t].jobs[tier - 1];
       const nextThreshold = TIER_THRESHOLDS.find(th => th.tier === tier + 1);
       const nextLevel = nextThreshold ? nextThreshold.level : null;
       const toNext = nextLevel ? nextLevel - level : 0;
       const progress = nextThreshold ? Math.min(100, (rev - TIER_THRESHOLDS[tier-1].min) / (nextThreshold.min - TIER_THRESHOLDS[tier-1].min) * 100) : 100;
       
       // Calculate first month achieving current tier
       history[t].sort((a,b) => a.month.localeCompare(b.month));
       let acc = 0;
       let achieveMonth = "----";
       const targetMin = TIER_THRESHOLDS[tier-1].min;
       for(const h of history[t]) {
          acc += h.revenue;
          if (acc >= targetMin && targetMin > 0) {
             achieveMonth = h.month;
             break;
          }
       }
       if (tier === 1) achieveMonth = "INITIAL";

       // Fill empty months for chart (last 6 months)
       const chartData = [];
       for(let i=5; i>=0; i--) {
          const mStr = format(addMonths(nowD, -i), 'yyyy-MM');
          const found = history[t].find(x => x.month === mStr);
          chartData.push({ month: format(parseISO(`${mStr}-01`), 'MMM'), value: found ? found.revenue : 0 });
       }

       result[t] = {
         revenue: rev,
         level: Math.max(1, level),
         tier,
         jobName,
         toNext,
         progress,
         achieveMonth,
         count: counts[t],
         chartData
       };
    });

    return result;
  }, [cases]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans pb-20 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="bg-card p-8 rounded-lg border border-border flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <Castle className="w-16 h-16 text-primary mb-4 relative z-10" />
        <h1 className="text-3xl font-black tracking-widest text-foreground uppercase relative z-10 font-[family-name:var(--font-outfit)]">TEMPLE STATUS</h1>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-60 mt-2 relative z-10">稼ぎをチカラに。神殿ステータス</p>
      </div>

      {/* 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {(['mage', 'merchant', 'hero'] as ClassType[]).map((type) => {
          const stats = data[type];
          const info = CLASS_INFO[type];
          
          return (
            <Card key={type} className="bg-card border-border overflow-hidden relative group">
              <div className={cn("absolute top-0 left-0 w-full h-1", info.bgClass)} />
              
              <CardContent className="p-8 space-y-8">
                {/* Avatar & Level */}
                <div className="flex gap-6 items-center">
                  <AvatarNode classType={type} tier={stats.tier} />
                  <div className="flex-1 min-w-0">
                    <span className={cn("text-[9px] font-black uppercase tracking-widest mb-1 block", info.colorClass)}>{info.subTitle}</span>
                    <h2 className="text-2xl font-black tracking-tight text-foreground leading-tight mb-2 truncate">{stats.jobName}</h2>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-black font-[family-name:var(--font-outfit)] leading-none">Lv.{stats.level}</span>
                      <span className="text-[10px] font-bold text-muted-foreground mb-1">({stats.tier}次職)</span>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">NEXT JOB</span>
                    <span className="text-xs font-black uppercase">{stats.toNext > 0 ? `あと ${stats.toNext} Lv` : 'MAX TIER'}</span>
                  </div>
                  <Progress value={stats.progress} className={cn("h-2 bg-secondary", `[&>div]:${info.bgClass}`)} />
                </div>

                {/* Stats List */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">累計売上額</span>
                    <span className="text-lg font-black tracking-tight">¥{stats.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">対応案件数</span>
                    <span className="text-base font-bold">{stats.count} 件</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">前回昇格年月</span>
                    <span className="text-sm font-bold text-primary">{stats.achieveMonth}</span>
                  </div>
                </div>

                {/* Chart */}
                <div className="pt-4 border-t border-border">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-4">MONTHLY REVENUE TREND (6 MONTHS)</span>
                  <div className="h-[120px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.chartData}>
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'bold', fill: '#94a3b8'}} />
                        <Tooltip cursor={{fill: 'var(--secondary)'}} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontSize: '10px', fontWeight: 'bold' }} formatter={(v: any) => `¥${v.toLocaleString()}`} />
                        <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                          {stats.chartData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} className={info.colorClass.replace('text-', 'fill-')} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Roadmap */}
      <Card className="bg-card border-border mt-12">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <Star className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-base font-black tracking-tight uppercase">CLASS ROADMAP</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">転職の必要レベルと条件</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {TIER_THRESHOLDS.map((t, idx) => (
              <div key={t.tier} className={cn("p-4 rounded-lg border", idx === 0 ? "border-muted bg-secondary/50" : "border-border bg-card")}>
                <div className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">TIER {t.tier}</div>
                <div className="text-lg font-black font-[family-name:var(--font-outfit)] leading-none mb-2">Lv.{t.level} ~</div>
                <div className="text-[10px] font-bold text-muted-foreground">累計 ¥{(t.min/10000).toLocaleString()}万</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
