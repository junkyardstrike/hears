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
import { ArrowLeft, Save, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
      <div className="min-h-screen flex flex-col items-center justify-center text-white bg-background">
        <p className="text-xl mb-4">プロジェクトが見つかりません</p>
        <Button onClick={() => router.push('/')}>ダッシュボードへ戻る</Button>
      </div>
    );
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateProject(project.id, (p) => {
      p.name = e.target.value;
    });
  };

  const persistStorage = async () => {
    if (navigator.storage && navigator.storage.persist) {
      const isPersisted = await navigator.storage.persist();
      console.log(`Persisted storage status: ${isPersisted}`);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground pb-32 pt-4 sm:pt-8 px-4 sm:px-8 max-w-7xl mx-auto w-full">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-border/50 pb-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="hover:bg-white/5">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <p className="text-sm text-primary mb-1 font-semibold tracking-wider uppercase">Project Name</p>
            <Input 
              value={project.name} 
              onChange={handleNameChange} 
              className="text-2xl font-bold bg-transparent border-none focus-visible:ring-1 focus-visible:ring-primary px-1 h-auto py-1 text-white w-full max-w-sm"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => {
              if (confirm('この内容で案件管理を作成しますか？\n（シートはバックアップフォルダへ移動します）')) {
                useHearsStore.getState().convertToCase(project.id);
                router.push('/');
              }
            }} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 px-4 shadow-lg shadow-blue-500/20"
          >
            <Briefcase className="w-4 h-4 mr-2" />
            案件管理を作成
          </Button>
          
          <Button onClick={persistStorage} variant="outline" className="border-border hover:bg-white/5 text-muted-foreground whitespace-nowrap h-10">
            <Save className="w-4 h-4 mr-2" />
            保存
          </Button>
        </div>
      </div>

      <BasicInfo project={project} />

      <Tabs 
        defaultValue="loveHotel" 
        className="w-full" 
        onValueChange={(val) => setActiveTab(val as 'loveHotel' | 'general')}
      >
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-[#161618] border border-border h-14 p-1 rounded-xl shadow-lg">
          <TabsTrigger value="loveHotel" className="h-full text-base font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all">
            🏩 ラブホテル特化
          </TabsTrigger>
          <TabsTrigger value="general" className="h-full text-base font-medium data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground rounded-lg transition-all">
            🌍 汎用テンプレート
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="loveHotel" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <LoveHotelTab project={project} />
        </TabsContent>
        
        <TabsContent value="general" className="mt-0 focus-visible:outline-none focus-visible:ring-0 w-full max-w-none">
          <div className="w-full">
            <GeneralTab project={project} />
          </div>
        </TabsContent>
      </Tabs>

      <ExportPanel project={project} activeTab={activeTab} />
      
    </main>
  );
}
