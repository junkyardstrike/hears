'use client';

import { useHearsStore, ProjectData } from '@/store/useHearsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Globe, FileText, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageUploader } from './ImageUploader';
import { cn } from '@/lib/utils';

interface Props {
  project: ProjectData;
}

export function GeneralTab({ project }: Props) {
  const updateProject = useHearsStore(state => state.updateProject);
  const questions = project.generalQuestions;

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const categories = Array.from(new Set(questions.map((q) => q.category)));

  const addQuestion = (category: string) => {
    updateProject(project.id, (p) => {
      p.generalQuestions.push({ id: generateId(), category, label: '新規項目', value: '' });
    });
  };

  const removeQuestion = (id: string) => {
    updateProject(project.id, (p) => {
      p.generalQuestions = p.generalQuestions.filter(q => q.id !== id);
    });
  };

  const updateQuestion = (id: string, key: 'label' | 'value', val: string) => {
    updateProject(project.id, (p) => {
      const q = p.generalQuestions.find(q => q.id === id);
      if (q) q[key] = val;
    });
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-24 bg-white/50 border-2 border-dashed border-border rounded-[2.5rem] animate-in fade-in duration-700">
        <div className="bg-secondary/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="w-10 h-10 text-muted-foreground opacity-20" />
        </div>
        <h3 className="text-xl font-bold italic tracking-tighter text-foreground mb-4 uppercase font-[family-name:var(--font-outfit)]">No Requirements Yet</h3>
        <Button onClick={() => addQuestion('要件定義・ヒアリング')} className="bg-primary text-white font-bold h-12 px-8 rounded-2xl shadow-xl shadow-primary/20">
          <Plus className="w-5 h-5 mr-2" /> 最初の一歩をはじめる
        </Button>
      </div>
    );
  }

  const sectionCardStyle = "bg-white border-none paper-shadow-lg rounded-[2.5rem] overflow-hidden mb-12 font-[family-name:var(--font-noto)]";

  return (
    <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {categories.map((category) => {
        const categoryQuestions = questions.filter((q) => q.category === category);
        return (
          <Card key={category} className={sectionCardStyle}>
            <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between flex-wrap gap-4">
              <CardTitle className="text-xl font-bold italic tracking-tighter text-foreground flex items-center gap-3 uppercase font-[family-name:var(--font-outfit)]">
                <Globe className="w-8 h-8 text-primary" /> {category}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => addQuestion(category)} className="text-primary hover:bg-primary/5 font-bold rounded-xl border border-primary/10 h-10 px-6">
                <Plus className="w-4 h-4 mr-2" /> 項目を追加
              </Button>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-10">
              <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {categoryQuestions.map((q) => (
                    <motion.div
                      key={q.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col gap-5 p-8 rounded-[2rem] bg-secondary/10 border border-border/50 hover:border-primary/20 transition-all group relative"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-2.5 h-2.5 rounded-full bg-primary/40" />
                          <Input 
                            value={q.label} 
                            onChange={(e) => updateQuestion(q.id, 'label', e.target.value)}
                            className="font-bold text-[10px] tracking-widest text-muted-foreground focus-visible:ring-0 border-none bg-transparent px-0 h-auto py-0 uppercase font-[family-name:var(--font-outfit)]"
                          />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeQuestion(q.id)} 
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 opacity-0 group-hover:opacity-100 transition-all w-9 h-9 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Textarea 
                        value={q.value}
                        onChange={(e) => updateQuestion(q.id, 'value', e.target.value)}
                        placeholder="詳細を入力してください..."
                        className="resize-y min-h-[160px] bg-white border-none paper-shadow-sm focus-visible:ring-primary/20 text-[#2D3436] font-bold leading-relaxed rounded-2xl p-6"
                      />
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
              
              <div className="pt-10 border-t border-border/50">
                <ImageUploader 
                  value={project.generalImages?.[category] || null} 
                  onChange={(val) => updateProject(project.id, p => {
                    if (!p.generalImages) p.generalImages = {};
                    if (val === null) {
                      delete p.generalImages[category];
                    } else {
                      p.generalImages[category] = val;
                    }
                  })} 
                  label={`${category} 関連資料・スクショ`} 
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
