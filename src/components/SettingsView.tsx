'use client';

import { useState, useRef, useEffect } from 'react';
import { useHearsStore } from '@/store/useHearsStore';
import { supabase } from '@/lib/supabase';
import { decryptData } from '@/lib/syncService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Shield, Download, Upload, Trash2, Key, Info, 
  AlertTriangle, CheckCircle2, Database, ChevronRight,
  ShieldCheck, RefreshCcw, Settings, FolderSync, Lock, Eye, EyeOff, Save
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { SideTree, TreeItem } from '@/components/layout/SideTree';

export function SettingsView() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [masterPassword, setMasterPassword] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const alchemistInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email || null);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const scrollToCard = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleExportJson = () => {
    const { projects, cases, importData } = useHearsStore.getState();
    const data = { projects, cases, exportDate: new Date().toISOString(), version: '6.3.0' };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alchemist_sfa_backup_${format(new Date(), 'yyyyMMdd')}.json`;
    link.click();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 font-sans">
      {/* PC: ツリーから各カードへスクロール */}
      <SideTree title="設定">
        <TreeItem label="Cloud Account" glyph="▾" onClick={() => scrollToCard('settings-cloud')} />
        <TreeItem label="Legacy Management" glyph="▾" onClick={() => scrollToCard('settings-legacy')} />
        <TreeItem label="全初期化" depth={1} onClick={() => scrollToCard('settings-danger')} />
      </SideTree>

      {/* Header */}
      <div className="px-1">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2 uppercase">
          <Settings className="w-5 h-5 text-primary" /> SYSTEM SETTINGS
        </h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">セキュリティとデータ管理の設定</p>
      </div>

      {/* Cloud Account */}
      <Card id="settings-cloud" className="scroll-mt-2 bg-card border border-border rounded-md overflow-hidden py-0 gap-0 ring-0 shadow-none">
        <div className="h-[3px] w-full bg-primary" />
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground uppercase">
            <FolderSync className="w-4 h-4 text-primary" /> Cloud Account
          </CardTitle>
          <CardDescription className="text-[11px] text-muted-foreground">Supabaseによるリアルタイムクラウド同期</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between bg-secondary p-3 rounded-md border border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary/10 rounded-md flex items-center justify-center text-primary">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.06em]">Logged in as</p>
                <p className="text-sm font-bold text-foreground break-all">{userEmail || 'Loading...'}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="h-9 px-5 rounded-md font-bold border border-destructive/50 text-destructive hover:bg-destructive/10 transition-all active:scale-95 w-full sm:w-auto"
            >
              ログアウト
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Legacy Data Management */}
      <Card id="settings-legacy" className="scroll-mt-2 bg-card border border-border rounded-md overflow-hidden py-0 gap-0 ring-0 shadow-none">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground uppercase">
            <Database className="w-4 h-4 text-primary" /> Legacy Management
          </CardTitle>
          <CardDescription className="text-[11px] text-muted-foreground">ローカルファイルからの手動復元 (即時クラウド保存)</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" onClick={handleExportJson} className="h-10 flex items-center gap-2 border border-border bg-secondary hover:bg-secondary/80 rounded-md transition-all">
              <Download className="w-4 h-4 text-primary" />
              <span className="text-[11px] font-bold uppercase">Export JSON</span>
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="h-10 flex items-center gap-2 border border-border bg-secondary hover:bg-secondary/80 rounded-md transition-all">
              <Upload className="w-4 h-4 text-primary" />
              <span className="text-[11px] font-bold uppercase">Import JSON</span>
            </Button>
          </div>

          <div className="mt-3 flex flex-col sm:flex-row gap-3">
            <Input 
              type="password"
              placeholder="v5バックアップの復号パスワード"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              className="h-10 bg-input border border-border rounded-md font-bold flex-1 focus-visible:ring-1 focus-visible:ring-primary"
            />
            <Button 
              variant="outline" 
              onClick={() => {
                if (!masterPassword) {
                  alert('復号パスワードを入力してください');
                  return;
                }
                alchemistInputRef.current?.click();
              }} 
              className="h-10 px-5 flex items-center gap-2 border border-border bg-secondary text-primary hover:bg-secondary/80 rounded-md transition-all"
            >
              <Upload className="w-4 h-4" />
              <div className="flex flex-col items-start leading-none text-left">
                <span className="text-[11px] font-bold uppercase">Import .alchemist</span>
                <span className="text-[10px] font-medium text-muted-foreground mt-1">旧バージョンからの移行</span>
              </div>
            </Button>
          </div>

          <input type="file" className="hidden" ref={fileInputRef} accept=".json" onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
              try {
                useHearsStore.getState().importData(JSON.parse(ev.target?.result as string));
                alert('JSON インポート完了（クラウドに自動保存されます）');
              } catch (err) { alert('形式が違います'); }
            };
            reader.readAsText(file);
          }} />

          <input type="file" className="hidden" ref={alchemistInputRef} accept=".alchemist" onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file || !masterPassword) return;
            try {
              const buffer = await file.arrayBuffer();
              const decryptedJson = await decryptData(new Uint8Array(buffer), masterPassword);
              useHearsStore.getState().importData(JSON.parse(decryptedJson));
              alert('.alchemist インポート完了（クラウドに自動保存されます）');
            } catch (err) {
              console.error(err);
              alert('復号に失敗しました。パスワードが違うか、ファイルが破損しています。');
            }
          }} />

        </CardContent>
      </Card>

      {/* 危険操作 */}
      <Card id="settings-danger" className="scroll-mt-2 bg-destructive/10 border border-destructive rounded-md overflow-hidden py-0 gap-0 ring-0 shadow-none">
        <div className="p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
          <div className="flex-1">
            <p className="text-[11px] font-bold text-destructive leading-relaxed">
              すべてのヒアリングシートと案件データが削除されます。実行前に必ずバックアップを取ってください。
            </p>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => {
              if(confirm('【警告】本当にすべてのデータを削除しますか？')) {
                useHearsStore.setState({ projects: [], cases: [] });
                alert('すべてのデータを削除しました');
              }
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:text-destructive-foreground font-bold text-[11px] rounded-md h-9 px-4 w-full sm:w-auto"
          >
            全初期化
          </Button>
        </div>
      </Card>

      {/* System Status */}
      <div className="flex flex-col items-center justify-center pt-4 pb-6">
        <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-foreground mb-2 opacity-50 uppercase">
          <RefreshCcw className="w-4 h-4" /> ALCHEMIST SFA INFRASTRUCTURE v6.3.0
        </div>
        <div className="px-3 py-1 bg-secondary rounded-md text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Professional Build 2026.05.01
        </div>
      </div>
    </div>
  );
}
