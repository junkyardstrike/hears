'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useHearsStore, ProjectData, HearingFolder } from '@/store/useHearsStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { format } from 'date-fns';
import { Plus, Trash2, Edit, FolderOpen, Clock, Archive, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export function HearingView() {
  const router = useRouter();
  const { projects, createProject, deleteProject } = useHearsStore();
  const [search, setSearch] = useState('');

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.basicInfo.clientName.toLowerCase().includes(search.toLowerCase())
  );

  const renderProjectList = (folder: HearingFolder) => {
    const list = filteredProjects.filter(p => p.folder === folder);
    
    if (list.length === 0) {
      return (
        <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
          <p className="text-muted-foreground italic">このフォルダは空です</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.sort((a, b) => b.updatedAt - a.updatedAt).map((p) => (
          <Card key={p.id} className="bg-[#0c0c0e] border-white/5 hover:border-primary/40 transition-all group">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-bold truncate pr-4">{p.name}</CardTitle>
                <div className="text-[10px] px-2 py-1 rounded bg-white/5 text-muted-foreground font-mono">
                  {format(new Date(p.updatedAt), 'MM/dd HH:mm')}
                </div>
              </div>
              <CardDescription className="text-xs opacity-50">
                {p.basicInfo.clientName || 'クライアント未入力'}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-between pt-0">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { if(confirm('削除しますか？')) deleteProject(p.id) }}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                onClick={() => router.push(`/editor/${p.id}`)}
                className="bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20"
              >
                <Edit className="w-4 h-4 mr-2" /> 編集
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  const handleCreate = () => {
    const name = prompt('ヒアリングシート名', '新規プロジェクト');
    if (name) {
      const id = createProject(name);
      router.push(`/editor/${id}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="シートを検索..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 focus-visible:ring-primary/40"
          />
        </div>
        <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90 text-black font-bold h-11 px-6 rounded-2xl glow-primary transition-all active:scale-95 shrink-0">
          <Plus className="w-5 h-5 mr-2" /> ヒアリングを新規作成
        </Button>
      </div>

      <Tabs defaultValue="not-started" className="w-full">
        <TabsList className="bg-black/40 border border-white/5 p-1 h-12 mb-6 sm:mb-8 w-full overflow-x-auto justify-start sm:justify-center no-scrollbar">
          <TabsTrigger value="not-started" className="flex-1 sm:flex-none data-[state=active]:bg-primary data-[state=active]:text-white text-[10px] sm:text-sm">
            <Clock className="w-3 h-3 sm:w-4 h-4 mr-1 sm:mr-2" /> 未着手
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="flex-1 sm:flex-none data-[state=active]:bg-primary data-[state=active]:text-white text-[10px] sm:text-sm">
            <FolderOpen className="w-3 h-3 sm:w-4 h-4 mr-1 sm:mr-2" /> 進行中
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex-1 sm:flex-none data-[state=active]:bg-primary data-[state=active]:text-white text-[10px] sm:text-sm">
            <Archive className="w-3 h-3 sm:w-4 h-4 mr-1 sm:mr-2" /> バックアップ
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="not-started">{renderProjectList('not-started')}</TabsContent>
        <TabsContent value="in-progress">{renderProjectList('in-progress')}</TabsContent>
        <TabsContent value="backup">{renderProjectList('backup')}</TabsContent>
      </Tabs>
    </div>
  );
}
