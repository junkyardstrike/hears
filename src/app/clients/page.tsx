'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
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
import { SideTree, TreeItem } from '@/components/layout/SideTree';

type CaseWithStats = CaseData & {
  caseGross: number;
  caseStock: number;
  caseShot: number;
  monthsActive: number;
  recognitionMonth: string;
};

type ClientWithStats = ClientData & {
  clientCases: CaseWithStats[];
  clientTotalGross: number;
  clientTotalStock: number;
  clientTotalShot: number;
};

const ClientDetailForm = ({ client, updateClient }: { client: ClientData, updateClient: any }) => {
  const [managerName, setManagerName] = useState(client.managerName || '');
  const [memo, setMemo] = useState(client.memo || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    updateClient(client.id, (draft: any) => {
      draft.managerName = managerName;
      draft.memo = memo;
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="bg-card border border-border p-3 rounded-md flex flex-col lg:flex-row lg:items-end gap-3">
      <div className="flex flex-col lg:flex-1 min-w-0">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">MANAGER / 担当者</span>
        <Input
          value={managerName}
          onChange={e => setManagerName(e.target.value)}
          className="h-9 bg-input border-border font-bold text-sm w-full"
          placeholder="担当者名を入力"
        />
      </div>
      <div className="flex flex-col lg:flex-[2] min-w-0">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">MEMO / メモ</span>
        <textarea
          value={memo}
          onChange={e => setMemo(e.target.value)}
          className="min-h-[60px] bg-input border border-border rounded-md px-3 py-2 text-sm font-medium resize-y"
          placeholder="メモを入力"
        />
      </div>
      <Button onClick={handleSave} className="h-9 px-3 bg-primary text-primary-foreground font-bold text-[11px] self-end shrink-0">
        {isSaved ? <Check className="w-3 h-3 mr-1" /> : <Save className="w-3 h-3 mr-1" />} 保存
      </Button>
    </div>
  );
};

const SummaryStat = ({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) => (
  <div className={cn("flex flex-col text-left min-w-0", className)}>
    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">{label}</span>
    {children}
  </div>
);

interface ClientSummaryProps {
  c: ClientWithStats;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  editForm: Partial<ClientData>;
  setEditForm: (form: Partial<ClientData>) => void;
  startEdit: (c: ClientData, e: React.MouseEvent) => void;
  saveEdit: (e: React.MouseEvent) => void;
  deleteClient: (id: string) => void;
}

// 取引先のサマリー行（PCは本文上部、スマホはカード見出しとして共用）
const ClientSummary = ({ c, editingId, setEditingId, editForm, setEditForm, startEdit, saveEdit, deleteClient }: ClientSummaryProps) => (
  editingId === c.id ? (
    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in duration-200" onClick={e => e.stopPropagation()}>
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">ENTITY NAME / 法人名</label>
        <Input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="h-9 bg-input border-border rounded-md font-bold" />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">MANAGER / 担当者名</label>
        <Input value={editForm.managerName} onChange={(e) => setEditForm({...editForm, managerName: e.target.value})} className="h-9 bg-input border-border rounded-md font-bold" />
      </div>
      <div className="md:col-span-2 space-y-1">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">MEMO / メモ</label>
        <Input value={editForm.memo} onChange={(e) => setEditForm({...editForm, memo: e.target.value})} className="h-9 bg-input border-border rounded-md font-bold" />
      </div>
    </div>
  ) : (
    <div className="flex-1 flex items-center gap-3 min-w-0">
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-x-4 gap-y-2 min-w-0">
        <SummaryStat label="ENTITY / 取引先" className="col-span-2 sm:col-span-1">
          <h3 className="text-sm font-bold text-foreground leading-tight line-clamp-2">
            {c.name}
          </h3>
        </SummaryStat>
        <SummaryStat label="MANAGER / 担当者">
          <span className="text-xs font-bold text-foreground truncate">
            {c.managerName || '-'}
          </span>
        </SummaryStat>
        <SummaryStat label="CASES / 案件数">
          <span className="text-sm font-bold text-primary">
            {c.clientCases.length}
          </span>
        </SummaryStat>
        <SummaryStat label="MAINT. / 保守">
          <span className="text-xs font-bold text-emerald-700">
            ¥{c.clientTotalStock.toLocaleString()}
          </span>
        </SummaryStat>
        <SummaryStat label="SPOT / 制作">
          <span className="text-xs font-bold text-blue-700">
            ¥{c.clientTotalShot.toLocaleString()}
          </span>
        </SummaryStat>
      </div>

      {/* 操作ボタン列 (右端) */}
      <div className="flex flex-col lg:flex-row gap-1 shrink-0 border-l border-border pl-2" onClick={e => e.stopPropagation()}>
        {editingId === c.id ? (
          <>
            <Button onClick={saveEdit} className="h-8 w-8 bg-primary text-primary-foreground rounded-md font-bold flex items-center justify-center hover:brightness-110">
              <Check className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="h-8 w-8 rounded-md text-muted-foreground hover:bg-secondary">
              <X className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => startEdit(c, e)}
              className="h-8 w-8 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => { e.stopPropagation(); if(confirm('取引先を削除しますか？')) deleteClient(c.id); }}
              className="h-8 w-8 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
);

// 取引先の詳細（PCは本文、スマホはカード展開部として共用）
const ClientDetailBody = ({ c, updateClient, onOpenCase }: { c: ClientWithStats; updateClient: (id: string, updater: (client: ClientData) => void) => void; onOpenCase: (id: string) => void }) => (
  <div className="flex flex-col gap-3">
    <ClientDetailForm client={c} updateClient={updateClient} />

    <div className="bg-card border border-border p-3 rounded-md grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">CUMULATIVE MAINTENANCE / 保守累計獲得額</span>
        <span className="text-base font-bold text-emerald-700">¥{c.clientTotalStock.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">PRODUCTION・SPOT TOTAL / 制作・スポット累計</span>
        <span className="text-base font-bold text-blue-700">¥{c.clientTotalShot.toLocaleString()}</span>
      </div>
    </div>

    <h4 className="text-xs font-bold text-foreground flex items-center gap-2 uppercase mt-1">
      <Briefcase className="w-4 h-4 text-primary" /> ASSOCIATED CASES / 紐付けられた案件
    </h4>
    {c.clientCases.length === 0 ? (
      <div className="text-center py-6 bg-card rounded-md border border-dashed border-border">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">紐づく案件はありません</p>
      </div>
    ) : (
      <div className="overflow-x-auto bg-card rounded-md border border-border">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="border-b border-border bg-secondary">
              <th className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wide">案件名・カテゴリ</th>
              <th className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wide">ステータス</th>
              <th className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wide">計上月</th>
              <th className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-right">制作/SPOT</th>
              <th className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-right">保守(月額/累計/月数)</th>
              <th className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-right">TOTAL</th>
              <th className="px-3 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {c.clientCases.map((caseItem) => (
              <tr
                key={caseItem.id}
                className="group hover:bg-secondary transition-colors cursor-pointer"
                onClick={() => onOpenCase(caseItem.id)}
              >
                <td className="px-3 py-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground">{caseItem.name}</span>
                    <span className="text-[10px] font-medium text-muted-foreground mt-0.5">{caseItem.genre || '未分類'}</span>
                  </div>
                </td>
                <td className="px-3 py-2">
                  <Badge className={cn("border-none font-bold text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-md",
                    caseItem.status === 'active' ? "bg-emerald-500/15 text-emerald-700" : "bg-secondary text-muted-foreground"
                  )}>
                    {caseItem.status === 'active' ? '進行中' : 'アーカイブ'}
                  </Badge>
                </td>
                <td className="px-3 py-2">
                  <span className="text-[11px] font-bold text-foreground">
                    {caseItem.recognitionMonth || '-'}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <span className="text-xs font-bold text-blue-700">
                    ¥{caseItem.caseShot.toLocaleString()}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-emerald-700">
                      ¥{caseItem.caseStock.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground mt-0.5">
                      ¥{(caseItem.finance?.maintenanceFee || 0).toLocaleString()}/月 (x{caseItem.monthsActive}ヶ月)
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 text-right">
                  <span className="text-sm font-bold text-foreground">
                    ¥{caseItem.caseGross.toLocaleString()}
                  </span>
                </td>
                <td className="px-3 py-2 text-right">
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default function ClientsDashboard() {
  const router = useRouter();
  const { clients, createClient, updateClient, deleteClient, cases } = useHearsStore();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ClientData>>({});
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  // PC: ツリーで選択中の取引先（表示専用）
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpandedClientId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // 選択中の取引先（未選択、または絞り込みで消えた場合は先頭）
  const selectedClient: ClientWithStats | undefined =
    clientsWithStats.find(c => c.id === selectedClientId) ?? clientsWithStats[0];

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

  const openCase = (id: string) => router.push(`/cases/${id}`);

  const summaryProps = { editingId, setEditingId, editForm, setEditForm, startEdit, saveEdit, deleteClient };

  return (
    <div className="space-y-3 animate-in fade-in duration-500 pb-4 max-w-[1600px] mx-auto">
      {/* PC: 左ツリーに取引先と紐づく案件 */}
      {clientsWithStats.length > 0 && (
        <SideTree title="取引先と案件">
          {clientsWithStats.map((c) => {
            const isSelected = selectedClient?.id === c.id;
            return (
              <div key={c.id} className="flex flex-col gap-px">
                <TreeItem
                  label={c.name}
                  glyph={isSelected ? '▾' : '▸'}
                  badge={c.clientCases.length}
                  active={isSelected}
                  onClick={() => setSelectedClientId(c.id)}
                />
                {isSelected && c.clientCases.map((caseItem) => (
                  <TreeItem
                    key={caseItem.id}
                    depth={1}
                    label={caseItem.name}
                    href={`/cases/${caseItem.id}`}
                  />
                ))}
              </div>
            );
          })}
        </SideTree>
      )}

      {/* ヘッダー */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 bg-card px-3 py-3 rounded-md border border-border">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 uppercase">
            <Building2 className="w-5 h-5 text-primary" /> CLIENTS DASHBOARD
          </h2>
          <p className="text-[11px] font-medium text-muted-foreground">取引先別 案件管理ダッシュボード</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto shrink-0">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="法人名で検索... / SEARCH"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-input border-border rounded-md font-bold text-xs"
            />
          </div>
          <Button onClick={handleAdd} className="bg-primary hover:brightness-110 text-primary-foreground font-bold h-10 px-4 rounded-md transition-all active:scale-95 shrink-0 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            <span className="flex flex-col items-start leading-none text-left">
              <span className="text-xs font-bold">NEW CLIENT</span>
              <span className="text-[10px] font-medium opacity-80 mt-1">新規取引先登録</span>
            </span>
          </Button>
        </div>
      </div>

      {clientsWithStats.length === 0 ? (
        <div className="py-16 text-center bg-card border border-dashed border-border rounded-md animate-in fade-in duration-700">
           <Building2 className="w-12 h-12 text-muted-foreground mx-auto opacity-30 mb-4" />
           <h3 className="text-base font-bold text-foreground mb-1">NO CLIENTS REGISTERED</h3>
           <p className="text-muted-foreground font-bold text-[11px] uppercase tracking-wide">取引先が登録されていません</p>
        </div>
      ) : (
        <>
          {/* PC: 選択した取引先の詳細 */}
          {selectedClient && (
            <div className="hidden lg:flex flex-col gap-3">
              <div className="bg-card rounded-md border border-border p-3 flex items-center">
                <ClientSummary c={selectedClient} {...summaryProps} />
              </div>
              <ClientDetailBody c={selectedClient} updateClient={updateClient} onOpenCase={openCase} />
            </div>
          )}

          {/* スマホ: カードを縦に並べて行クリックで展開 */}
          <div ref={containerRef} className="lg:hidden flex flex-col gap-2">
            {clientsWithStats.map((c) => {
              const isExpanded = expandedClientId === c.id;

              return (
                <div key={c.id} className={cn(
                  "bg-card rounded-md border overflow-hidden transition-colors",
                  isExpanded ? "border-primary border-l-[3px]" : "border-border hover:border-primary/50"
                )}>
                  <div
                    className="p-3 flex items-center gap-2 cursor-pointer"
                    onClick={() => setExpandedClientId(isExpanded ? null : c.id)}
                  >
                    <ClientSummary c={c} {...summaryProps} />
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                  </div>

                  {/* 展開時の詳細情報 */}
                  {isExpanded && (
                    <div className="border-t border-border bg-secondary/40 p-3 animate-in fade-in duration-200 cursor-default" onClick={e => e.stopPropagation()}>
                      <ClientDetailBody c={c} updateClient={updateClient} onOpenCase={openCase} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
