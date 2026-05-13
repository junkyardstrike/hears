'use client';

import { useState, useMemo } from 'react';
import { useHearsStore, ClientData, CaseData } from '@/store/useHearsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Building2, Plus, Trash2, Edit, Save, X, Search,
  Users, Briefcase, ChevronDown, ChevronUp, Check, LayoutDashboard, ArrowUpRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function ClientsDashboard() {
  const router = useRouter();
  const { clients, createClient, updateClient, deleteClient, cases } = useHearsStore();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ClientData>>({});
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);

  const clientsWithStats = useMemo(() => {
    const filtered = clients.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.managerName || '').toLowerCase().includes(search.toLowerCase())
    );

    const now = new Date();
    
    return filtered.map(c => {
      const clientCasesRaw = cases.filter(item => item.clientId === c.id || item.contractEntity === c.name);
      
      let clientTotalGross = 0;
      let clientTotalStock = 0;
      let clientTotalShot = 0;

      const clientCases = clientCasesRaw.map(caseItem => {
        let caseGross = 0;
        let caseStock = 0;
        let caseShot = 0;
        let monthsActive = 0;
        let recognitionMonth = '';
        
        if (!caseItem.finance) return { ...caseItem, caseGross, caseStock, caseShot, monthsActive, recognitionMonth };
        
        const isStockType = caseItem.genre === 'HP制作' || caseItem.genre === 'SNS運用';
        if (isStockType) {
          caseShot = caseItem.finance.oneTimeFee || 0;
          recognitionMonth = caseItem.finance.oneTimeFeeMonth || caseItem.finance.revenueStartMonth || '';
          
          const startStr = caseItem.finance.revenueStartMonth;
          if (startStr) {
            const startYear = parseInt(startStr.split('-')[0]);
            const startMonth = parseInt(startStr.split('-')[1]) - 1;
            const startD = new Date(startYear, startMonth, 1);
            const nowD = new Date(now.getFullYear(), now.getMonth(), 1);
            if (nowD >= startD) {
               monthsActive = (nowD.getFullYear() - startD.getFullYear()) * 12 + (nowD.getMonth() - startD.getMonth()) + 1;
               caseStock = (caseItem.finance.maintenanceFee || 0) * monthsActive;
            }
          }
        } else {
          caseShot = caseItem.finance.spotFee || 0;
          recognitionMonth = caseItem.finance.spotMonth || caseItem.finance.revenueStartMonth || '';
        }
        
        caseGross = caseStock + caseShot;
        clientTotalGross += caseGross;
        clientTotalStock += caseStock;
        clientTotalShot += caseShot;
        
        return { ...caseItem, caseGross, caseStock, caseShot, monthsActive, recognitionMonth };
      }).sort((a,b) => b.updatedAt - a.updatedAt);

      return {
        ...c,
        clientCases,
        clientTotalGross,
        clientTotalStock,
        clientTotalShot
      };
    }).sort((a, b) => b.clientTotalGross - a.clientTotalGross);
  }, [clients, search, cases]);

  const handleAdd = () => {
    const name = prompt('取引先法人名を入力してください', '新規取引先');
    if (name) createClient(name);
  };

  const startEdit = (c: ClientData, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditForm(c);
  };

  const saveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editingId && editForm.name) {
      updateClient(editingId, (draft) => {
        Object.assign(draft, editForm);
      });
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 font-sans">
      {/* ヘッダー */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-card p-6 lg:p-8 rounded-lg border border-border">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-4 mb-2">
            <h2 className="text-3xl font-bold italic tracking-tighter text-foreground flex items-center gap-4 uppercase font-[family-name:var(--font-outfit)]">
              <Building2 className="w-10 h-10 text-primary" /> CLIENTS DASHBOARD
            </h2>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-40 ml-14">取引先別 案件管理ダッシュボード</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto shrink-0">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40" />
            <Input 
              placeholder="法人名で検索... / SEARCH" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-14 bg-input border-none rounded-md font-bold text-xs"
            />
          </div>
          <Button onClick={handleAdd} className="bg-primary hover:brightness-110 text-primary-foreground font-bold h-14 px-8 rounded-md transition-all active:scale-95 shrink-0 flex items-center gap-3">
            <Plus className="w-7 h-7" />
            <span className="flex flex-col items-start leading-none uppercase italic tracking-tight text-left">
              <span className="text-[12px] font-black">NEW CLIENT</span>
              <span className="text-[9px] font-bold opacity-60 mt-1">新規取引先登録</span>
            </span>
          </Button>
        </div>
      </div>

      {/* 一覧 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {clientsWithStats.length === 0 ? (
          <div className="py-24 text-center bg-card border border-dashed border-border rounded-lg animate-in fade-in duration-700 col-span-1 lg:col-span-2">
             <Building2 className="w-16 h-16 text-muted-foreground mx-auto opacity-10 mb-6" />
             <h3 className="text-xl font-bold italic tracking-tighter text-foreground mb-1">NO CLIENTS REGISTERED</h3>
             <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest opacity-40">取引先が登録されていません</p>
          </div>
        ) : (
          clientsWithStats.map((c) => {
            const isExpanded = expandedClientId === c.id;

            return (
              <div key={c.id} className={cn(
                "bg-card rounded-lg border overflow-hidden transition-all",
                isExpanded ? "border-primary ring-1 ring-primary col-span-1 lg:col-span-2" : "border-border hover:border-primary/50"
              )}>
                <div 
                  className="p-4 lg:p-6 flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6 group relative cursor-pointer"
                  onClick={() => setExpandedClientId(isExpanded ? null : c.id)}
                >
                   <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary/20 group-hover:bg-primary transition-all" />
                   
                   {editingId === c.id ? (
                     <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-left-2 duration-300" onClick={e => e.stopPropagation()}>
                        <div className="space-y-3">
                          <label className="text-[9px] font-bold text-primary/80 uppercase tracking-widest ml-1">ENTITY NAME / 法人名</label>
                          <Input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="h-12 bg-input border-none rounded-md font-bold" />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[9px] font-bold text-primary/80 uppercase tracking-widest ml-1">MANAGER / 担当者名</label>
                          <Input value={editForm.managerName} onChange={(e) => setEditForm({...editForm, managerName: e.target.value})} className="h-12 bg-input border-none rounded-md font-bold" />
                        </div>
                        <div className="md:col-span-2 space-y-3">
                          <label className="text-[9px] font-bold text-primary/80 uppercase tracking-widest ml-1">MEMO / メモ</label>
                          <Input value={editForm.memo} onChange={(e) => setEditForm({...editForm, memo: e.target.value})} className="h-12 bg-input border-none rounded-md font-bold" />
                        </div>
                     </div>
                   ) : (
                     <div className="flex-1 w-full min-w-0 flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-8">
                        <div className="flex-1 w-full lg:w-auto min-w-0 text-left">
                           <h3 className="text-xl lg:text-2xl font-bold italic tracking-tighter text-foreground group-hover:text-primary transition-colors font-[family-name:var(--font-outfit)] leading-tight mb-1 truncate">
                             {c.name}
                           </h3>
                           <p className="text-[9px] font-bold text-muted-foreground tracking-widest opacity-60">ID: {c.id.toUpperCase().substring(0, 8)}</p>
                        </div>
                        <div className="flex flex-row items-center justify-between lg:justify-start gap-6 border-t lg:border-t-0 lg:border-x border-border/50 shrink-0 w-full lg:w-auto pt-4 lg:pt-0 lg:px-8">
                           <div className="flex flex-col text-left">
                              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 mb-1">CASES</span>
                              <span className="text-lg font-bold italic tracking-tighter text-primary font-[family-name:var(--font-outfit)]">
                                {c.clientCases.length}
                              </span>
                           </div>
                           <div className="w-px h-8 bg-border/50" />
                           <div className="flex flex-col text-right lg:text-left">
                              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 mb-1">TOTAL REVENUE (GROSS)</span>
                              <span className="text-lg font-bold tracking-tight text-foreground">
                                ¥{c.clientTotalGross.toLocaleString()}
                              </span>
                           </div>
                        </div>
                     </div>
                   )}

                   <div className="flex items-center gap-1 lg:gap-3 shrink-0 absolute lg:relative right-2 top-2 lg:right-auto lg:top-auto z-10 bg-card/80 lg:bg-transparent p-1 lg:p-0 rounded-md backdrop-blur-md lg:backdrop-blur-none">
                     {editingId === c.id ? (
                       <>
                         <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="h-6 w-6 lg:h-10 lg:w-10 rounded-md text-muted-foreground hover:bg-secondary">
                           <X className="w-3 h-3 lg:w-5 lg:h-5" />
                         </Button>
                         <Button onClick={saveEdit} className="h-6 px-2 lg:h-10 lg:px-4 bg-primary text-primary-foreground rounded-md font-bold flex items-center gap-1 lg:gap-2 hover:brightness-110 text-[10px] lg:text-sm">
                           <Check className="w-3 h-3 lg:w-5 lg:h-5" /> <span className="hidden lg:inline">保存</span>
                         </Button>
                       </>
                     ) : (
                       <>
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           onClick={(e) => startEdit(c, e)}
                           className="h-6 w-6 lg:h-10 lg:w-10 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                         >
                           <Edit className="w-3 h-3 lg:w-5 lg:h-5" />
                         </Button>
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           onClick={(e) => { e.stopPropagation(); if(confirm('取引先を削除しますか？')) deleteClient(c.id); }}
                           className="h-6 w-6 lg:h-10 lg:w-10 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                         >
                           <Trash2 className="w-3 h-3 lg:w-5 lg:h-5" />
                         </Button>
                         <div className="w-px h-4 lg:h-6 bg-border mx-1 lg:mx-2" />
                         <Button variant="ghost" size="icon" className="hidden lg:flex h-10 w-10 rounded-md text-muted-foreground hover:bg-secondary">
                            {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                         </Button>
                       </>
                     )}
                   </div>
                </div>

                {/* 展開時の詳細情報 */}
                {isExpanded && (
                  <div className="border-t border-border/50 bg-secondary/10 p-4 lg:p-8 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex flex-col lg:flex-row gap-4 mb-6">
                      <div className="flex-1 bg-card border border-border p-5 rounded-md flex flex-col gap-4">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">MANAGER / 担当者</span>
                          <span className="text-sm font-bold text-foreground">{c.managerName || '未設定'}</span>
                        </div>
                        <div className="w-full h-px bg-border" />
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">MEMO / メモ</span>
                          <span className="text-sm font-medium whitespace-pre-wrap leading-relaxed">{c.memo || <span className="opacity-40 italic">未入力</span>}</span>
                        </div>
                      </div>
                      
                      <div className="flex-1 bg-card border border-border p-5 rounded-md flex flex-col justify-center gap-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">CUMULATIVE MAINTENANCE</span>
                          <span className="text-lg font-bold tracking-tight text-emerald-500">¥{c.clientTotalStock.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">PRODUCTION / SPOT TOTAL</span>
                          <span className="text-lg font-bold tracking-tight text-blue-500">¥{c.clientTotalShot.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-sm font-bold italic tracking-tighter text-foreground flex items-center gap-2 font-[family-name:var(--font-outfit)] uppercase">
                        <Briefcase className="w-5 h-5 text-primary" /> ASSOCIATED CASES
                      </h4>
                    </div>
                    {c.clientCases.length === 0 ? (
                      <div className="text-center py-10 bg-card rounded-lg border border-dashed border-border">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">紐づく案件はありません</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto bg-card rounded-lg border border-border">
                        <table className="w-full text-left whitespace-nowrap">
                          <thead>
                            <tr className="border-b border-border bg-muted/50">
                              <th className="p-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">案件名・カテゴリ</th>
                              <th className="p-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">ステータス</th>
                              <th className="p-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">計上月</th>
                              <th className="p-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-right">制作/SPOT</th>
                              <th className="p-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-right">保守(月額/累計/月数)</th>
                              <th className="p-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-right">TOTAL</th>
                              <th className="p-4 w-12"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {c.clientCases.map((caseItem) => (
                              <tr 
                                key={caseItem.id} 
                                className="group hover:bg-muted/50 transition-colors cursor-pointer"
                                onClick={() => router.push(`/cases/${caseItem.id}`)}
                              >
                                <td className="p-4">
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold tracking-tight text-foreground">{caseItem.name}</span>
                                    <span className="text-[9px] font-bold text-muted-foreground opacity-60 mt-1">{caseItem.genre || '未分類'}</span>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <Badge className={cn("border-none font-bold text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-md", 
                                    caseItem.status === 'active' ? "bg-emerald-500/10 text-emerald-600" : "bg-secondary text-muted-foreground"
                                  )}>
                                    {caseItem.status === 'active' ? '進行中' : 'アーカイブ'}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <span className="text-[11px] font-bold text-foreground">
                                    {caseItem.recognitionMonth || '-'}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <span className="text-[13px] font-bold text-blue-500">
                                    ¥{caseItem.caseShot.toLocaleString()}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex flex-col items-end">
                                    <span className="text-[13px] font-bold text-emerald-500">
                                      ¥{caseItem.caseStock.toLocaleString()}
                                    </span>
                                    <span className="text-[9px] font-bold text-muted-foreground opacity-60 mt-1">
                                      ¥{(caseItem.finance?.maintenanceFee || 0).toLocaleString()}/月 (x{caseItem.monthsActive}ヶ月)
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4 text-right">
                                  <span className="text-[14px] font-bold tracking-tight text-foreground">
                                    ¥{caseItem.caseGross.toLocaleString()}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-20 group-hover:opacity-100 transition-opacity ml-auto" />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
