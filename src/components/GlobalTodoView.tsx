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
import { SideTree, TreeItem } from '@/components/layout/SideTree';

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
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans pb-10">
      {/* PC: ツリーで並び替え（スマホでは本文内のセレクトを使う） */}
      <SideTree title="並び替え">
        <TreeItem label="並び替え" glyph="▾" />
        <TreeItem label="追加日 (新しい順)" depth={1} active={sortType === 'date-desc'} onClick={() => setSortType('date-desc')} />
        <TreeItem label="追加日 (古い順)" depth={1} active={sortType === 'date-asc'} onClick={() => setSortType('date-asc')} />
        <TreeItem label="ステータスで整列" depth={1} active={sortType === 'status'} onClick={() => setSortType('status')} />
        <TreeItem label="状況" glyph="▾" />
        <TreeItem label={`残り ${activeCount} 件`} depth={1} />
      </SideTree>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-card px-3 py-3 lg:px-4 rounded-md border border-border">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2 uppercase">
            <ListTodo className="w-5 h-5 text-primary" /> GLOBAL TASKS
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">全体タスク管理 ・ 進行状況一括把握</p>
          <div className="flex items-center gap-3 mt-2">
            <Badge className="bg-primary/10 text-primary border-none px-2 py-0.5 font-bold text-[10px] rounded-md">
              残り {activeCount} 件
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="lg:hidden flex-1 sm:flex-none min-w-0">
            <Select value={sortType} onValueChange={(val) => setSortType(val as SortType)}>
              <SelectTrigger className="h-9 bg-input border border-border w-full sm:w-48 rounded-md font-bold text-xs px-3">
                <ArrowUpDown className="w-4 h-4 mr-2 opacity-40" />
                <SelectValue placeholder="並び替え" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border rounded-md shadow-lg">
                <SelectItem value="date-desc" className="font-bold py-2">追加日 (新しい順)</SelectItem>
                <SelectItem value="date-asc" className="font-bold py-2">追加日 (古い順)</SelectItem>
                <SelectItem value="status" className="font-bold py-2">ステータスで整列</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={() => { setEditingTodo(null); setIsModalOpen(true); }}
            className="bg-primary hover:brightness-110 text-primary-foreground font-bold h-9 px-4 rounded-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            新規タスク
          </Button>
        </div>
      </div>

      {safeGlobalTodos.length === 0 ? (
        <div className="py-16 text-center bg-card border border-dashed border-border rounded-md">
          <ListTodo className="w-10 h-10 text-muted-foreground mx-auto opacity-30 mb-4" />
          <h3 className="text-base font-bold text-foreground uppercase mb-1">No Active Tasks</h3>
          <p className="text-muted-foreground text-xs">現在、対応が必要なタスクはありません</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedTodos.map((todo) => (
            <Card 
              key={todo.id} 
              className={cn(
                "bg-card border border-border hover:border-primary/50 transition-colors rounded-md py-0 gap-0 ring-0 overflow-hidden group shadow-none",
                todo.completed && "opacity-60 bg-secondary/40"
              )}
            >
              <CardContent className="px-3 py-2.5 lg:px-4 flex items-start gap-3">
                <button 
                  onClick={() => toggleTodo(todo.id)}
                  className="shrink-0 mt-0.5 transition-transform active:scale-90"
                >
                  {todo.completed ? (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-primary group-hover:border-primary/70 transition-colors" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-bold break-words",
                    todo.completed ? "line-through text-muted-foreground" : "text-foreground"
                  )}>
                    {todo.text}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[11px] text-muted-foreground">
                    {todo.clientName && (
                      <span className="flex items-center gap-1.5 font-bold text-primary">
                        <Briefcase className="w-3 h-3" /> {todo.clientName}
                      </span>
                    )}
                    {todo.dueDate && (
                      <span className={cn(
                        "flex items-center gap-1.5 font-bold",
                        !todo.completed && new Date(todo.dueDate) < new Date() ? "text-destructive" : "text-amber-700"
                      )}>
                        <Calendar className="w-3 h-3" /> 期限: {format(new Date(todo.dueDate), 'yyyy/MM/dd')}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      追加: {format(new Date(todo.createdAt), 'yyyy/MM/dd')}
                    </span>
                  </div>
                  {todo.memo && (
                    <p className="mt-1.5 text-xs text-muted-foreground bg-secondary px-2.5 py-1.5 rounded-md border border-border break-words">
                      {todo.memo}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(todo)} className="h-8 w-8 text-muted-foreground hover:text-primary rounded-md hover:bg-secondary">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => { if(confirm('タスクを削除しますか？')) deleteGlobalTodo(todo.id) }} className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10">
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
