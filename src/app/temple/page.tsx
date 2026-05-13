'use client';
import Image from 'next/image';

import { useMemo } from 'react';
import { useHearsStore, CaseData } from '@/store/useHearsStore';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { parseISO, isAfter, startOfMonth, format, min, addMonths, differenceInMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Crown, Sparkles, Sword, Coins, ArrowUpRight, Flame, Shield, Star, Wand2, Castle, ChevronDown } from 'lucide-react';

const TIER_THRESHOLDS = [
  { tier: 1, level: 1, min: 0, title: "初期ジョブ" },
  { tier: 2, level: 20, min: 2000000, title: "最初の壁を突破した専門家" },
  { tier: 3, level: 50, min: 5000000, title: "業界で自立した実力者" },
  { tier: 4, level: 100, min: 10000000, title: "卓越した技術を持つ熟練者" },
  { tier: 5, level: 500, min: 50000000, title: "極致に至った伝説の存在" }
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
    <div className={cn(
      "relative w-24 h-24 flex items-center justify-center shrink-0",
      tier >= 3 && info.glowClass
    )}>
      {/* Ambient Glow / Platform Base */}
      <div className={cn("absolute inset-0 opacity-30 rounded-full blur-md animate-pulse", info.bgClass)} />
      
      {/* Rotating Magic Circle */}
      <div className={cn("absolute inset-0 flex items-center justify-center opacity-50", info.colorClass)}>
        <svg viewBox="0 0 100 100" className="w-24 h-24 animate-[spin_15s_linear_infinite]">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <polygon points="50,10 85,75 15,75" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <polygon points="50,90 85,25 15,25" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>
      
      {/* Tier 5 God Aura */}
      {tier >= 5 && <div className={cn("absolute inset-0 opacity-50 mix-blend-screen animate-aura-pulse rounded-full", info.bgClass)} style={{ filter: 'blur(10px)' }} />}

      {/* Tiers 3+ Light Rays */}
      {tier >= 3 && <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 animate-shimmer rounded-full" />}

      {/* Floating Particles for Mage */}
      {classType === 'mage' && tier >= 3 && (
        <>
          <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-particle-float" style={{ animationDelay: '0s' }} />
          <div className="absolute bottom-4 right-3 w-2 h-2 rounded-full bg-emerald-300 animate-particle-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/4 w-1 h-1 rounded-full bg-emerald-200 animate-particle-float" style={{ animationDelay: '2s' }} />
        </>
      )}

      {/* Golden Coins for Merchant */}
      {classType === 'merchant' && tier >= 3 && (
        <>
          <div className="absolute bottom-1 left-2 w-2 h-2 bg-yellow-400 rounded-full animate-bounce shadow-[0_0_8px_rgba(250,204,21,0.8)]" style={{ animationDuration: '2s' }} />
          <div className="absolute bottom-2 right-2 w-3 h-3 bg-yellow-500 rounded-full animate-bounce shadow-[0_0_8px_rgba(250,204,21,0.8)]" style={{ animationDuration: '2.5s' }} />
        </>
      )}

      {/* Hero Aura */}
      {classType === 'hero' && tier >= 4 && (
        <div className="absolute -bottom-4 w-[150%] h-12 bg-blue-500/30 blur-xl animate-aura-pulse rounded-full" />
      )}

      {/* Action Animation Wrapper */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center",
        classType === 'hero' && "animate-hero-attack",
        classType === 'mage' && "animate-mage-cast",
        classType === 'merchant' && "animate-merchant-jump"
      )}>
        {/* Ground Shadow */}
        <div className="absolute bottom-2 w-12 h-3 bg-black/40 blur-[2px] rounded-[100%]" />

        {/* Character Image (Transparent PNG) */}
        <div className={cn(
          "relative w-24 h-24 transition-transform duration-700 animate-idle-bob",
          tier >= 2 && "scale-110",
          tier >= 4 && "scale-125",
          tier >= 5 && "drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
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

      {/* Hero Slash Effect */}
      {classType === 'hero' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 mix-blend-screen overflow-visible">
          <div className="w-32 h-32 opacity-0 animate-slash-effect absolute">
            <svg viewBox="0 0 100 100" className="w-full h-full text-white drop-shadow-[0_0_10px_rgba(255,255,255,1)]">
              <path d="M 10,90 Q 50,50 90,10 L 100,0 L 90,10 Q 50,40 10,90 Z" fill="currentColor" />
            </svg>
          </div>
        </div>
      )}

      {/* Mage Magic Burst */}
      {classType === 'mage' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 mix-blend-screen">
          <div className="w-24 h-24 opacity-0 animate-magic-burst">
            <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,1)]">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10 5" />
              <polygon points="50,10 90,90 10,90" fill="none" stroke="currentColor" strokeWidth="1" />
              <polygon points="50,90 90,10 10,10" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>
        </div>
      )}

      {/* Merchant Coin Rain */}
      {classType === 'merchant' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-full h-full opacity-0 animate-coin-rain flex justify-around">
            <div className="w-3 h-3 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,1)]" />
            <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-[0_0_10px_rgba(250,204,21,1)] mt-4" />
            <div className="w-3 h-3 bg-yellow-300 rounded-full shadow-[0_0_10px_rgba(250,204,21,1)] mt-2" />
          </div>
        </div>
      )}

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
    const casesInClass: Record<ClassType, {name: string, rev: number}[]> = { mage: [], merchant: [], hero: [] };
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
      if (caseTotal > 0) {
        casesInClass[t].push({ name: c.name, rev: caseTotal });
      }
      
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
         currentTitle,
         toNext,
         progress,
         achieveMonth,
         count: counts[t],
         cases: casesInClass[t].sort((a,b) => b.rev - a.rev),
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
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">NEXT JOB</span>
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
                       累計売上額 & 案件数
                       <ChevronDown className={cn("w-3 h-3 transition-transform", expandedClass === type && "rotate-180")} />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div className="text-base font-bold">{stats.count} <span className="text-[10px]">件</span></div>
                    <div className="text-xl font-black tracking-tight">¥{stats.revenue.toLocaleString()}</div>
                  </div>

                  {expandedClass === type && (
                    <div className="mt-2 bg-secondary/30 rounded-md p-3 space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2">
                      {stats.cases.map((c: any, i: number) => (
                        <div key={i} className="flex justify-between items-center pb-2 border-b border-border/50 last:border-0 last:pb-0">
                          <span className="text-xs font-bold truncate max-w-[120px]">{c.name}</span>
                          <span className="text-xs font-black text-primary">¥{c.rev.toLocaleString()}</span>
                        </div>
                      ))}
                      {stats.cases.length === 0 && <span className="text-[10px] opacity-50">案件がありません</span>}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
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
              <h3 className="text-base font-black tracking-tight uppercase">CLASS ROADMAP</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">転職の必要レベルと条件</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {TIER_THRESHOLDS.map((t, idx) => (
              <div key={t.tier} className={cn("p-4 rounded-lg border flex flex-col h-full", idx === 0 ? "border-muted bg-secondary/50" : "border-border bg-card")}>
                <div className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">TIER {t.tier}</div>
                <div className="text-lg font-black font-[family-name:var(--font-outfit)] leading-none mb-2">Lv.{t.level} ~</div>
                <div className="text-[10px] font-bold text-muted-foreground mb-3">累計 ¥{(t.min/10000).toLocaleString()}万</div>
                <div className="text-[8px] font-bold text-muted-foreground mt-auto pt-3 border-t border-border/50">{t.title}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
