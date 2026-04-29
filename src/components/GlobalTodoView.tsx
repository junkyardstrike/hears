'use client';

import { useState } from 'react';
import { useHearsStore, CaseData, TodoItem } from '@/store/useHearsStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { 
  CheckCircle2, Circle, ArrowUpDown, Filter, 
  Calendar, Briefcase, Tag, ListTodo
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type SortType = 'date-desc' | 'date-asc' | 'case' | 'status';

export function TodoView() {
  const { cases, updateCase } = useHearsStore();
  const [sortType, setSortType] = useState<SortType>('date-desc');

  // Flatten all todos with their case info
  const allTodos = cases.flatMap(c => 
    c.todos.map(t => ({
      ...t,
      caseId: c.id,
      caseName: c.name
    }))
  );

  const sortedTodos = [...allTodos].sort((a, b) => {
    switch (sortType) {
      case 'date-desc': return b.createdAt - a.createdAt;
      case 'date-asc': return a.createdAt - b.createdAt;
      case 'case': return a.caseName.localeCompare(b.caseName);
      case 'status': return Number(a.completed) - Number(b.completed);
      default: return 0;
    }
  });

  const toggleTodo = (caseId: string, todoId: string) => {
    updateCase(caseId, (draft) => {
      const todo = draft.todos.find(t => t.id === todoId);
      if (todo) todo.completed = !todo.completed;
    });
  };

  const activeCount = allTodos.filter(t => !t.completed).length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-[family-name:var(--font-noto)] pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white p-8 rounded-[2.5rem] paper-shadow">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold italic tracking-tighter text-[#2D3436] flex items-center gap-4 uppercase font-[family-name:var(--font-outfit)]">
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
            <SelectTrigger className="h-12 bg-secondary/50 border-none w-full sm:w-56 rounded-xl font-bold text-xs uppercase tracking-widest px-6">
              <ArrowUpDown className="w-4 h-4 mr-2 opacity-40" />
              <SelectValue placeholder="並び替え" />
            </SelectTrigger>
            <SelectContent className="bg-white border-border rounded-2xl paper-shadow-lg">
              <SelectItem value="date-desc" className="font-bold py-3">追加日 (新しい順) / DATE DESC</SelectItem>
              <SelectItem value="date-asc" className="font-bold py-3">追加日 (古い順) / DATE ASC</SelectItem>
              <SelectItem value="case" className="font-bold py-3">案件名で整列 / BY CASE</SelectItem>
              <SelectItem value="status" className="font-bold py-3">ステータスで整列 / BY STATUS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {allTodos.length === 0 ? (
        <div className="py-32 text-center bg-white/50 border-2 border-dashed border-border rounded-[3rem]">
          <ListTodo className="w-16 h-16 text-muted-foreground mx-auto opacity-10 mb-6" />
          <h3 className="text-xl font-bold italic tracking-tighter text-foreground uppercase mb-2">No Active Tasks</h3>
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest opacity-40">現在、対応が必要なタスクはありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTodos.map((todo) => (
            <Card 
              key={todo.id} 
              className={cn(
                "bg-white border-none paper-shadow hover:paper-shadow-lg transition-all rounded-[2rem] overflow-hidden",
                todo.completed && "opacity-40 grayscale-[0.5]"
              )}
            >
              <CardContent className="p-6 flex items-center gap-6">
                <button 
                  onClick={() => toggleTodo(todo.caseId, todo.id)}
                  className="shrink-0 transition-transform active:scale-90"
                >
                  {todo.completed ? (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-border group-hover:border-primary/50 transition-colors" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-lg font-bold tracking-tight mb-2",
                    todo.completed ? "line-through text-muted-foreground" : "text-[#2D3436]"
                  )}>
                    {todo.text}
                  </p>
                  <div className="flex items-center gap-5">
                    <span className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-lg">
                      <Briefcase className="w-3.5 h-3.5" /> {todo.caseName}
                    </span>
                    <span className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">
                      <Calendar className="w-3.5 h-3.5" /> {format(new Date(todo.createdAt), 'yyyy/MM/dd')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
