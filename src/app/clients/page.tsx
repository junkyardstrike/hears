'use client';

import { useState } from 'react';
import { useHearsStore, ClientData } from '@/store/useHearsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Building2, Plus, Trash2, Edit, Save, X, Search,
  Users, Briefcase, ChevronLeft, ChevronRight, Check
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function ClientsPage() {
  const router = useRouter();
  const { clients, createClient, updateClient, deleteClient, cases } = useHearsStore();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ClientData>>({});

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.managerName || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    const name = prompt('取引先法人名を入力してください', '新規取引先');
    if (name) createClient(name);
  };

  const startEdit = (c: ClientData) => {
    setEditingId(c.id);
    setEditForm(c);
  };

  const saveEdit = () => {
    if (editingId && editForm.name) {
      updateClient(editingId, (draft) => {
        Object.assign(draft, editForm);
      });
      setEditingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 font-[family-name:var(--font-noto)]">
      {/* ヘッダー */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-white p-8 lg:p-10 rounded-[3rem] paper-shadow">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-4 mb-2">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-muted-foreground hover:text-primary rounded-2xl shrink-0">
              <ChevronLeft className="w-8 h-8" />
            </Button>
            <h2 className="text-3xl font-bold italic tracking-tighter text-foreground flex items-center gap-4 uppercase font-[family-name:var(--font-outfit)]">
              <Building2 className="w-10 h-10 text-primary" /> CLIENT REPOSITORY
            </h2>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-40 ml-16">取引先 ・ クライアント法人管理</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto shrink-0">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40" />
            <Input 
              placeholder="法人名で検索... / SEARCH" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-16 bg-secondary/30 border-none rounded-2xl font-bold text-xs"
            />
          </div>
          <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-white font-bold h-16 px-10 rounded-2xl shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 shrink-0 flex items-center gap-3">
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
          <div className="py-32 text-center bg-white/50 border-2 border-dashed border-border rounded-[3rem] animate-in fade-in duration-700">
             <Building2 className="w-16 h-16 text-muted-foreground mx-auto opacity-10 mb-6" />
             <h3 className="text-xl font-bold italic tracking-tighter text-foreground mb-1">NO CLIENTS REGISTERED</h3>
             <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest opacity-40">取引先が登録されていません</p>
          </div>
        ) : (
          filteredClients.sort((a, b) => b.updatedAt - a.updatedAt).map((c) => (
            <div key={c.id} className="bg-white p-8 rounded-[2.5rem] paper-shadow hover:paper-shadow-lg transition-all flex flex-col lg:flex-row items-center gap-8 border border-transparent hover:border-primary/20 group relative overflow-hidden">
               <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary/20 group-hover:bg-primary transition-all" />
               
               {editingId === c.id ? (
                 <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-left-2 duration-300">
                    <div className="space-y-3">
                      <label className="text-[9px] font-bold text-primary/60 uppercase tracking-widest ml-1">ENTITY NAME / 法人名</label>
                      <Input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="h-14 bg-secondary/30 border-none rounded-xl font-bold" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] font-bold text-primary/60 uppercase tracking-widest ml-1">MANAGER / 担当者名</label>
                      <Input value={editForm.managerName} onChange={(e) => setEditForm({...editForm, managerName: e.target.value})} className="h-14 bg-secondary/30 border-none rounded-xl font-bold" />
                    </div>
                    <div className="md:col-span-2 space-y-3">
                      <label className="text-[9px] font-bold text-primary/60 uppercase tracking-widest ml-1">MEMO / メモ</label>
                      <Input value={editForm.memo} onChange={(e) => setEditForm({...editForm, memo: e.target.value})} className="h-14 bg-secondary/30 border-none rounded-xl font-bold" />
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
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 mb-1">ACTIVE CASES</span>
                          <span className="text-xl font-bold italic tracking-tighter text-primary font-[family-name:var(--font-outfit)]">
                            {cases.filter(item => item.clientId === c.id || item.contractEntity === c.name).length}
                          </span>
                       </div>
                    </div>
                 </div>
               )}

               <div className="flex items-center gap-3 shrink-0 relative z-10">
                 {editingId === c.id ? (
                   <>
                     <Button variant="ghost" size="icon" onClick={() => setEditingId(null)} className="h-12 w-12 rounded-2xl text-muted-foreground hover:bg-secondary/50">
                       <X className="w-5 h-5" />
                     </Button>
                     <Button onClick={saveEdit} className="h-12 px-6 bg-primary text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg">
                       <Check className="w-5 h-5" /> 保存
                     </Button>
                   </>
                 ) : (
                   <>
                     <Button 
                       variant="ghost" 
                       size="icon" 
                       onClick={() => startEdit(c)}
                       className="h-12 w-12 rounded-2xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                     >
                       <Edit className="w-5 h-5" />
                     </Button>
                     <Button 
                       variant="ghost" 
                       size="icon" 
                       onClick={() => { if(confirm('取引先を削除しますか？')) deleteClient(c.id) }}
                       className="h-12 w-12 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
                     >
                       <Trash2 className="w-5 h-5" />
                     </Button>
                   </>
                 )}
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
