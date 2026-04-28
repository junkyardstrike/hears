'use client';

import { useState } from 'react';
import { useHearsStore, CaseData, TodoItem } from '@/store/useHearsStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { 
  CheckCircle2, Circle, ArrowUpDown, Filter, 
  Calendar, Briefcase, Tag
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Badge className="bg-purple-500/20 text-purple-400 border-none px-3">
              {activeCount} LEFT
            </Badge>
            GLOBAL TASKS
          </h2>
          <p className="text-muted-foreground text-xs mt-1">全案件のToDoを横断して管理</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={sortType} onValueChange={(val) => setSortType(val as SortType)}>
            <SelectTrigger className="bg-white/5 border-white/10 w-full sm:w-48 text-xs font-bold uppercase tracking-widest">
              <ArrowUpDown className="w-3 h-3 mr-2" />
              <SelectValue placeholder="並び替え" />
            </SelectTrigger>
            <SelectContent className="bg-[#111] border-white/10 text-white">
              <SelectItem value="date-desc">追加日 (新)</SelectItem>
              <SelectItem value="date-asc">追加日 (古)</SelectItem>
              <SelectItem value="case">案件名順</SelectItem>
              <SelectItem value="status">ステータス順</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {allTodos.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.02]">
          <p className="text-muted-foreground italic">登録されているタスクはありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTodos.map((todo) => (
            <Card 
              key={todo.id} 
              className={`bg-[#0c0c0e] border-white/5 hover:border-purple-500/40 transition-all ${todo.completed ? 'opacity-50' : ''}`}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <button 
                  onClick={() => toggleTodo(todo.caseId, todo.id)}
                  className="shrink-0"
                >
                  {todo.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-purple-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-muted-foreground/20 hover:text-purple-400 transition-colors" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-base font-medium truncate ${todo.completed ? 'line-through text-muted-foreground' : 'text-white'}`}>
                    {todo.text}
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded">
                      <Briefcase className="w-3 h-3" /> {todo.caseName}
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase">
                      <Calendar className="w-3 h-3" /> {format(new Date(todo.createdAt), 'MM/dd')}
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
