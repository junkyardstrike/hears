'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useHearsStore } from '@/store/useHearsStore';
import { BasicInfo } from '@/components/BasicInfo';
import { LoveHotelTab } from '@/components/LoveHotelTab';
import { GeneralTab } from '@/components/GeneralTab';
import { ExportPanel } from '@/components/ExportPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Briefcase, FileText, ChevronLeft, ArrowUp, Home } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { TreeItem } from '@/components/layout/SideTree';

// 左ツリー／スマホ用チップに出すセクション（見た目だけの定義。スクロール先は各カードの id）
const LOVE_HOTEL_SECTIONS = [
  { id: 'sec-lh-1', label: '① ホテルの推しポイント', chip: '① 推し' },
  { id: 'sec-lh-2', label: '② 客室・設備詳細', chip: '② 客室' },
  { id: 'sec-lh-3', label: '③ 料金・システム', chip: '③ 料金' },
  { id: 'sec-lh-4', label: '④ フード・飲食', chip: '④ フード' },
  { id: 'sec-lh-5', label: '⑤ 連携・サービス設定', chip: '⑤ 連携' },
  { id: 'sec-lh-6', label: '⑥ アクセス・立地', chip: '⑥ アクセス' },
  { id: 'sec-lh-7', label: '⑦ 担当者メモ', chip: '⑦ メモ' },
];

export default function Editor() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  
  const { projects, updateProject } = useHearsStore();
  const [activeTab, setActiveTab] = useState<'loveHotel' | 'general'>('loveHotel');
  const [mounted, setMounted] = useState(false);
  // 表示専用の状態（ツリーのハイライト用）
  const [activeSection, setActiveSection] = useState('sec-basic');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // スクロール位置から「いま見ているセクション」を割り出す（ツリーのハイライト用）
  const updateSpy = useCallback(() => {
    const root = scrollRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>('[id^="sec-"]'));
    if (els.length === 0) return;
    const top = root.getBoundingClientRect().top;
    let current = els[0].id;
    if (root.scrollTop > 0 && root.scrollTop + root.clientHeight >= root.scrollHeight - 4) {
      current = els[els.length - 1].id;
    } else {
      for (const el of els) {
        if (el.getBoundingClientRect().top - top <= 80) current = el.id;
        else break;
      }
    }
    setActiveSection(current);
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(updateSpy);
    return () => cancelAnimationFrame(raf);
  }, [activeTab, mounted, updateSpy]);

  const jumpTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(id);
  };

  const selectTemplate = (tab: 'loveHotel' | 'general') => {
    setActiveTab(tab);
    requestAnimationFrame(() => {
      document.getElementById('tabs-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  if (!mounted) return null;

  const project = projects.find(p => p.id === projectId);

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-foreground font-sans bg-background">
        <p className="text-xl font-bold mb-4">プロジェクトが見つかりません</p>
        <Button onClick={() => router.push('/')} className="bg-primary hover:brightness-110 text-primary-foreground font-bold h-10 px-8 rounded-md transition-all">ダッシュボードへ戻る</Button>
      </div>
    );
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateProject(project.id, (p) => {
      p.name = e.target.value;
    });
  };

  const generalCategories = Array.from(new Set(project.generalQuestions.map((q) => q.category)));

  const outlineButton = "h-8 px-3 text-xs font-bold rounded-md border border-primary/60 bg-transparent text-primary hover:bg-primary/10 hover:text-primary";

  return (
    <main className="h-full min-h-0 flex flex-col bg-background text-foreground font-sans">

      {/* Header Area */}
      <header className="relative z-40 flex-none flex flex-wrap items-center gap-x-3 gap-y-2 px-3 sm:px-4 py-2 border-b border-border bg-card">
        <Button variant="ghost" size="icon" onClick={() => router.push('/hearing')} className="hover:bg-secondary text-muted-foreground hover:text-primary rounded-md shrink-0 border border-transparent hover:border-border h-8 w-8">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
          <button onClick={() => router.push('/')} className="hover:text-primary transition-colors flex items-center gap-1"><Home className="w-3 h-3" /> Dashboard</button>
          <span className="opacity-60">/</span>
          <button onClick={() => router.push('/hearing')} className="hover:text-primary transition-colors">Hearing</button>
          <span className="opacity-60">/</span>
          <span className="text-foreground">Editing</span>
        </div>
        <Badge className="bg-primary/10 text-primary border-none font-bold text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wide">
          Editing Project
        </Badge>
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">ID: {project.id.toUpperCase().substring(0, 8)}</span>
        <Input
          value={project.name}
          onChange={handleNameChange}
          className="flex-1 basis-40 min-w-0 max-w-[250px] h-8 rounded-md border border-border bg-input px-2.5 text-sm font-bold text-foreground uppercase focus-visible:ring-1 focus-visible:ring-primary"
          placeholder="プロジェクト名を入力..."
        />

        <div className="flex flex-wrap items-center gap-2 ml-auto">
          <Button
            variant="outline"
            onClick={() => {
              if (confirm('この内容で案件管理を作成しますか？\n（シートはアーカイブフォルダへ移動します）')) {
                useHearsStore.getState().convertToCase(project.id);
                router.push('/cases');
              }
            }}
            className={outlineButton}
          >
            <Briefcase className="w-3.5 h-3.5 mr-1.5" />
            案件管理に変換して作成
          </Button>

          <div className="relative group">
            <Button variant="outline" className={outlineButton}>
              既存の案件に紐付け
            </Button>
            <div className="absolute top-full mt-2 right-0 w-80 max-w-[calc(100vw-1.5rem)] bg-popover border border-border rounded-md shadow-md z-50 p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <h4 className="text-[11px] font-bold text-muted-foreground uppercase mb-2">紐付ける案件を選択</h4>
              <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                {useHearsStore.getState().cases.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground py-2 text-center">案件がありません</p>
                ) : (
                  useHearsStore.getState().cases.map(c => (
                    <button key={c.id} onClick={() => {
                      if (confirm(`「${c.name}」にこのヒアリングシートを紐付けますか？`)) {
                        useHearsStore.getState().updateCase(c.id, draft => { 
                          draft.projectId = project.id; 
                          if (!draft.clientName) draft.clientName = project.basicInfo.clientName || project.name;
                          if (!draft.technicalInfo.url) draft.technicalInfo.url = project.basicInfo.urlOrDomain; 
                        });
                        useHearsStore.getState().updateProject(project.id, p => { p.folder = 'backup'; });
                        router.push(`/cases/${c.id}`);
                      }
                    }} className="w-full text-left px-2 py-1.5 hover:bg-secondary rounded-md text-xs font-bold truncate">
                      {c.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <Button onClick={() => router.push('/hearing')} className="h-8 px-4 text-xs font-bold rounded-md bg-primary hover:brightness-110 text-primary-foreground transition-all active:scale-95 shadow-none">
            <Save className="w-3.5 h-3.5 mr-1.5" />
            保存して戻る
          </Button>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex">
        {/* 左：セクション一覧のツリー（PCのみ） */}
        <aside className="hidden lg:flex flex-col w-[228px] shrink-0 gap-px p-2 pt-3 bg-card border-r border-border overflow-y-auto custom-scrollbar">
          <div className="px-2 pb-1.5 text-[10px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
            セクション
          </div>
          <TreeItem label="クライアント基本情報" active={activeSection === 'sec-basic'} onClick={() => jumpTo('sec-basic')} />
          <TreeItem label="ラブホテル特化テンプレート" glyph={activeTab === 'loveHotel' ? '▾' : '▸'} onClick={() => selectTemplate('loveHotel')} />
          {activeTab === 'loveHotel' && LOVE_HOTEL_SECTIONS.map((sec) => (
            <TreeItem key={sec.id} depth={1} label={sec.label} active={activeSection === sec.id} onClick={() => jumpTo(sec.id)} />
          ))}
          <TreeItem label="汎用要件定義テンプレート" glyph={activeTab === 'general' ? '▾' : '▸'} onClick={() => selectTemplate('general')} />
          {activeTab === 'general' && generalCategories.map((cat, i) => (
            <TreeItem key={cat} depth={1} label={cat} active={activeSection === `sec-gen-${i}`} onClick={() => jumpTo(`sec-gen-${i}`)} />
          ))}
        </aside>

        {/* 中央：入力（ここがスクロール領域） */}
        <div ref={scrollRef} onScroll={updateSpy} className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {/* スマホ用：セクション切替チップ（ツリーの代わり） */}
          <div className="lg:hidden sticky top-0 z-20 flex gap-1.5 overflow-x-auto scrollbar-hide px-3 py-2 bg-background border-b border-border">
            <button
              type="button"
              onClick={() => jumpTo('sec-basic')}
              className={cn(
                "shrink-0 rounded-md border px-2.5 py-1 text-[11px] font-bold transition-colors",
                activeSection === 'sec-basic' ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"
              )}
            >
              基本情報
            </button>
            {activeTab === 'loveHotel'
              ? LOVE_HOTEL_SECTIONS.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => jumpTo(sec.id)}
                    className={cn(
                      "shrink-0 rounded-md border px-2.5 py-1 text-[11px] font-bold transition-colors",
                      activeSection === sec.id ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"
                    )}
                  >
                    {sec.chip}
                  </button>
                ))
              : generalCategories.map((cat, i) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => jumpTo(`sec-gen-${i}`)}
                    className={cn(
                      "shrink-0 rounded-md border px-2.5 py-1 text-[11px] font-bold transition-colors",
                      activeSection === `sec-gen-${i}` ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"
                    )}
                  >
                    {cat}
                  </button>
                ))}
          </div>

          <div className="max-w-5xl mx-auto w-full px-3 sm:px-4 lg:px-5 pt-3 sm:pt-4 pb-28 space-y-3">
            <BasicInfo project={project} />

            <div id="tabs-anchor" />
            <Tabs
              value={activeTab}
              className="w-full gap-3"
              onValueChange={(val) => setActiveTab(val as 'loveHotel' | 'general')}
            >
              <TabsList
                variant="line"
                className="w-full justify-start gap-0 p-0 rounded-none border-b border-border group-data-horizontal/tabs:h-auto"
              >
                <TabsTrigger value="loveHotel" className="flex-none h-auto rounded-none px-3.5 py-1.5 text-[11px] font-bold text-muted-foreground data-active:text-foreground group-data-horizontal/tabs:after:bottom-[-1px] after:bg-primary gap-2">
                  🏩 ラブホテル特化テンプレート
                </TabsTrigger>
                <TabsTrigger value="general" className="flex-none h-auto rounded-none px-3.5 py-1.5 text-[11px] font-bold text-muted-foreground data-active:text-foreground group-data-horizontal/tabs:after:bottom-[-1px] after:bg-primary gap-2">
                  🌍 汎用要件定義テンプレート
                </TabsTrigger>
              </TabsList>

              <TabsContent value="loveHotel" className="mt-0 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in duration-300">
                <LoveHotelTab project={project} />
              </TabsContent>

              <TabsContent value="general" className="mt-0 focus-visible:outline-none focus-visible:ring-0 w-full max-w-none animate-in fade-in duration-300">
                <GeneralTab project={project} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <ExportPanel project={project} activeTab={activeTab} />
      
      {/* Scroll to Top Button */}
      <Button 
        onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="fixed bottom-4 right-16 w-10 h-10 rounded-full bg-card text-primary border border-border hover:border-primary/50 hover:bg-secondary transition-all active:scale-95 z-50 flex items-center justify-center shadow-sm"
      >
        <ArrowUp className="w-4 h-4" />
      </Button>
    </main>
  );
}
