'use client';
import Image from 'next/image';

import { useMemo } from 'react';
import { useHearsStore, CaseData } from '@/store/useHearsStore';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { parseISO, isAfter, startOfMonth, format, min, addMonths, differenceInMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Crown, Sparkles, Sword, Coins, ArrowUpRight, Flame, Shield, Star, Wand2, Castle, ChevronDown } from 'lucide-react';

const TIER_THRESHOLDS = [
  { tier: 1, level: 1, min: 0, title: "初期ジョブ", jobs: { mage: "魔法使い", merchant: "商人", hero: "勇者" }, image: "/assets/avatars/tier1.png" },
  { tier: 2, level: 20, min: 2000000, title: "最初の壁を突破した専門家", jobs: { mage: "魔導師", merchant: "豪商", hero: "騎士" }, image: "/assets/avatars/tier2.png" },
  { tier: 3, level: 50, min: 5000000, title: "業界で自立した実力者", jobs: { mage: "大賢者", merchant: "資本家", hero: "聖騎士" }, image: "/assets/avatars/tier3.png" },
  { tier: 4, level: 100, min: 10000000, title: "卓越した技術を持つ熟練者", jobs: { mage: "真魔導学者", merchant: "大富豪", hero: "剣聖" }, image: "/assets/avatars/tier4.png" },
  { tier: 5, level: 500, min: 50000000, title: "極致に至った伝説の存在", jobs: { mage: "真理の探求者", merchant: "盤上の支配者", hero: "終焉を断つ者" }, image: "/assets/avatars/tier5.png" },
];

type ClassType = 'mage' | 'merchant' | 'hero';

const CLASS_INFO = {
  mage: {
    title: "魔法使い系統",
    subTitle: "Web / SNS 開発",
    imageSrc: "/assets/avatars/mage.png",
    jobs: ["魔法使い", "魔導師", "大賢者", "真魔導学者", "真理の探求者"],
    colorClass: "text-emerald-500",
    bgClass: "bg-emerald-500",
    borderClass: "border-emerald-500/30",
    glowClass: "shadow-emerald-500/50",
    fillColor: "#10b981"
  },
  merchant: {
    title: "商人系統",
    subTitle: "SiGMARK",
    imageSrc: "/assets/avatars/merchant.png",
    jobs: ["商人", "豪商", "資本家", "大富豪", "盤上の支配者"],
    colorClass: "text-amber-500",
    bgClass: "bg-amber-500",
    borderClass: "border-amber-500/30",
    glowClass: "shadow-amber-500/50",
    fillColor: "#f59e0b"
  },
  hero: {
    title: "勇者系統",
    subTitle: "OTHER GENRES",
    imageSrc: "/assets/avatars/hero.png",
    jobs: ["勇者", "騎士", "聖騎士", "剣聖", "終焉を断つ者"],
    colorClass: "text-blue-500",
    bgClass: "bg-blue-500",
    borderClass: "border-blue-500/30",
    glowClass: "shadow-blue-500/50",
    fillColor: "#3b82f6"
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
  
  return (
    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
      {/* Ambient Glow / Platform Base */}
      <div className={cn("absolute inset-0 opacity-30 rounded-full blur-md", info.bgClass)} />
      
      {/* Action Animation Wrapper (Animations Removed) */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Ground Shadow */}
        <div className="absolute bottom-2 w-12 h-3 bg-black/40 blur-[2px] rounded-[100%]" />

        {/* Character Image (Transparent PNG, No Bobbing Animation) */}
        <div className={cn(
          "relative w-24 h-24 transition-transform duration-700",
          tier >= 2 && "scale-110",
          tier >= 4 && "scale-125"
        )}>
          <Image 
            src={info.imageSrc} 
            alt={`${info.title} Avatar`}
            fill
            className="object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      </div>

      <div className="absolute bottom-1 right-1 text-[10px] font-black opacity-40 z-10">T{tier}</div>
    </div>
  );
};

export default function TemplePage() {
  const { cases } = useHearsStore();

  const data = useMemo(() => {
    const nowD = startOfMonth(new Date());
    
    const totals = { mage: 0, merchant: 0, hero: 0 };
    const counts = { mage: 0, merchant: 0, hero: 0 };
    const casesInClass: Record<ClassType, CaseData[]> = { mage: [], merchant: [], hero: [] };
    const history: Record<ClassType, { month: string, revenue: number }[]> = { mage: [], merchant: [], hero: [] };
    
    // For expanded stats
    const maintenanceTotals = { mage: 0, merchant: 0, hero: 0 };
    const spotTotals = { mage: 0, merchant: 0, hero: 0 };

    cases.forEach(c => {
      const g = c.genre || '';
      const t: ClassType = (g === 'HP制作' || g === 'SNS運用') ? 'mage' : (g === 'SiGMARK') ? 'merchant' : 'hero';
      
      if (!c.finance || !c.finance.revenueStartMonth) return;
      counts[t]++;
      casesInClass[t].push(c);
      
      const startStr = c.finance.revenueStartMonth;
      const startD = parseISO(`${startStr}-01`);
      
      // Calculate revenue up to current month
      const isStockType = g === 'HP制作' || g === 'SNS運用';
      let caseTotal = 0;
      let caseMaintenance = 0;
      let caseSpot = 0;
      
      const caseHistory: { month: string, amount: number }[] = [];
      
      if (isStockType) {
        const recM = c.finance.oneTimeFeeMonth || startStr;
        const recD = parseISO(`${recM}-01`);
        if (!isAfter(recD, nowD)) {
           const amt = c.finance.oneTimeFee || 0;
           caseHistory.push({ month: recM, amount: amt });
           caseTotal += amt;
           caseSpot += amt;
        }
        if (!isAfter(startD, nowD)) {
           const months = differenceInMonths(nowD, startD) + 1;
           for(let i=0; i<months; i++) {
              const mStr = format(addMonths(startD, i), 'yyyy-MM');
              const amt = c.finance.maintenanceFee || 0;
              caseHistory.push({ month: mStr, amount: amt });
              caseTotal += amt;
              caseMaintenance += amt;
           }
        }
      } else {
        const recM = c.finance.spotMonth || startStr;
        const recD = parseISO(`${recM}-01`);
        if (!isAfter(recD, nowD)) {
           const amt = c.finance.spotFee || 0;
           caseHistory.push({ month: recM, amount: amt });
           caseTotal += amt;
           caseSpot += amt;
        }
      }
      
      totals[t] += caseTotal;
      maintenanceTotals[t] += caseMaintenance;
      spotTotals[t] += caseSpot;
      
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
       const currentTitle = TIER_THRESHOLDS.find(th => th.tier === tier)?.title || "";
       const nextThreshold = TIER_THRESHOLDS.find(th => th.tier === tier + 1);
       const nextLevel = nextThreshold ? nextThreshold.level : null;
       const toNext = nextLevel ? nextLevel - level : 0;
       const progress = nextThreshold ? Math.min(100, (rev - TIER_THRESHOLDS[tier-1].min) / (nextThreshold.min - TIER_THRESHOLDS[tier-1].min) * 100) : 100;
       
       // Top Clients
       const clientMap: Record<string, { name: string, count: number, revenue: number }> = {};
       casesInClass[t].forEach(c => {
         if (!clientMap[c.clientName]) clientMap[c.clientName] = { name: c.clientName, count: 0, revenue: 0 };
         clientMap[c.clientName].count++;
         // This is a rough estimation of client revenue within class
         const cRev = (c.finance.oneTimeFee || 0) + (c.finance.spotFee || 0);
         clientMap[c.clientName].revenue += cRev;
         // Add maintenance if applicable
         if (c.genre === 'HP制作' || c.genre === 'SNS運用') {
            const startD = parseISO(`${c.finance.revenueStartMonth}-01`);
            if (!isAfter(startD, nowD)) {
               const months = differenceInMonths(nowD, startD) + 1;
               clientMap[c.clientName].revenue += (c.finance.maintenanceFee || 0) * months;
            }
         }
       });
       const topClients = Object.values(clientMap).sort((a,b) => b.revenue - a.revenue).slice(0, 3);
       const revenueToNextLevel = nextThreshold ? Math.max(0, nextThreshold.min - rev) : 0;

       // Calculate achieve month
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
         currentTitle,
         toNext,
         progress,
         achieveMonth,
         count: counts[t],
         maintenanceTotal: maintenanceTotals[t],
         spotTotal: spotTotals[t],
         topClients,
         revenueToNextLevel,
         chartData
       };
    });

    return result;
  }, [cases]);

  const [expandedClass, setExpandedClass] = useState<ClassType | null>(null);

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
                    <span className={cn("text-xs font-black uppercase tracking-widest mb-1 block", info.colorClass)}>{info.subTitle}</span>
                    <h2 className="text-2xl font-black tracking-tight text-foreground leading-tight truncate mb-1">{stats.jobName}</h2>
                    <div className="text-[9px] font-bold text-muted-foreground opacity-80 mb-2">&quot;{stats.currentTitle}&quot;</div>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-black font-[family-name:var(--font-outfit)] leading-none">Lv.{stats.level}</span>
                      <span className="text-[10px] font-bold text-muted-foreground mb-1">({stats.tier}次職)</span>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">NEXT JOB (次の目標)</span>
                    <span className="text-xs font-black uppercase">{stats.toNext > 0 ? `あと ${stats.toNext} Lv` : 'MAX TIER'}</span>
                  </div>
                  <Progress value={stats.progress} className={cn("h-2 bg-secondary", `[&>div]:${info.bgClass}`)} />
                </div>

                {/* Stats List */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <div 
                    className="flex justify-between items-center cursor-pointer hover:opacity-80 transition-opacity" 
                    onClick={() => setExpandedClass(expandedClass === type ? null : type)}
                  >
                    <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                       詳細ステータス & 討伐記録
                       <ChevronDown className={cn("w-3 h-3 transition-transform", expandedClass === type && "rotate-180")} />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div className="text-base font-bold">{stats.count} <span className="text-[10px]">件</span></div>
                    <div className="text-xl font-black tracking-tight">¥{stats.revenue.toLocaleString()}</div>
                  </div>

                  {expandedClass === type && (
                    <div className="mt-2 bg-secondary/30 rounded-md p-4 space-y-4 animate-in slide-in-from-top-2">
                      <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border/50">
                        <div>
                          <div className="text-[9px] font-bold text-muted-foreground uppercase">保守累計</div>
                          <div className="text-sm font-black">¥{stats.maintenanceTotal.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-muted-foreground uppercase">制作・スポット累計</div>
                          <div className="text-sm font-black">¥{stats.spotTotal.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-muted-foreground uppercase">総合計</div>
                          <div className="text-sm font-black text-primary">¥{stats.revenue.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-muted-foreground uppercase">次ランクまで</div>
                          <div className="text-sm font-black text-amber-500">¥{stats.revenueToNextLevel.toLocaleString()}</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-[9px] font-bold text-muted-foreground uppercase mb-2 tracking-widest">討伐記録 (収益TOP3取引先)</div>
                        <div className="space-y-2">
                          {stats.topClients.map((client: any, i: number) => (
                            <div key={i} className="flex justify-between items-center bg-background/50 p-2 rounded border border-border/30">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-primary">#{i+1}</span>
                                <span className="text-xs font-bold truncate max-w-[100px]">{client.name}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-[10px] font-black">¥{client.revenue.toLocaleString()}</div>
                                <div className="text-[8px] font-bold text-muted-foreground">{client.count} 案件</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">前回昇格年月</span>
                    <span className="text-sm font-bold text-primary">{stats.achieveMonth}</span>
                  </div>
                </div>

                {/* Chart */}
                <div className="pt-4 border-t border-border">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-4">MONTHLY REVENUE TREND (月別収益推移)</span>
                  <div className="h-[140px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 'bold', fill: '#94a3b8'}} />
                        <Tooltip cursor={{fill: 'var(--secondary)'}} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontSize: '10px', fontWeight: 'bold' }} formatter={(v: any) => `¥${v.toLocaleString()}`} />
                        <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                          <LabelList dataKey="value" position="top" formatter={(v: any) => `¥${(v/10000).toFixed(0)}万`} style={{ fontSize: '8px', fontWeight: 'bold', fill: '#94a3b8' }} />
                          {stats.chartData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={info.fillColor} />
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
              <h3 className="text-base font-black tracking-tight uppercase">CLASS ROADMAP (クラスと転職)</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">転職の必要レベルと条件</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {TIER_THRESHOLDS.map((t, idx) => (
              <div key={t.tier} className={cn("p-4 rounded-lg border flex flex-col h-full relative overflow-hidden", idx === 0 ? "border-muted bg-secondary/50" : "border-border bg-card")}>
                <div className="absolute top-2 right-2 w-10 h-10 opacity-60">
                   <Image src={t.image} alt={`Tier ${t.tier} Badge`} width={40} height={40} style={{ imageRendering: 'pixelated' }} />
                </div>
                <div className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">TIER {t.tier}</div>
                <div className="text-lg font-black font-[family-name:var(--font-outfit)] leading-none mb-2">Lv.{t.level} ~</div>
                <div className="text-[10px] font-bold text-muted-foreground mb-3">累計 ¥{(t.min/10000).toLocaleString()}万</div>
                
                <div className="space-y-1 mt-auto pt-3 border-t border-border/50">
                  <div className="flex justify-between items-center text-[8px] font-bold">
                    <span className="text-emerald-500">魔法: {t.jobs.mage}</span>
                  </div>
                  <div className="flex justify-between items-center text-[8px] font-bold">
                    <span className="text-amber-500">商人: {t.jobs.merchant}</span>
                  </div>
                  <div className="flex justify-between items-center text-[8px] font-bold">
                    <span className="text-blue-500">勇者: {t.jobs.hero}</span>
                  </div>
                  <div className="text-[7px] font-bold text-muted-foreground mt-1 opacity-60 italic">{t.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
