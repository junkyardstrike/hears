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
        <div className="py-24 text-center bg-card border border-dashed border-border rounded-lg animate-in fade-in duration-700">
          <div className="bg-secondary/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-12 h-12 text-muted-foreground opacity-20" />
          </div>
          <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">No Projects Found</h3>
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest opacity-40">このフォルダにはプロジェクトがありません</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {list.sort((a, b) => b.updatedAt - a.updatedAt).map((p) => (
          <div key={p.id} className="group relative">
            <div className="bg-card p-6 lg:p-8 rounded-lg border border-border hover:border-primary/50 transition-all flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col">
                  <Badge variant="secondary" className="w-fit mb-3 text-[9px] font-bold tracking-widest uppercase rounded-md bg-secondary text-foreground">
                    {p.folder === 'not-started' ? 'UNSTARTED / 未着手' : p.folder === 'in-progress' ? 'IN PROGRESS / 進行中' : 'BACKUP / 案件化済み'}
                  </Badge>
                  <h3 className="text-xl font-bold tracking-tight text-foreground leading-tight group-hover:text-primary transition-colors">{p.name}</h3>
                </div>
                <div className="bg-primary/10 p-3 rounded-md">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
              </div>
              
              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                  <Calendar className="w-3.5 h-3.5" /> 最終更新: {new Date(p.updatedAt).toLocaleDateString()}
                </div>
                <div className="p-4 bg-input rounded-md space-y-2 border border-border">
                  <div className="flex justify-between text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                    <span>CLIENT</span>
                    <span className="text-foreground font-bold">{p.basicInfo.clientName || '未設定'}</span>
                  </div>
                  <div className="flex justify-between text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                    <span>DEADLINE</span>
                    <span className="text-foreground">{p.basicInfo.deadline || '未設定'}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-auto">
                <Button 
                  onClick={() => router.push(`/editor/${p.id}`)}
                  className="flex-1 bg-primary hover:brightness-110 text-primary-foreground font-bold h-10 rounded-md transition-all active:scale-95 shadow-none"
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
                    className="flex-1 border-border hover:border-primary/50 hover:bg-secondary text-primary font-bold h-10 rounded-md transition-all"
                  >
                    案件化する
                  </Button>
                )}
                <Button 
                  onClick={() => { if(confirm('プロジェクトを削除しますか？')) deleteProject(p.id); }}
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans pb-10">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-card p-6 lg:p-8 rounded-lg border border-border">
        <div className="flex-1 min-w-0">
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-4 uppercase mb-1">
            <FolderRoot className="w-8 h-8 text-primary" /> Hearing Repository
          </h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-40 ml-14 mb-6">ヒアリングリポジトリ ・ 顧客要望一括管理</p>
          
          <div className="flex flex-wrap items-center gap-x-10 gap-y-4 ml-14">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">TOTAL PROJECTS / 全プロジェクト数</span>
              <span className="text-2xl font-bold tracking-tight">{projects.length}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto shrink-0">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-30" />
            <Input 
              placeholder="プロジェクト名で検索... / SEARCH" 
              className="h-14 bg-input border border-border rounded-md pl-12 font-bold text-xs focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
          <Button 
            onClick={handleCreate} 
            className="h-14 px-8 bg-primary hover:brightness-110 text-primary-foreground font-bold tracking-tight rounded-md transition-all active:scale-95 shrink-0 flex items-center gap-3 shadow-none"
          >
            <Plus className="w-7 h-7" />
            <span className="text-base uppercase tracking-widest flex flex-col items-start leading-none">
              <span className="text-[11px] font-black">NEW HEARING</span>
              <span className="text-[8px] font-bold opacity-60 mt-1">新規ヒアリング作成</span>
            </span>
          </Button>
        </div>
      </div>

      {/* 刷新されたナビゲーションタブ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <NavTab 
          active={filter === 'not-started'} 
          onClick={() => setFilter('not-started')}
          icon={<PlayCircle className="w-5 h-5" />}
          label="UNSTARTED"
          subLabel="未着手のプロジェクト"
          count={projects.filter(p => p.folder === 'not-started').length}
          color="amber"
        />
        <NavTab 
          active={filter === 'in-progress'} 
          onClick={() => setFilter('in-progress')}
          icon={<FolderSync className="w-5 h-5" />}
          label="IN PROGRESS"
          subLabel="進行中のヒアリング"
          count={projects.filter(p => p.folder === 'in-progress').length}
          color="emerald"
        />
        <NavTab 
          active={filter === 'backup'} 
          onClick={() => setFilter('backup')}
          icon={<Archive className="w-5 h-5" />}
          label="BACKUP"
          subLabel="案件化済みの保管データ"
          count={projects.filter(p => p.folder === 'backup').length}
          color="blue"
        />
      </div>

      <div className="animate-in fade-in duration-500">
        {renderProjectList(filter)}
      </div>
    </div>
  );
}

function NavTab({ active, onClick, icon, label, subLabel, count, color }: any) {
  const activeColors = {
    amber: "border-amber-500 text-amber-600",
    emerald: "border-emerald-500 text-emerald-600",
    blue: "border-blue-500 text-blue-600"
  };

  return (
    <button 
      onClick={onClick}
      className={cn(
        "relative flex flex-col p-5 rounded-lg border transition-all text-left group active:scale-95",
        active 
          ? "bg-card border-primary " + (activeColors as any)[color]
          : "bg-secondary hover:bg-card border-border hover:border-primary/50 text-muted-foreground"
      )}
    >
      <div className={cn(
        "p-2.5 rounded-md mb-4 w-fit transition-all",
        active ? "bg-primary/10 text-primary" : "bg-background text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
      )}>
        {icon}
      </div>
      
      <div className="flex justify-between items-end">
        <div>
          <span className={cn("text-[11px] font-black uppercase tracking-[0.2em] block mb-1", active ? "text-foreground" : "text-muted-foreground")}>{label}</span>
          <span className="text-[9px] font-bold text-muted-foreground opacity-40 uppercase tracking-widest">{subLabel}</span>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-md text-[10px] font-black",
          active ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
        )}>
          {count}
        </div>
      </div>
    </button>
  );
}
