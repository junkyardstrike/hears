'use client';

import { useState } from 'react';
import { useHearsStore, CaseData, TodoItem } from '@/store/useHearsStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { format } from 'date-fns';
import { 
  Plus, Trash2, ExternalLink, Shield, Server, FileText, 
  CheckCircle2, Circle, MoreVertical, X, Check, Clock
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export function CasesView() {
  const { cases, createCase, deleteCase, updateCase } = useHearsStore();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  
  const selectedCase = cases.find(c => c.id === selectedCaseId);

  const handleCreate = () => {
    const name = prompt('案件名を入力してください', '新規案件');
    if (name) createCase(name);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-3 py-1">
            {cases.length}
          </Badge>
          ACTIVE PROJECTS
        </h2>
        <Button onClick={handleCreate} className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 shadow-lg shadow-blue-500/20">
          <Plus className="w-5 h-5 mr-1" /> 新規案件
        </Button>
      </div>

      {cases.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.02]">
          <p className="text-muted-foreground italic mb-4">現在進行中の案件はありません</p>
          <Button variant="outline" onClick={handleCreate}>最初の案件を作成</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.sort((a, b) => b.updatedAt - a.updatedAt).map((c) => (
            <Card 
              key={c.id} 
              onClick={() => setSelectedCaseId(c.id)}
              className="bg-[#0c0c0e] border-white/5 hover:border-blue-500/40 transition-all group cursor-pointer overflow-hidden"
            >
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-transparent opacity-50" />
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-bold truncate pr-4 text-white group-hover:text-blue-400 transition-colors">
                    {c.name}
                  </CardTitle>
                  <Badge className="bg-blue-500/10 text-blue-400 border-none uppercase text-[9px] tracking-widest">
                    {c.status}
                  </Badge>
                </div>
                <CardDescription className="text-xs opacity-50 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> {format(new Date(c.updatedAt), 'yyyy/MM/dd')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/5 p-2 rounded-lg">
                    <ExternalLink className="w-3 h-3 text-blue-500" />
                    <span className="truncate">{c.technicalInfo.url || 'URL未設定'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                    <span>TASKS</span>
                    <span>{c.todos.filter(t => t.completed).length} / {c.todos.length}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] transition-all duration-500"
                      style={{ width: `${c.todos.length > 0 ? (c.todos.filter(t => t.completed).length / c.todos.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Case Detail Dialog */}
      <Dialog open={!!selectedCaseId} onOpenChange={(open) => !open && setSelectedCaseId(null)}>
        <DialogContent className="max-w-2xl bg-[#050505] border-white/10 text-white overflow-y-auto max-h-[90vh]">
          {selectedCase && (
            <CaseDetailView c={selectedCase} onClose={() => setSelectedCaseId(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CaseDetailView({ c, onClose }: { c: CaseData, onClose: () => void }) {
  const { updateCase, deleteCase } = useHearsStore();
  const [newTodo, setNewTodo] = useState('');

  const updateInfo = (key: keyof CaseData['technicalInfo'], val: string) => {
    updateCase(c.id, (draft) => {
      draft.technicalInfo[key] = val;
    });
  };

  const addTodo = () => {
    if (!newTodo.trim()) return;
    updateCase(c.id, (draft) => {
      draft.todos.push({
        id: Math.random().toString(36).substring(2, 9),
        text: newTodo,
        completed: false,
        createdAt: Date.now()
      });
    });
    setNewTodo('');
  };

  const toggleTodo = (todoId: string) => {
    updateCase(c.id, (draft) => {
      const todo = draft.todos.find(t => t.id === todoId);
      if (todo) todo.completed = !todo.completed;
    });
  };

  const deleteTodo = (todoId: string) => {
    updateCase(c.id, (draft) => {
      draft.todos = draft.todos.filter(t => t.id !== todoId);
    });
  };

  return (
    <div className="space-y-8 py-4">
      <DialogHeader>
        <div className="flex justify-between items-start pr-8">
          <div>
            <DialogTitle className="text-3xl font-black italic tracking-tighter mb-2">{c.name}</DialogTitle>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>CREATED: {format(new Date(c.createdAt), 'yyyy/MM/dd')}</span>
              <span>ID: {c.id}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => {
            if(confirm('案件を削除しますか？')) {
              deleteCase(c.id);
              onClose();
            }
          }} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Technical Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-blue-400 text-sm font-bold tracking-widest uppercase">
            <Shield className="w-4 h-4" /> Technical Info
          </div>
          <div className="space-y-4 bg-white/[0.03] p-4 rounded-2xl border border-white/5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground">SITE URL</label>
              <Input 
                value={c.technicalInfo.url} 
                onChange={(e) => updateInfo('url', e.target.value)}
                placeholder="https://..."
                className="bg-black/40 border-white/5 focus-visible:ring-blue-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground">ID / PASSWORD</label>
              <Input 
                value={c.technicalInfo.idPass} 
                onChange={(e) => updateInfo('idPass', e.target.value)}
                placeholder="admin / pass123"
                className="bg-black/40 border-white/5 focus-visible:ring-blue-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground">SERVER / FTP</label>
              <Input 
                value={c.technicalInfo.server} 
                onChange={(e) => updateInfo('server', e.target.value)}
                placeholder="Server name or IP"
                className="bg-black/40 border-white/5 focus-visible:ring-blue-500/50"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-blue-400 text-sm font-bold tracking-widest uppercase">
              <FileText className="w-4 h-4" /> Memo
            </div>
            <Textarea 
              value={c.technicalInfo.memo} 
              onChange={(e) => updateInfo('memo', e.target.value)}
              placeholder="案件に関するメモ..."
              className="min-h-[120px] bg-white/[0.03] border-white/5 focus-visible:ring-blue-500/50 rounded-2xl"
            />
          </div>
        </div>

        {/* ToDo List */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-blue-400 text-sm font-bold tracking-widest uppercase">
            <CheckCircle2 className="w-4 h-4" /> Tasks
          </div>
          <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 flex flex-col h-full max-h-[400px]">
            <div className="flex gap-2 mb-4">
              <Input 
                placeholder="新しいタスクを追加..." 
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTodo()}
                className="bg-black/40 border-white/5"
              />
              <Button size="icon" onClick={addTodo} className="bg-blue-500 hover:bg-blue-600 shrink-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
              {c.todos.length === 0 ? (
                <p className="text-center py-10 text-xs text-muted-foreground italic">タスクはありません</p>
              ) : (
                c.todos.sort((a, b) => b.createdAt - a.createdAt).map((todo) => (
                  <div key={todo.id} className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5 group">
                    <button onClick={() => toggleTodo(todo.id)} className="shrink-0 transition-colors">
                      {todo.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-blue-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground/30" />
                      )}
                    </button>
                    <span className={`text-sm flex-1 ${todo.completed ? 'line-through text-muted-foreground' : 'text-white'}`}>
                      {todo.text}
                    </span>
                    <button onClick={() => deleteTodo(todo.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
