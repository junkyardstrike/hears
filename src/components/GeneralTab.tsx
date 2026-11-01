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
    <div className="text-center py-12 bg-card border border-dashed border-border rounded-md animate-in fade-in duration-300 font-sans">
        <div className="bg-secondary w-12 h-12 rounded-md flex items-center justify-center mx-auto mb-3">
          <FileText className="w-6 h-6 text-muted-foreground opacity-70" />
        </div>
        <h3 className="text-sm font-bold text-foreground mb-3 uppercase">No Requirements Yet</h3>
        <Button onClick={() => addQuestion('要件定義・ヒアリング')} className="bg-primary hover:brightness-110 text-primary-foreground font-bold h-8 px-4 text-xs rounded-md shadow-none transition-all">
          <Plus className="w-4 h-4 mr-2" /> 最初の一歩をはじめる
        </Button>
      </div>
    );
  }

  const sectionCardStyle = "bg-card border border-border shadow-none rounded-md overflow-hidden font-sans py-3 gap-0 scroll-mt-3";

  return (
    <div className="w-full space-y-3 animate-in fade-in duration-300 pb-4">
      {categories.map((category, idx) => {
        const categoryQuestions = questions.filter((q) => q.category === category);
        return (
          <Card key={category} id={`sec-gen-${idx}`} className={sectionCardStyle}>
            <CardHeader className="px-4 pb-1 flex flex-row items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2 uppercase">
                <Globe className="w-4 h-4 text-primary" /> {category}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => addQuestion(category)} className="text-primary hover:bg-secondary font-bold text-xs rounded-md border border-transparent hover:border-border h-8 px-3">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> 項目を追加
              </Button>
            </CardHeader>
            <CardContent className="px-4 pt-2 space-y-4">
              <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categoryQuestions.map((q) => (
                    <motion.div
                      key={q.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col gap-2 p-3 rounded-md bg-secondary/50 border border-border hover:border-primary/50 transition-all group relative"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-2.5 h-2.5 rounded-full bg-primary/40" />
                          <Input 
                            value={q.label} 
                            onChange={(e) => updateQuestion(q.id, 'label', e.target.value)}
                            className="font-bold text-[10px] tracking-wide text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary border-none bg-transparent px-2 h-auto py-1 uppercase rounded"
                          />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeQuestion(q.id)} 
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all w-8 h-8 rounded-md"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Textarea 
                        value={q.value}
                        onChange={(e) => updateQuestion(q.id, 'value', e.target.value)}
                        placeholder="詳細を入力してください..."
                        className="resize-y min-h-[100px] bg-input border border-border focus-visible:ring-1 focus-visible:ring-primary text-foreground font-medium leading-relaxed rounded-md p-3"
                      />
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
              
              <div>
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
