'use client';

import { use, useState, useEffect } from 'react';
import { useHearsStore, CaseData, ProjectData } from '@/store/useHearsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { 
  ChevronLeft, Shield, Server, FileText, CheckCircle2, 
  Circle, Plus, Trash2, X, ExternalLink, Globe, Lock, Info,
  Layout, ListTodo, ClipboardList, Database
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { cases, projects, updateCase } = useHearsStore();
  const [newTodo, setNewTodo] = useState('');

  const c = cases.find(item => item.id === id);
  const project = projects.find(p => p.id === c?.projectId);

  if (!c) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold text-white mb-4">案件が見つかりません</h2>
        <Button onClick={() => router.push('/cases')} className="bg-primary text-black font-bold">案件一覧へ戻る</Button>
      </div>
    );
  }

  const handleUpdate = (updater: (draft: CaseData) => void) => {
    updateCase(c.id, updater);
  };

  const updateTechnicalInfo = (key: keyof CaseData['technicalInfo'], val: string) => {
    handleUpdate(draft => {
      draft.technicalInfo[key] = val;
    });
  };

  const addTodo = () => {
    if (!newTodo.trim()) return;
    handleUpdate(draft => {
      draft.todos.push({
        id: Math.random().toString(36).substring(2, 9),
        text: newTodo,
        completed: false,
        createdAt: Date.now()
      });
    });
    setNewTodo('');
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-32">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/cases')} className="text-muted-foreground hover:text-white">
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <Badge className="bg-primary/20 text-primary border-none">
                {c.status === 'active' ? '進行中' : c.status === 'completed' ? '完了' : 'アーカイブ'}
              </Badge>
              <span className="text-[10px] font-bold text-muted-foreground opacity-50 uppercase tracking-widest">Case Management</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black italic tracking-tighter text-white truncate">{c.name}</h1>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => handleUpdate(draft => {
              draft.status = draft.status === 'active' ? 'completed' : 'active';
            })}
            className="flex-1 sm:flex-none border-white/10 hover:bg-white/5 font-bold text-xs h-11 px-6 rounded-2xl"
          >
            {c.status === 'active' ? '完了にする' : '進行中に戻す'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-black/40 border border-white/5 p-1 h-14 mb-8 w-full overflow-x-auto justify-start no-scrollbar rounded-2xl">
          <TabsTrigger value="overview" className="flex items-center gap-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-black rounded-xl">
            <Layout className="w-4 h-4" /> 概要・管理
          </TabsTrigger>
          <TabsTrigger value="hearing" className="flex items-center gap-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-black rounded-xl">
            <ClipboardList className="w-4 h-4" /> ヒアリング詳細
          </TabsTrigger>
          <TabsTrigger value="technical" className="flex items-center gap-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-black rounded-xl">
            <Database className="w-4 h-4" /> 技術情報・メモ
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Summary Cards */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="bg-[#0c0c0e] border-white/5 rounded-[2rem] overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Info className="w-3 h-3 text-blue-500" /> 基本情報
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">クライアント名</span>
                      <span className="text-white font-bold">{c.clientName || '未設定'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">作成日</span>
                      <span className="text-white font-medium">{format(new Date(c.createdAt), 'yyyy年MM月dd日')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">最終更新</span>
                      <span className="text-white font-medium">{format(new Date(c.updatedAt), 'yyyy年MM月dd日 HH:mm')}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#0c0c0e] border-white/5 rounded-[2rem] overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Globe className="w-3 h-3 text-emerald-500" /> 公開URL
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {c.technicalInfo.url ? (
                      <a 
                        href={c.technicalInfo.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-lg font-bold text-primary hover:underline flex items-center gap-2 break-all"
                      >
                        {c.technicalInfo.url} <ExternalLink className="w-4 h-4 shrink-0" />
                      </a>
                    ) : (
                      <p className="text-muted-foreground text-sm italic">URLが設定されていません</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Tasks Section */}
              <Card className="bg-[#0c0c0e] border-white/5 rounded-[2rem] overflow-hidden">
                <CardHeader className="border-b border-white/5 p-6 sm:p-8">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                      <ListTodo className="w-6 h-6 text-primary" /> 案件別タスク
                    </CardTitle>
                    <Badge variant="outline" className="text-primary border-primary/20">
                      残り {c.todos.filter(t => !t.completed).length} 件
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="新しいタスクを入力..." 
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                      className="bg-black/40 border-white/10 h-12 rounded-xl focus-visible:ring-primary/40"
                    />
                    <Button onClick={addTodo} className="bg-primary text-black font-bold h-12 w-12 rounded-xl shrink-0">
                      <Plus className="w-6 h-6" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {c.todos.length === 0 ? (
                      <div className="text-center py-12 opacity-30 italic text-sm">タスクはありません</div>
                    ) : (
                      c.todos.sort((a, b) => b.createdAt - a.createdAt).map((todo) => (
                        <div 
                          key={todo.id} 
                          className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${todo.completed ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-white/5 border-white/5 group hover:border-white/10'}`}
                        >
                          <button 
                            onClick={() => handleUpdate(draft => {
                              const t = draft.todos.find(i => i.id === todo.id);
                              if (t) t.completed = !t.completed;
                            })}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${todo.completed ? 'bg-primary border-primary text-black' : 'border-white/20 hover:border-primary/50'}`}
                          >
                            {todo.completed && <CheckCircle2 className="w-4 h-4" />}
                          </button>
                          <span className={`text-sm sm:text-base flex-1 ${todo.completed ? 'text-muted-foreground line-through' : 'text-white font-medium'}`}>
                            {todo.text}
                          </span>
                          <button 
                            onClick={() => handleUpdate(draft => {
                              draft.todos = draft.todos.filter(i => i.id !== todo.id);
                            })}
                            className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Technical Sidebar Preview */}
            <div className="space-y-6">
              <Card className="bg-[#0c0c0e] border-white/5 rounded-[2rem] overflow-hidden border-l-4 border-l-blue-500">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-400" /> アクセス情報
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ID / パスワード</p>
                    <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-sm font-mono text-blue-400">
                      {c.technicalInfo.idPass || '未設定'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">サーバー情報</p>
                    <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-sm font-mono text-white">
                      {c.technicalInfo.server || '未設定'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Hearing Detail Tab */}
        <TabsContent value="hearing">
          {!project ? (
            <Card className="bg-[#0c0c0e] border-white/5 rounded-[2rem] p-12 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto opacity-20" />
                <h3 className="text-xl font-bold text-white">ヒアリングデータが紐づいていません</h3>
                <p className="text-muted-foreground text-sm">
                  この案件は直接作成されたか、元のヒアリングシートが削除された可能性があります。
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-8 pb-20">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white italic">ヒアリングシート内容の参照</h2>
                <Button 
                  variant="ghost" 
                  onClick={() => router.push(`/editor/${project.id}`)}
                  className="text-primary hover:bg-primary/10"
                >
                  エディタで開く <ExternalLink className="ml-2 w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Basic Section */}
                <section className="space-y-4">
                  <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                    <div className="w-1 h-6 bg-primary rounded-full" /> 基本情報
                  </h3>
                  <div className="bg-[#0c0c0e] border border-white/5 rounded-3xl p-6 space-y-4 shadow-xl">
                    {Object.entries(project.basicInfo).map(([key, value]) => (
                      <div key={key} className="flex flex-col border-b border-white/5 pb-3 last:border-0 last:pb-0">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{key}</span>
                        <span className="text-white font-medium">{value || '---'}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Love Hotel Detail if exists */}
                {project.loveHotel && (
                  <section className="space-y-4">
                    <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                      <div className="w-1 h-6 bg-primary rounded-full" /> 詳細情報・設備
                    </h3>
                    <div className="bg-[#0c0c0e] border border-white/5 rounded-3xl p-6 space-y-6 shadow-xl">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">アピールポイント</span>
                        <p className="text-white text-sm whitespace-pre-wrap leading-relaxed">{project.loveHotel.sellingPoints || '---'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">共通設備</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {project.loveHotel.commonEquipments.map((e: any) => (
                              <Badge key={e.id} variant="outline" className="bg-white/5 border-white/10 text-white">{e.name}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">客室数</span>
                          <p className="text-white text-xl font-black italic">{project.loveHotel.rooms.length} <span className="text-xs not-italic font-bold opacity-40">ROOMS</span></p>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* General Questions Section */}
                {project.generalQuestions.length > 0 && (
                  <section className="xl:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                      <div className="w-1 h-6 bg-primary rounded-full" /> アンケート・要件回答
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {project.generalQuestions.map((q: any) => (
                        <Card key={q.id} className="bg-[#0c0c0e] border-white/5 rounded-2xl p-4">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2 opacity-50">{q.category} / {q.label}</p>
                          <p className="text-white text-sm font-medium">{q.value || '回答なし'}</p>
                        </Card>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Technical Tab */}
        <TabsContent value="technical" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-[#0c0c0e] border-white/5 rounded-[2rem] overflow-hidden p-6 sm:p-8 space-y-6">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                <Lock className="w-6 h-6 text-blue-500" /> 技術情報の編集
              </CardTitle>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">公開用 URL / ドメイン</label>
                  <div className="flex gap-2">
                    <Input 
                      value={c.technicalInfo.url} 
                      onChange={(e) => updateTechnicalInfo('url', e.target.value)}
                      placeholder="https://example.com"
                      className="bg-black/40 border-white/10 h-12"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">管理用 ID / パスワード</label>
                    <Input 
                      value={c.technicalInfo.idPass} 
                      onChange={(e) => updateTechnicalInfo('idPass', e.target.value)}
                      placeholder="admin / pass123"
                      className="bg-black/40 border-white/10 h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">サーバー・FTP情報</label>
                    <Input 
                      value={c.technicalInfo.server} 
                      onChange={(e) => updateTechnicalInfo('server', e.target.value)}
                      placeholder="Host / User / IP"
                      className="bg-black/40 border-white/10 h-12"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-[#0c0c0e] border-white/5 rounded-[2rem] overflow-hidden p-6 sm:p-8 space-y-6">
              <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                <FileText className="w-6 h-6 text-orange-500" /> 運用メモ
              </CardTitle>
              <Textarea 
                value={c.technicalInfo.memo} 
                onChange={(e) => updateTechnicalInfo('memo', e.target.value)}
                placeholder="案件の進捗や注意点、顧客との調整事項などを記録してください..."
                className="min-h-[250px] bg-black/40 border-white/10 rounded-2xl resize-none p-6 text-lg leading-relaxed"
              />
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
