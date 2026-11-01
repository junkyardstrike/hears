'use client';

import { useHearsStore, ProjectData } from '@/store/useHearsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Info, User, Mail, Globe, Calendar, DollarSign, Building, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <Card id="sec-basic" className="w-full bg-card border border-border shadow-none rounded-md overflow-hidden font-sans py-3 gap-0">
      <CardHeader className="px-4 pb-1">
        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2 uppercase">
          <Info className="w-4 h-4 text-primary" /> クライアント基本情報
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-3">
          <div className="space-y-1">
            <Label htmlFor="clientName" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Building className="w-3.5 h-3.5" /> 会社名・屋号
            </Label>
            <Input 
              id="clientName" 
              name="clientName" 
              value={project.basicInfo.clientName} 
              onChange={handleChange} 
              placeholder="株式会社サンプル" 
              className="h-9 bg-input border border-border rounded-md px-3 font-bold text-foreground focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="managerName" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> 担当者名
            </Label>
            <Input 
              id="managerName" 
              name="managerName" 
              value={project.basicInfo.managerName} 
              onChange={handleChange} 
              placeholder="山田 太郎" 
              className="h-9 bg-input border border-border rounded-md px-3 font-bold text-foreground focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="contact" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> メールアドレス
            </Label>
            <Input 
              id="contact" 
              name="contact" 
              value={project.basicInfo.contact} 
              onChange={handleChange} 
              placeholder="sample@example.com" 
              className="h-9 bg-input border border-border rounded-md px-3 font-bold text-foreground focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="siteName" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" /> サイト名
            </Label>
            <Input 
              id="siteName" 
              name="siteName" 
              value={project.basicInfo.siteName} 
              onChange={handleChange} 
              placeholder="サンプルサイト" 
              className="h-9 bg-input border border-border rounded-md px-3 font-bold text-foreground focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="urlOrDomain" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" /> 既存URL / ドメイン
            </Label>
            <Input 
              id="urlOrDomain" 
              name="urlOrDomain" 
              value={project.basicInfo.urlOrDomain} 
              onChange={handleChange} 
              placeholder="https://example.com" 
              className="h-9 bg-input border border-border rounded-md px-3 font-bold text-foreground focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:contents">
            <div className="space-y-1">
              <Label htmlFor="deadline" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" /> 納期
              </Label>
              <Input 
                id="deadline" 
                name="deadline" 
                value={project.basicInfo.deadline} 
                onChange={handleChange} 
                placeholder="202X年X月" 
                className="h-9 bg-input border border-border rounded-md px-3 font-bold text-foreground focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="budget" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5" /> 予算
              </Label>
              <Input 
                id="budget" 
                name="budget" 
                value={project.basicInfo.budget} 
                onChange={handleChange} 
                placeholder="100万" 
                className="h-9 bg-input border border-border rounded-md px-3 font-bold text-foreground focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
