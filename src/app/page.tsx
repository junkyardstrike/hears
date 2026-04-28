'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useHearsStore } from '@/store/useHearsStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { format } from 'date-fns';
import { Plus, Trash2, Edit, Download, Upload, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { projects, createProject, deleteProject, importProjects } = useHearsStore();
  const [mounted, setMounted] = useState(false);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    checkStorage();
    persistStorage();
  }, []);

  const persistStorage = async () => {
    if (navigator.storage && navigator.storage.persist) {
      await navigator.storage.persist();
    }
  };

  const checkStorage = async () => {
    if (navigator.storage && navigator.storage.estimate) {
      try {
        const estimate = await navigator.storage.estimate();
        if (estimate.usage && estimate.quota) {
          const usagePercentage = (estimate.usage / estimate.quota) * 100;
          if (usagePercentage > 80) {
            setStorageWarning(`ストレージの空き容量が少なくなっています。バックアップ（エクスポート）を推奨します。`);
          }
        }
      } catch (err) {
        console.error("Storage estimation failed", err);
      }
    }
  };

  const handleCreate = () => {
    const name = prompt('新規プロジェクト名を入力してください', '新規ヒアリングシート');
    if (name) {
      const id = createProject(name);
      router.push(`/editor/${id}`);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(projects);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const exportFileDefaultName = `hears_backup_${format(new Date(), 'yyyyMMdd_HHmmss')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', url);
    linkElement.setAttribute('download', exportFileDefaultName);
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedData)) {
          if (confirm('現在のデータが上書きされます。よろしいですか？')) {
            importProjects(importedData);
            alert('インポートが完了しました。');
          }
        } else {
          alert('不正なファイル形式です。');
        }
      } catch (err) {
        alert('ファイルの読み込みに失敗しました。');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 sm:mb-12 gap-6">
        <div className="relative pl-0 sm:pl-6">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary via-primary/50 to-transparent rounded-full hidden sm:block"></div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tighter text-white leading-[0.8] mb-4">
            HEARS
            <span className="block text-[10px] sm:text-xs font-bold tracking-[0.4em] text-primary/70 mt-3 uppercase">
              Management System
            </span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base font-medium max-w-xs leading-relaxed opacity-60">
            プロフェッショナルな案件管理と<br className="sm:hidden" />確実なバックアップ体制
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()} 
            className="flex-1 sm:flex-none border-border hover:bg-white/5 h-10 sm:h-11 px-3 sm:px-4"
          >
            <Upload className="w-4 h-4 mr-2" />
            <span className="text-sm">インポート</span>
          </Button>
          <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImport} />
          
          <Button 
            variant="outline" 
            onClick={handleExport} 
            className="flex-1 sm:flex-none border-border hover:bg-white/5 h-10 sm:h-11 px-3 sm:px-4"
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="text-sm">全出力</span>
          </Button>
          
          <Button 
            onClick={handleCreate} 
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-10 sm:h-11 px-6 shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5 mr-1" />
            新規作成
          </Button>
        </div>
      </div>

      {storageWarning && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-md mb-8 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          <p className="font-medium">{storageWarning}</p>
        </div>
      )}

      {projects.length === 0 ? (
        <Card className="bg-card border-dashed border-border/50 py-12">
          <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground">
            <p className="text-xl mb-4">プロジェクトがありません</p>
            <Button onClick={handleCreate} variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
              <Plus className="w-4 h-4 mr-2" />
              最初のシートを作成
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.sort((a, b) => b.updatedAt - a.updatedAt).map((project) => (
            <Card key={project.id} className="bg-card border-border hover:border-primary/50 transition-colors flex flex-col group">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-white truncate" title={project.name}>{project.name}</CardTitle>
                <CardDescription>
                  更新: {format(new Date(project.updatedAt), 'yyyy/MM/dd HH:mm')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  クライアント: {project.basicInfo.clientName || '未入力'} <br/>
                  担当者: {project.basicInfo.managerName || '未入力'}
                </p>
              </CardContent>
              <CardFooter className="pt-4 border-t border-border/50 flex justify-between">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => {
                  if(confirm('本当に削除しますか？')) deleteProject(project.id);
                }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium tracking-wide" onClick={() => router.push(`/editor/${project.id}`)}>
                  <Edit className="w-4 h-4 mr-2" />
                  編集する
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
