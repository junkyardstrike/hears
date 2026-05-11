'use client';

import { useState } from 'react';
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

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.managerName || '').toLowerCase().includes(search.toLowerCase())
  );

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
      <div className="grid grid-cols-1 gap-4">
        {filteredClients.length === 0 ? (
          <div className="py-24 text-center bg-card border border-dashed border-border rounded-lg animate-in fade-in duration-700">
             <Building2 className="w-16 h-16 text-muted-foreground mx-auto opacity-10 mb-6" />
             <h3 className="text-xl font-bold italic tracking-tighter text-foreground mb-1">NO CLIENTS REGISTERED</h3>
             <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest opacity-40">取引先が登録されていません</p>
          </div>
        ) : (
          filteredClients.sort((a, b) => b.updatedAt - a.updatedAt).map((c) => {
            const clientCases = cases.filter(item => item.clientId === c.id || item.contractEntity === c.name).sort((a,b) => b.updatedAt - a.updatedAt);
            const isExpanded = expandedClientId === c.id;

            return (
              <div key={c.id} className={cn(
                "bg-card rounded-lg border overflow-hidden transition-all",
                isExpanded ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/50"
              )}>
                <div 
                  className="p-8 flex flex-col lg:flex-row items-center gap-8 group relative cursor-pointer"
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
                     <div className="flex-1 min-w-0 flex flex-col md:flex-row items-center gap-10">
                        <div className="flex-1 min-w-0 text-center md:text-left">
                           <h3 className="text-2xl font-bold italic tracking-tighter text-foreground group-hover:text-primary transition-colors font-[family-name:var(--font-outfit)] leading-tight mb-1">
                             {c.name}
                           </h3>
                           <p className="text-[10px] font-bold text-muted-foreground tracking-widest opacity-60">ID: {c.id.toUpperCase().substring(0, 8)}</p>
                        </div>
                        <div className="flex items-center gap-10 px-10 border-x border-border/50 shrink-0">
                           <div className="flex flex-col text-center min-w-[120px]">
                              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 mb-1">MANAGER / 担当者</span>
                              <span className="text-sm font-bold text-foreground">{c.managerName || '未設定'}</span>
                           </div>
                           <div className="flex flex-col text-center min-w-[100px]">
                              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 mb-1">CASES</span>
                              <span className="text-xl font-bold italic tracking-tighter text-primary font-[family-name:var(--font-outfit)]">
                                {clientCases.length}
                              </span>
                           </div>
                        </div>
                     </div>
                   )}

                   <div className="flex items-center gap-3 shrink-0 relative z-10">
                     {editingId === c.id ? (
                       <>
                         <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="h-10 w-10 rounded-md text-muted-foreground hover:bg-secondary">
                           <X className="w-5 h-5" />
                         </Button>
                         <Button onClick={saveEdit} className="h-10 px-4 bg-primary text-primary-foreground rounded-md font-bold flex items-center gap-2 hover:brightness-110">
                           <Check className="w-5 h-5" /> 保存
                         </Button>
                       </>
                     ) : (
                       <>
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           onClick={(e) => startEdit(c, e)}
                           className="h-10 w-10 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                         >
                           <Edit className="w-5 h-5" />
                         </Button>
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           onClick={(e) => { e.stopPropagation(); if(confirm('取引先を削除しますか？')) deleteClient(c.id); }}
                           className="h-10 w-10 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                         >
                           <Trash2 className="w-5 h-5" />
                         </Button>
                         <div className="w-px h-6 bg-border mx-2" />
                         <Button variant="ghost" size="icon" className="h-10 w-10 rounded-md text-muted-foreground hover:bg-secondary">
                            {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                         </Button>
                       </>
                     )}
                   </div>
                </div>

                {/* 展開時の案件リスト */}
                {isExpanded && (
                  <div className="border-t border-border/50 bg-secondary/5 p-8 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-sm font-bold italic tracking-tighter text-foreground flex items-center gap-2 font-[family-name:var(--font-outfit)] uppercase">
                        <Briefcase className="w-5 h-5 text-primary" /> ASSOCIATED CASES
                      </h4>
                    </div>
                    {clientCases.length === 0 ? (
                      <div className="text-center py-10 bg-card rounded-lg border border-dashed border-border">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">紐づく案件はありません</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto bg-card rounded-lg border border-border">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-border bg-muted/50">
                              <th className="p-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">案件名 / CASE NAME</th>
                              <th className="p-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">ステータス / STATUS</th>
                              <th className="p-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-right">月額保守 / MONTHLY</th>
                              <th className="p-4 w-16"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {clientCases.map((caseItem) => (
                              <tr 
                                key={caseItem.id} 
                                className="group hover:bg-muted/50 transition-colors cursor-pointer"
                                onClick={() => router.push(`/cases/${caseItem.id}`)}
                              >
                                <td className="p-4">
                                  <span className="text-sm font-bold tracking-tight text-foreground">{caseItem.name}</span>
                                </td>
                                <td className="p-4">
                                  <Badge className={cn("border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1 rounded-md", 
                                    caseItem.status === 'active' ? "bg-emerald-500/10 text-emerald-600" : "bg-secondary text-muted-foreground"
                                  )}>
                                    {caseItem.status === 'active' ? '進行中' : 'アーカイブ'}
                                  </Badge>
                                </td>
                                <td className="p-4 text-right">
                                  <span className="text-base font-bold tracking-tight text-foreground">
                                    ¥{((caseItem.finance?.maintenanceFee || 0)).toLocaleString()}
                                  </span>
                                </td>
                                <td className="p-4">
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
