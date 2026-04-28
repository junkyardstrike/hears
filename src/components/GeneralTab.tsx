'use client';

import { useHearsStore, ProjectData } from '@/store/useHearsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageUploader } from './ImageUploader';

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
      p.generalQuestions.push({ id: generateId(), category, label: '新規質問', value: '' });
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
      <div className="text-center py-8">
        <Button onClick={() => addQuestion('新規カテゴリ')}>
          <Plus className="w-4 h-4 mr-2" /> 質問を追加
        </Button>
      </div>
    );
  }

  const cardStyle = "bg-card border-l-4 border-l-primary/60 border-y border-r border-border/50 shadow-lg mb-8";

  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {categories.map((category) => {
        const categoryQuestions = questions.filter((q) => q.category === category);
        return (
          <Card key={category} className={cardStyle + " w-full"}>
            <CardHeader className="bg-black/20 border-b border-border/30 flex flex-row items-center justify-between py-4">
              <CardTitle className="text-xl text-primary font-bold tracking-wide">
                {category} <span className="text-[10px] opacity-30 font-normal ml-2 tracking-normal">v1.1</span>
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => addQuestion(category)} className="hover:bg-primary hover:text-primary-foreground border-primary/40 text-primary">
                <Plus className="w-4 h-4 mr-1" /> 項目追加
              </Button>
            </CardHeader>
            <CardContent className="space-y-8 pt-8 px-6">
              <AnimatePresence>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {categoryQuestions.map((q) => (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col gap-4 p-6 rounded-2xl bg-[#0c0c0e] border border-border/40 hover:border-primary/40 transition-all shadow-2xl group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/60"></div>
                          <Input 
                            value={q.label} 
                            onChange={(e) => updateQuestion(q.id, 'label', e.target.value)}
                            className="font-bold text-xs tracking-widest text-primary/80 focus-visible:ring-0 border-none bg-transparent px-0 h-auto py-0 uppercase"
                          />
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeQuestion(q.id)} 
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Textarea 
                        value={q.value}
                        onChange={(e) => updateQuestion(q.id, 'value', e.target.value)}
                        placeholder="ヒアリング内容を入力..."
                        className="resize-y min-h-[140px] bg-black/40 border-border/30 focus-visible:ring-primary/40 text-base leading-relaxed rounded-xl p-4"
                      />
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
              
              <div className="pt-4">
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
                  label={`${category} 関連画像`} 
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
