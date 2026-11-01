'use client';

import { useState, useEffect } from 'react';
import { useHearsStore, TodoItem } from '@/store/useHearsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ListTodo, Briefcase, Calendar, AlignLeft, Check, X } from 'lucide-react';

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

  const fieldClass = "h-10 sm:h-9 bg-input border border-border rounded-md font-bold text-sm px-3 focus-visible:ring-1 focus-visible:ring-primary";
  const labelClass = "text-[10px] font-bold text-muted-foreground tracking-[0.06em] flex items-center gap-1.5";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="bg-[rgba(40,30,15,0.35)]" />
        <DialogPrimitive.Content
          className="fixed z-50 grid gap-3 bg-card border border-border shadow-lg outline-none font-sans duration-200 max-h-[90dvh] overflow-y-auto p-4 max-sm:inset-x-0 max-sm:bottom-0 max-sm:rounded-t-2xl max-sm:border-b-0 max-sm:pb-7 sm:left-1/2 sm:top-1/2 sm:w-full sm:max-w-[460px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-md sm:p-5 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 max-sm:data-[state=open]:slide-in-from-bottom max-sm:data-[state=closed]:slide-out-to-bottom sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:zoom-out-95"
        >
          <i className="sm:hidden mx-auto mb-1 block h-1 w-10 rounded-full bg-border" aria-hidden />
          <DialogHeader className="mb-1">
            <DialogTitle className="text-[10px] font-bold tracking-[0.12em] text-muted-foreground flex items-center gap-1.5 uppercase leading-none">
              <ListTodo className="w-3.5 h-3.5 text-primary" /> 
              {editingTodo ? 'EDIT TASK' : 'NEW TASK'}
            </DialogTitle>
            <p className="text-base font-bold text-foreground">
              {editingTodo ? 'タスクの編集' : '新規タスクの作成'}
            </p>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className={labelClass}>
                <Check className="w-3.5 h-3.5" /> タスク名 (必須)
              </label>
              <Input 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                placeholder="何を行いますか？" 
                className={fieldClass}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={labelClass}>
                  <Briefcase className="w-3.5 h-3.5" /> 関連法人 (任意)
                </label>
                <Input 
                  value={clientName} 
                  onChange={(e) => setClientName(e.target.value)} 
                  placeholder="法人名を入力..." 
                  className={fieldClass}
                  list="client-list"
                />
                <datalist id="client-list">
                  {clients.map(c => <option key={c.id} value={c.name} />)}
                </datalist>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>
                  <Calendar className="w-3.5 h-3.5" /> 期限 (任意)
                </label>
                <Input 
                  type="date"
                  value={dueDate} 
                  onChange={(e) => setDueDate(e.target.value)} 
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelClass}>
                <AlignLeft className="w-3.5 h-3.5" /> 詳細メモ (任意)
              </label>
              <Textarea 
                value={memo} 
                onChange={(e) => setMemo(e.target.value)} 
                placeholder="タスクの詳細や補足事項..." 
                className="min-h-[88px] sm:min-h-[72px] bg-input border border-border rounded-md font-medium text-sm p-3 focus-visible:ring-1 focus-visible:ring-primary resize-none"
              />
            </div>

            <div className="pt-1 flex gap-2 sm:justify-end">
              <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none h-10 sm:h-9 px-5 rounded-md font-bold border-border bg-transparent hover:bg-secondary">
                キャンセル
              </Button>
              <Button onClick={handleSave} className="flex-1 sm:flex-none bg-primary hover:brightness-110 text-primary-foreground font-bold h-10 sm:h-9 px-6 rounded-md transition-all">
                {editingTodo ? '更新する' : '作成する'}
              </Button>
            </div>
          </div>

          <DialogPrimitive.Close className="absolute right-3 top-3 rounded-sm text-muted-foreground opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring disabled:pointer-events-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
