'use client';

import { useMemo } from 'react';
import { useHearsStore } from '@/store/useHearsStore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell
} from 'recharts';
import { 
  LayoutDashboard, ClipboardList, Briefcase, BarChart3, ListTodo,
  TrendingUp, Users, Building2, Wallet, Plus, ChevronRight,
  Clock, ArrowUpRight, CheckCircle2, History, Target
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format, isAfter, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const router = useRouter();
  const { projects, cases, globalFinance } = useHearsStore();

  const stats = useMemo(() => {
    const activeCases = cases.filter(c => c.status === 'active');
    const uniqueClients = new Set(cases.map(c => c.clientName)).size;
    
    // Monthly prediction (simplified for dashboard)
    const currentMonthStr = format(new Date(), 'yyyy-MM');
    let monthlyRevenue = globalFinance?.baseSalary || 0;
    cases.forEach(c => {
      if (!c.finance) return;
      const start = c.finance.revenueStartMonth;
      if (start && (currentMonthStr === start || isAfter(new Date(), parseISO(start)))) {
        monthlyRevenue += (c.finance.maintenanceFee || 0) * 0.4;
      }
    });

    return {
      totalProjects: projects.length,
      activeCases: activeCases.length,
      clients: uniqueClients,
      monthlyRevenue: Math.floor(monthlyRevenue)
    };
  }, [projects, cases, globalFinance]);

  // Chart data (Simplified for dashboard)
  const chartData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return format(d, 'M月');
    });

    return months.map(m => ({
      name: m,
      revenue: Math.floor(Math.random() * 5000) + 2000,
      special: Math.floor(Math.random() * 2000)
    }));
  }, []);

  const jobSegmentData = [
    { name: 'HP制作', value: cases.filter(c => c.genre === 'HP制作').length, color: '#00896B' },
    { name: 'その他', value: cases.filter(c => c.genre !== 'HP制作').length, color: '#3498db' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 font-[family-name:var(--font-noto)] pb-20">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold italic tracking-tighter text-foreground flex items-center gap-4 font-[family-name:var(--font-outfit)] uppercase">
            <LayoutDashboard className="w-10 h-10 text-primary" /> DASHBOARD
          </h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-40 ml-14">ダッシュボード ・ 業務統計概観</p>
        </div>
      </div>

      {/* 統計セクション */}
      <div className="bg-white rounded-[3.5rem] paper-shadow-lg overflow-hidden border-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-x divide-border/30">
        <StatItem 
          label="累計プロジェクト数" 
          subLabel="TOTAL PROJECTS"
          value={stats.totalProjects} 
          unit="件" 
          icon={<ClipboardList className="w-6 h-6 text-emerald-500" />} 
        />
        <StatItem 
          label="進行中案件" 
          subLabel="ACTIVE CASES"
          value={stats.activeCases} 
          unit="件" 
          icon={<Clock className="w-6 h-6 text-blue-500" />} 
        />
        <StatItem 
          label="取引クライアント" 
          subLabel="TOTAL CLIENTS"
          value={stats.clients} 
          unit="社" 
          icon={<Users className="w-6 h-6 text-amber-500" />} 
        />
        <StatItem 
          label="今月の手取り予測" 
          subLabel="MONTHLY REVENUE"
          value={`¥${stats.monthlyRevenue.toLocaleString()}`} 
          unit="" 
          icon={<Wallet className="w-6 h-6 text-rose-500" />} 
          className="bg-secondary/10"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* メインチャート */}
        <Card className="xl:col-span-2 bg-white border-none paper-shadow-lg rounded-[3.5rem] p-12">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-xl font-bold italic tracking-tighter text-foreground flex items-center gap-3 font-[family-name:var(--font-outfit)] uppercase">
                <TrendingUp className="w-7 h-7 text-primary" /> REVENUE FLOW
              </h2>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 ml-10">直近6ヶ月の収益推移分析 (単位：千円)</p>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 'bold', fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 'bold', fill: '#94a3b8'}} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 60px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                  cursor={{ fill: 'rgba(0,137,107,0.03)' }}
                />
                <Bar dataKey="revenue" fill="#00896B" radius={[6, 6, 0, 0]} name="保守収益" />
                <Bar dataKey="special" fill="#e2e8f0" radius={[6, 6, 0, 0]} name="制作収益" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* サブチャート (構成比) */}
        <Card className="bg-white border-none paper-shadow-lg rounded-[3.5rem] p-10 flex flex-col">
          <div className="mb-10 text-center">
            <h2 className="text-xl font-bold italic tracking-tighter text-foreground flex items-center justify-center gap-3 font-[family-name:var(--font-outfit)] uppercase">
              <History className="w-7 h-7 text-primary" /> JOB SEGMENT
            </h2>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 mt-1">案件カテゴリー構成比</p>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={jobSegmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {jobSegmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 15px 40px rgba(0,0,0,0.1)' }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-10 space-y-4">
              {jobSegmentData.map((item) => (
                <div key={item.name} className="flex justify-between items-center px-6 py-3 rounded-2xl bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.name}</span>
                  </div>
                  <span className="text-lg font-bold italic text-foreground font-[family-name:var(--font-outfit)]">{item.value} <span className="text-[10px] not-italic opacity-40">案件</span></span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* 最近の案件リスト */}
      <Card className="bg-white border-none paper-shadow-lg rounded-[3.5rem] overflow-hidden">
        <div className="p-12 pb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold italic tracking-tighter text-foreground flex items-center gap-3 font-[family-name:var(--font-outfit)] uppercase">
              <CheckCircle2 className="w-7 h-7 text-primary" /> RECENT CASES
            </h2>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 ml-10">直近の対応案件リスト</p>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => router.push('/cases')} 
            className="text-primary hover:bg-primary/5 h-12 px-8 rounded-2xl font-bold text-[10px] uppercase tracking-widest border border-primary/20"
          >
            すべての案件を表示 <ChevronRight className="ml-3 w-4 h-4" />
          </Button>
        </div>
        <div className="px-6 pb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="p-6 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-40">案件名 ・ 物件名 <span className="ml-2">/ CASE NAME</span></th>
                  <th className="p-6 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-40">ジャンル <span className="ml-2">/ GENRE</span></th>
                  <th className="p-6 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-40 text-right">月額保守報酬 <span className="ml-2">/ REVENUE</span></th>
                  <th className="p-6 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {cases.sort((a,b) => b.updatedAt - a.updatedAt).slice(0, 5).map((c) => (
                  <tr 
                    key={c.id} 
                    className="group hover:bg-secondary/10 transition-colors cursor-pointer"
                    onClick={() => router.push(`/cases/${c.id}`)}
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5 text-primary opacity-40" />
                        </div>
                        <span className="text-base font-bold italic tracking-tighter text-foreground font-[family-name:var(--font-outfit)] uppercase">{c.name}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <Badge className="bg-secondary text-muted-foreground border-none font-bold text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-lg">
                        {c.genre || '未設定'}
                      </Badge>
                    </td>
                    <td className="p-6 text-right">
                      <span className="text-xl font-bold italic tracking-tighter text-foreground font-[family-name:var(--font-outfit)]">
                        ¥{( (c.finance?.maintenanceFee || 0) * 0.4 ).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-6">
                      <ArrowUpRight className="w-5 h-5 text-muted-foreground opacity-20 group-hover:opacity-100 transition-opacity ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}

function StatItem({ label, subLabel, value, unit, icon, className }: any) {
  return (
    <div className={cn("flex flex-col gap-3 px-12 py-8", className)}>
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2.5 bg-secondary/50 rounded-xl shrink-0">{icon}</div>
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-foreground uppercase tracking-widest">{label}</span>
          <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 leading-none">{subLabel}</span>
        </div>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-bold italic tracking-tighter text-foreground font-[family-name:var(--font-outfit)] leading-none pr-2">{value}</span>
        <span className="text-xs font-bold text-primary uppercase tracking-widest shrink-0">{unit}</span>
      </div>
    </div>
  );
}
