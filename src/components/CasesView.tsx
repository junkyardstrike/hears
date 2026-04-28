'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useHearsStore } from '@/store/useHearsStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { 
  Plus, Trash2, ExternalLink, Shield, Server, FileText, 
  CheckCircle2, Circle, MoreVertical, X, Check, Clock, ChevronRight, Briefcase
} from 'lucide-react';

export function CasesView() {
  const { cases, createCase, deleteCase } = useHearsStore();
  const router = useRouter();

  const handleCreate = () => {
    const name = prompt('案件名を入力してください', '新規案件');
    if (name) createCase(name);
  };

  if (cases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
          <Briefcase className="w-10 h-10 text-muted-foreground opacity-20" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">進行案件がありません</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          ヒアリングシートから「案件化」するか、右上のボタンから新規案件を作成してください。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2 italic italic">
            進行案件・管理ページ
          </h2>
          <p className="text-muted-foreground text-[10px] sm:text-xs mt-1">全プロジェクトの運用・管理ハブ</p>
        </div>
        <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90 text-black font-bold px-4 sm:px-6 shadow-lg shadow-primary/20">
          <Plus className="w-5 h-5 mr-1" /> 新規案件
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cases.sort((a, b) => b.updatedAt - a.updatedAt).map((c) => (
          <Link key={c.id} href={`/cases/${c.id}`} className="block group">
            <Card className="bg-[#0c0c0e] border-white/5 hover:border-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer overflow-hidden relative h-full">
              <div className="h-1 w-full bg-gradient-to-r from-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <Badge className={
                    c.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-none px-2' :
                    c.status === 'completed' ? 'bg-blue-500/20 text-blue-400 border-none px-2' :
                    'bg-zinc-500/20 text-zinc-400 border-none px-2'
                  }>
                    {c.status === 'active' ? '進行中' : c.status === 'completed' ? '完了' : 'アーカイブ'}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                    onClick={(e) => {
                      e.preventDefault();
                      if(confirm('案件を削除しますか？')) deleteCase(c.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <CardTitle className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors line-clamp-1">{c.name}</CardTitle>
                <CardDescription className="text-[10px] opacity-50 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> 更新: {format(new Date(c.updatedAt), 'yyyy/MM/dd HH:mm')}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground bg-white/5 rounded-xl p-3">
                  <div className="flex flex-col">
                    <span className="text-[9px] opacity-40 uppercase font-bold tracking-widest mb-0.5">タスク状況</span>
                    <span className="text-white font-bold">
                      {c.todos.filter(t => t.completed).length} / {c.todos.length} <span className="opacity-40 ml-1 font-normal">完了</span>
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
