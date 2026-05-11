'use client';

import { useState, useEffect } from 'react';
import { useHearsStore, TodoItem } from '@/store/useHearsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ListTodo, Briefcase, Calendar, AlignLeft, Check } from 'lucide-react';

interface GlobalTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTodo: TodoItem | null;
}

export function GlobalTaskModal({ isOpen, onClose, editingTodo }: GlobalTaskModalProps) {
  const { addGlobalTodo, updateGlobalTodo, clients } = useHearsStore();
  const [text, setText] = useState('');
  const [clientName, setClientName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingTodo) {
        setText(editingTodo.text);
        setClientName(editingTodo.clientName || '');
        setDueDate(editingTodo.dueDate || '');
        setMemo(editingTodo.memo || '');
      } else {
        setText('');
        setClientName('');
        setDueDate('');
        setMemo('');
      }
    }
  }, [isOpen, editingTodo]);

  const handleSave = () => {
    if (!text.trim()) {
      alert('タスク名を入力してください');
      return;
    }

    if (editingTodo) {
      updateGlobalTodo(editingTodo.id, (t) => {
        t.text = text;
        t.clientName = clientName;
        t.dueDate = dueDate;
        t.memo = memo;
      });
    } else {
      addGlobalTodo({
        text,
        clientName,
        dueDate,
        memo,
      });
    }
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-6 lg:p-8 rounded-lg bg-card border border-border shadow-2xl font-sans">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-3 uppercase">
            <ListTodo className="w-5 h-5 text-primary" /> 
            {editingTodo ? 'EDIT TASK' : 'NEW TASK'}
          </DialogTitle>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
            {editingTodo ? 'タスクの編集' : '新規タスクの作成'}
          </p>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 ml-1">
              <Check className="w-3.5 h-3.5" /> タスク名 (必須)
            </label>
            <Input 
              value={text} 
              onChange={(e) => setText(e.target.value)} 
              placeholder="何を行いますか？" 
              className="h-12 bg-input border border-border rounded-md font-bold text-sm px-4 focus-visible:ring-1 focus-visible:ring-primary"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 ml-1">
                <Briefcase className="w-3.5 h-3.5" /> 関連法人 (任意)
              </label>
              <Input 
                value={clientName} 
                onChange={(e) => setClientName(e.target.value)} 
                placeholder="法人名を入力..." 
                className="h-12 bg-input border border-border rounded-md font-bold text-sm px-4 focus-visible:ring-1 focus-visible:ring-primary"
                list="client-list"
              />
              <datalist id="client-list">
                {clients.map(c => <option key={c.id} value={c.name} />)}
              </datalist>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 ml-1">
                <Calendar className="w-3.5 h-3.5" /> 期限 (任意)
              </label>
              <Input 
                type="date"
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)} 
                className="h-12 bg-input border border-border rounded-md font-bold text-sm px-4 focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 ml-1">
              <AlignLeft className="w-3.5 h-3.5" /> 詳細メモ (任意)
            </label>
            <Textarea 
              value={memo} 
              onChange={(e) => setMemo(e.target.value)} 
              placeholder="タスクの詳細や補足事項..." 
              className="min-h-[120px] bg-input border border-border rounded-md font-medium text-sm p-4 focus-visible:ring-1 focus-visible:ring-primary resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose} className="h-12 px-6 rounded-md font-bold hover:bg-secondary">
              キャンセル
            </Button>
            <Button onClick={handleSave} className="bg-primary hover:brightness-110 text-primary-foreground font-bold h-12 px-8 rounded-md transition-all">
              {editingTodo ? '更新する' : '作成する'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
