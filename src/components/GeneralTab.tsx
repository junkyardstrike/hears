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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {categories.map((category) => {
        const categoryQuestions = questions.filter((q) => q.category === category);
        return (
          <Card key={category} className="bg-card text-card-foreground border-border shadow-lg overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-black/20 pb-4">
              <CardTitle className="text-lg tracking-wide text-primary">{category}</CardTitle>
              <Button variant="outline" size="sm" onClick={() => addQuestion(category)} className="hover:bg-primary hover:text-primary-foreground border-border">
                <Plus className="w-4 h-4 mr-2" /> 項目追加
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <AnimatePresence>
                {categoryQuestions.map((q) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-4 items-start group"
                  >
                    <div className="flex-1 space-y-2">
                      <Input 
                        value={q.label} 
                        onChange={(e) => updateQuestion(q.id, 'label', e.target.value)}
                        className="font-semibold text-foreground focus-visible:ring-1 focus-visible:ring-ring border-none bg-transparent px-1 h-auto py-1 text-base transition-colors hover:bg-white/5"
                      />
                      <Textarea 
                        value={q.value}
                        onChange={(e) => updateQuestion(q.id, 'value', e.target.value)}
                        placeholder="ヒアリング内容を入力..."
                        className="resize-y min-h-[80px] bg-black/50 border-border focus-visible:ring-primary"
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeQuestion(q.id)} 
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity mt-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
              
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
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
