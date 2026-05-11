'use client';

import { useState } from 'react';
import { useHearsStore, TodoItem } from '@/store/useHearsStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { 
  CheckCircle2, Circle, ArrowUpDown, Filter, 
  Calendar, Briefcase, Tag, ListTodo, Plus, Trash2, Edit
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { GlobalTaskModal } from './GlobalTaskModal';

type SortType = 'date-desc' | 'date-asc' | 'status';

export function TodoView() {
  const { globalTodos, updateGlobalTodo, deleteGlobalTodo } = useHearsStore();
  const [sortType, setSortType] = useState<SortType>('date-desc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);

  const safeGlobalTodos = globalTodos || [];

  const sortedTodos = [...safeGlobalTodos].sort((a, b) => {
    switch (sortType) {
      case 'date-desc': return b.createdAt - a.createdAt;
      case 'date-asc': return a.createdAt - b.createdAt;
      case 'status': return Number(a.completed) - Number(b.completed);
      default: return 0;
    }
  });

  const toggleTodo = (id: string) => {
    const todo = safeGlobalTodos.find(t => t.id === id);
    if (todo) {
      updateGlobalTodo(id, (draft) => {
        draft.completed = !todo.completed;
      });
    }
  };

  const handleEdit = (todo: TodoItem) => {
    setEditingTodo(todo);
    setIsModalOpen(true);
  };

  const activeCount = safeGlobalTodos.filter(t => !t.completed).length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-card p-6 lg:p-8 rounded-lg border border-border">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-4 uppercase">
            <ListTodo className="w-8 h-8 text-primary" /> GLOBAL TASKS
          </h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-40 ml-12">全体タスク管理 ・ 進行状況一括把握</p>
          <div className="flex items-center gap-3 mt-3 ml-12">
            <Badge className="bg-primary/10 text-primary border-none px-3 py-1 font-bold text-[10px] uppercase tracking-widest rounded-lg">
              残り {activeCount} 件
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={sortType} onValueChange={(val) => setSortType(val as SortType)}>
            <SelectTrigger className="h-10 bg-input border border-border w-full sm:w-48 rounded-md font-bold text-xs uppercase tracking-widest px-4">
              <ArrowUpDown className="w-4 h-4 mr-2 opacity-40" />
              <SelectValue placeholder="並び替え" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border rounded-md shadow-lg">
              <SelectItem value="date-desc" className="font-bold py-3">追加日 (新しい順)</SelectItem>
              <SelectItem value="date-asc" className="font-bold py-3">追加日 (古い順)</SelectItem>
              <SelectItem value="status" className="font-bold py-3">ステータスで整列</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            onClick={() => { setEditingTodo(null); setIsModalOpen(true); }}
            className="bg-primary hover:brightness-110 text-primary-foreground font-bold h-10 px-6 rounded-md transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            新規タスク
          </Button>
        </div>
      </div>

      {safeGlobalTodos.length === 0 ? (
        <div className="py-24 text-center bg-card border border-dashed border-border rounded-lg">
          <ListTodo className="w-16 h-16 text-muted-foreground mx-auto opacity-10 mb-6" />
          <h3 className="text-xl font-bold tracking-tight text-foreground uppercase mb-2">No Active Tasks</h3>
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest opacity-40">現在、対応が必要なタスクはありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTodos.map((todo) => (
            <Card 
              key={todo.id} 
              className={cn(
                "bg-card border border-border hover:border-primary/50 transition-all rounded-lg overflow-hidden group shadow-none",
                todo.completed && "opacity-50 bg-secondary/20"
              )}
            >
              <CardContent className="p-6 flex items-center gap-6">
                <button 
                  onClick={() => toggleTodo(todo.id)}
                  className="shrink-0 transition-transform active:scale-90"
                >
                  {todo.completed ? (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-border group-hover:border-primary/50 transition-colors" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-lg font-bold tracking-tight mb-2",
                    todo.completed ? "line-through text-muted-foreground" : "text-foreground"
                  )}>
                    {todo.text}
                  </p>
                  <div className="flex flex-wrap items-center gap-5">
                    {todo.clientName && (
                      <span className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-lg">
                        <Briefcase className="w-3.5 h-3.5" /> {todo.clientName}
                      </span>
                    )}
                    {todo.dueDate && (
                      <span className={cn(
                        "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg",
                        !todo.completed && new Date(todo.dueDate) < new Date() ? "text-destructive bg-destructive/10" : "text-amber-600 bg-amber-500/10"
                      )}>
                        <Calendar className="w-3.5 h-3.5" /> 期限: {format(new Date(todo.dueDate), 'yyyy/MM/dd')}
                      </span>
                    )}
                    <span className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">
                      追加: {format(new Date(todo.createdAt), 'yyyy/MM/dd')}
                    </span>
                  </div>
                  {todo.memo && (
                    <p className="mt-3 text-sm text-muted-foreground font-medium bg-secondary p-3 rounded-md border border-border">
                      {todo.memo}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(todo)} className="text-muted-foreground hover:text-primary rounded-md hover:bg-secondary">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => { if(confirm('タスクを削除しますか？')) deleteGlobalTodo(todo.id) }} className="text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <GlobalTaskModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingTodo(null); }}
        editingTodo={editingTodo}
      />
    </div>
  );
}
