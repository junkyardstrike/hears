'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useHearsStore } from '@/store/useHearsStore';
import { BasicInfo } from '@/components/BasicInfo';
import { LoveHotelTab } from '@/components/LoveHotelTab';
import { GeneralTab } from '@/components/GeneralTab';
import { ExportPanel } from '@/components/ExportPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Briefcase, FileText, ChevronLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function Editor() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  
  const { projects, updateProject } = useHearsStore();
  const [activeTab, setActiveTab] = useState<'loveHotel' | 'general'>('loveHotel');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const project = projects.find(p => p.id === projectId);

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-foreground font-[family-name:var(--font-noto)] bg-background">
        <p className="text-xl font-bold mb-4">プロジェクトが見つかりません</p>
        <Button onClick={() => router.push('/')} className="bg-primary text-white font-bold h-12 px-8 rounded-2xl">ダッシュボードへ戻る</Button>
      </div>
    );
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateProject(project.id, (p) => {
      p.name = e.target.value;
    });
  };

  return (
    <main className="min-h-screen bg-background text-[#2D3436] pb-40 pt-8 px-4 sm:px-8 max-w-7xl mx-auto w-full font-[family-name:var(--font-noto)]">
      
      {/* Header Area */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 gap-8 border-b border-border/50 pb-10">
        <div className="flex items-center gap-6 w-full xl:w-auto min-w-0">
          <Button variant="ghost" size="icon" onClick={() => router.push('/hearing')} className="hover:bg-primary/5 text-muted-foreground hover:text-primary rounded-2xl shrink-0">
            <ChevronLeft className="w-8 h-8" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <Badge className="bg-primary/10 text-primary border-none font-bold text-[9px] px-2.5 py-0.5 rounded-lg uppercase tracking-widest">
                Editing Project
              </Badge>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">ID: {project.id.toUpperCase().substring(0, 8)}</span>
            </div>
            <Input 
              value={project.name} 
              onChange={handleNameChange} 
              className="text-3xl sm:text-4xl font-bold italic tracking-tighter bg-transparent border-none focus-visible:ring-0 px-0 h-auto py-0 text-foreground w-full font-[family-name:var(--font-outfit)] uppercase"
              placeholder="プロジェクト名を入力..."
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full xl:w-auto">
          <Button 
            onClick={() => {
              if (confirm('この内容で案件管理を作成しますか？\n（シートはアーカイブフォルダへ移動します）')) {
                useHearsStore.getState().convertToCase(project.id);
                router.push('/cases');
              }
            }} 
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 px-8 rounded-2xl shadow-xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Briefcase className="w-5 h-5 mr-2" />
            案件管理に変換して作成
          </Button>
          
          <Button onClick={() => router.push('/hearing')} className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-white font-bold h-14 px-10 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
            <Save className="w-5 h-5 mr-2" />
            保存して戻る
          </Button>
        </div>
      </div>

      <div className="mb-12">
        <BasicInfo project={project} />
      </div>

      <Tabs 
        defaultValue="loveHotel" 
        className="w-full space-y-10" 
        onValueChange={(val) => setActiveTab(val as 'loveHotel' | 'general')}
      >
        <TabsList className="bg-secondary/50 border border-border p-1.5 h-16 rounded-[2rem] paper-shadow-sm flex overflow-hidden">
          <TabsTrigger value="loveHotel" className="flex-1 h-full text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:paper-shadow rounded-2xl transition-all gap-2">
            🏩 ラブホテル特化テンプレート
          </TabsTrigger>
          <TabsTrigger value="general" className="flex-1 h-full text-sm font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:paper-shadow rounded-2xl transition-all gap-2">
            🌍 汎用要件定義テンプレート
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="loveHotel" className="mt-0 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in duration-500">
          <LoveHotelTab project={project} />
        </TabsContent>
        
        <TabsContent value="general" className="mt-0 focus-visible:outline-none focus-visible:ring-0 w-full max-w-none animate-in fade-in duration-500">
          <GeneralTab project={project} />
        </TabsContent>
      </Tabs>

      <ExportPanel project={project} activeTab={activeTab} />
      
    </main>
  );
}
