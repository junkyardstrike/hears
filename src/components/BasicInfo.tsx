'use client';

import { useHearsStore, ProjectData } from '@/store/useHearsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  project: ProjectData;
}

export function BasicInfo({ project }: Props) {
  const updateProject = useHearsStore(state => state.updateProject);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateProject(project.id, (p) => {
      // @ts-ignore
      p.basicInfo[e.target.name] = e.target.value;
    });
  };

  return (
    <Card className="w-full mb-8 bg-card text-card-foreground border-border shadow-lg">
      <CardHeader className="bg-black/20 border-b border-border/50">
        <CardTitle className="text-xl font-bold tracking-tight text-primary">基本情報</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
        <div className="space-y-2">
          <Label htmlFor="clientName">クライアント名（会社名・屋号）</Label>
          <Input id="clientName" name="clientName" value={project.basicInfo.clientName} onChange={handleChange} placeholder="株式会社サンプル" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="managerName">担当者名</Label>
          <Input id="managerName" name="managerName" value={project.basicInfo.managerName} onChange={handleChange} placeholder="山田 太郎" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact">メールアドレス</Label>
          <Input id="contact" name="contact" value={project.basicInfo.contact} onChange={handleChange} placeholder="sample@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="siteName">サイト名（正式・仮称）</Label>
          <Input id="siteName" name="siteName" value={project.basicInfo.siteName} onChange={handleChange} placeholder="サンプルサイト" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="urlOrDomain">既存URL / 希望ドメイン</Label>
          <Input id="urlOrDomain" name="urlOrDomain" value={project.basicInfo.urlOrDomain} onChange={handleChange} placeholder="https://example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deadline">希望納期</Label>
          <Input id="deadline" name="deadline" value={project.basicInfo.deadline} onChange={handleChange} placeholder="202X年X月頃" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="budget">概算予算</Label>
          <Input id="budget" name="budget" value={project.basicInfo.budget} onChange={handleChange} placeholder="約100万円" />
        </div>
      </CardContent>
    </Card>
  );
}
