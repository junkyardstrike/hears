'use client';

import { useRouter } from 'next/navigation';
import { useHearsStore, ProjectData, HearingFolder } from '@/store/useHearsStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Trash2, ExternalLink, Shield, Server, FileText, 
  CheckCircle2, Circle, MoreVertical, X, Check, Clock, ChevronRight, Briefcase,
  Search, Filter, Tag, LayoutGrid, List, Calendar, RefreshCw, FolderRoot, 
  FolderSync, Archive, PlayCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { SideTree, TreeItem } from '@/components/layout/SideTree';

const FOLDER_TREE: { key: HearingFolder; label: string }[] = [
  { key: 'not-started', label: 'UNSTARTED 未着手' },
  { key: 'in-progress', label: 'IN PROGRESS 進行中' },
  { key: 'backup', label: 'BACKUP 案件化済み' },
];

export function HearingView() {
  const { projects, createProject, deleteProject, convertToCase } = useHearsStore();
  const router = useRouter();
  const [filter, setFilter] = useState<HearingFolder>('not-started');
  
  const handleCreate = () => {
    const name = prompt('プロジェクト名を入力してください', '新規ヒアリング');
    if (name) {
      const id = createProject(name);
      router.push(`/editor/${id}`);
    }
  };

  const renderProjectList = (currentFilter: HearingFolder) => {
    const list = projects.filter(p => p.folder === currentFilter);

    if (list.length === 0) {
      return (
        <div className="py-12 text-center bg-card border border-dashed border-border rounded-md animate-in fade-in duration-300">
          <div className="bg-secondary w-12 h-12 rounded-md flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1">No Projects Found</h3>
          <p className="text-muted-foreground font-bold text-xs">このフォルダにはプロジェクトがありません</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {list.sort((a, b) => b.updatedAt - a.updatedAt).map((p) => (
          <div key={p.id} className="group relative">
            <div className="bg-card p-4 rounded-md border border-border hover:border-primary/50 transition-colors flex flex-col h-full">
              <div className="flex justify-between items-start gap-3 mb-3">
                <div className="flex flex-col">
                  <Badge variant="secondary" className="w-fit mb-2 text-[10px] font-bold tracking-wide uppercase rounded-md bg-secondary text-foreground">
                    {p.folder === 'not-started' ? 'UNSTARTED / 未着手' : p.folder === 'in-progress' ? 'IN PROGRESS / 進行中' : 'BACKUP / 案件化済み'}
                  </Badge>
                  <h3 className="text-base font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{p.name}</h3>
                </div>
                <div className="bg-primary/10 p-2 rounded-md shrink-0">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
              </div>
              
              <div className="space-y-2 mb-4 flex-1">
                <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" /> 最終更新: {new Date(p.updatedAt).toLocaleDateString()}
                </div>
                <div className="p-3 bg-input rounded-md space-y-1 border border-border">
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                    <span>CLIENT</span>
                    <span className="text-foreground font-bold">{p.basicInfo.clientName || '未設定'}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                    <span>DEADLINE</span>
                    <span className="text-foreground">{p.basicInfo.deadline || '未設定'}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-auto">
                <Button 
                  onClick={() => router.push(`/editor/${p.id}`)}
                  className="flex-1 bg-primary hover:brightness-110 text-primary-foreground font-bold h-8 text-xs rounded-md transition-all shadow-none"
                >
                  編集する
                </Button>
                {p.folder !== 'backup' && (
                  <Button 
                    onClick={() => {
                      if(confirm('このヒアリング情報を元に「案件」を作成しますか？')) {
                        convertToCase(p.id);
                        router.push('/cases');
                      }
                    }}
                    variant="outline"
                    className="flex-1 border-border hover:border-primary/50 hover:bg-secondary text-primary font-bold h-8 text-xs rounded-md transition-all"
                  >
                    案件化する
                  </Button>
                )}
                <Button 
                  onClick={() => { if(confirm('プロジェクトを削除しますか？')) deleteProject(p.id); }}
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-300 font-sans pb-4">
      <SideTree title="ヒアリングのフォルダ">
        {FOLDER_TREE.map((f) => (
          <div key={f.key} className="flex flex-col gap-px">
            <TreeItem
              glyph={filter === f.key ? '▾' : '▸'}
              label={f.label}
              badge={projects.filter(p => p.folder === f.key).length}
              active={filter === f.key}
              onClick={() => setFilter(f.key)}
            />
            {filter === f.key && projects
              .filter(p => p.folder === f.key)
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((p) => (
                <TreeItem
                  key={p.id}
                  depth={1}
                  label={p.name}
                  onClick={() => router.push(`/editor/${p.id}`)}
                />
              ))}
          </div>
        ))}
      </SideTree>

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3 bg-card p-4 rounded-md border border-border">
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 uppercase">
            <FolderRoot className="w-5 h-5 text-primary" /> Hearing Repository
          </h2>
          <p className="text-[11px] font-bold text-muted-foreground mt-0.5">ヒアリングリポジトリ ・ 顧客要望一括管理</p>

          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 mt-2">
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">TOTAL PROJECTS / 全プロジェクト数</span>
              <span className="text-lg font-bold">{projects.length}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto shrink-0">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="プロジェクト名で検索... / SEARCH" 
              className="h-10 bg-input border border-border rounded-md pl-9 font-bold text-xs focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
          <Button 
            onClick={handleCreate} 
            className="h-10 px-4 bg-primary hover:brightness-110 text-primary-foreground font-bold rounded-md transition-all shrink-0 flex items-center gap-2 shadow-none"
          >
            <Plus className="w-5 h-5" />
            <span className="uppercase flex flex-col items-start leading-none">
              <span className="text-[11px] font-bold">NEW HEARING</span>
              <span className="text-[9px] font-bold opacity-80 mt-1">新規ヒアリング作成</span>
            </span>
          </Button>
        </div>
      </div>

      {/* スマホ用タブ（PCは左のツリーに移動） */}
      <div className="lg:hidden grid grid-cols-3 gap-1 border-b border-border">
        <NavTab 
          active={filter === 'not-started'} 
          onClick={() => setFilter('not-started')}
          icon={<PlayCircle className="w-3.5 h-3.5" />}
          label="UNSTARTED"
          subLabel="未着手のプロジェクト"
          count={projects.filter(p => p.folder === 'not-started').length}
        />
        <NavTab 
          active={filter === 'in-progress'} 
          onClick={() => setFilter('in-progress')}
          icon={<FolderSync className="w-3.5 h-3.5" />}
          label="IN PROGRESS"
          subLabel="進行中のヒアリング"
          count={projects.filter(p => p.folder === 'in-progress').length}
        />
        <NavTab 
          active={filter === 'backup'} 
          onClick={() => setFilter('backup')}
          icon={<Archive className="w-3.5 h-3.5" />}
          label="BACKUP"
          subLabel="案件化済みの保管データ"
          count={projects.filter(p => p.folder === 'backup').length}
        />
      </div>

      <div className="animate-in fade-in duration-300">
        {renderProjectList(filter)}
      </div>
    </div>
  );
}

function NavTab({ active, onClick, icon, label, subLabel, count }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col gap-0.5 px-2 py-2 border-b-2 transition-colors text-left min-w-0",
        active 
          ? "bg-card border-primary text-foreground"
          : "border-transparent text-muted-foreground hover:bg-card"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-1 gap-y-0.5">
        <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold uppercase">
          <span className={cn("hidden sm:inline-flex", active ? "text-primary" : "")}>{icon}</span>
          {label}
        </span>
        <span className={cn(
          "px-1.5 py-0.5 rounded-md text-[10px] font-bold shrink-0",
          active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
        )}>
          {count}
        </span>
      </div>
      <span className="text-[9px] font-bold text-muted-foreground">{subLabel}</span>
    </button>
  );
}
