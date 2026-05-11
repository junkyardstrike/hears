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
    <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 font-sans">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3 uppercase">
          <Settings className="w-8 h-8 text-primary" /> SYSTEM SETTINGS
        </h2>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">セキュリティとデータ管理の設定</p>
      </div>

      {/* Cloud Account */}
      <Card className="bg-card border border-border rounded-lg overflow-hidden shadow-none">
        <div className="h-2 w-full bg-blue-500" />
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-4 text-foreground uppercase">
            <FolderSync className="w-6 h-6 text-blue-500" /> Cloud Account
          </CardTitle>
          <CardDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">Supabaseによるリアルタイムクラウド同期</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 justify-between bg-secondary p-6 rounded-lg border border-border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Logged in as</p>
                <p className="text-sm font-bold text-foreground">{userEmail || 'Loading...'}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="h-10 px-6 rounded-md font-bold border border-destructive/50 text-destructive hover:bg-destructive/10 transition-all active:scale-95"
            >
              ログアウト
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Legacy Data Management */}
      <Card className="bg-card border border-border rounded-lg overflow-hidden opacity-80 shadow-none">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-xl font-bold tracking-tight flex items-center gap-4 text-foreground uppercase">
            <Database className="w-6 h-6 text-blue-500" /> Legacy Management
          </CardTitle>
          <CardDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">ローカルファイルからの手動復元 (即時クラウド保存)</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button variant="outline" onClick={handleExportJson} className="h-14 flex items-center gap-3 border border-border bg-secondary hover:bg-secondary/80 rounded-md transition-all">
              <Download className="w-5 h-5 text-blue-500" />
              <span className="text-[11px] font-bold uppercase">Export JSON</span>
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="h-14 flex items-center gap-3 border border-border bg-secondary hover:bg-secondary/80 rounded-md transition-all">
              <Upload className="w-5 h-5 text-primary" />
              <span className="text-[11px] font-bold uppercase">Import JSON</span>
            </Button>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <Input 
              type="password"
              placeholder="v5バックアップの復号パスワード"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              className="h-14 bg-input border border-border rounded-md font-bold flex-1 focus-visible:ring-1 focus-visible:ring-primary"
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
              className="h-14 px-6 flex items-center gap-3 border border-border text-primary hover:bg-secondary rounded-md transition-all"
            >
              <Upload className="w-4 h-4" />
              <div className="flex flex-col items-start leading-none text-left">
                <span className="text-[11px] font-bold uppercase">Import .alchemist</span>
                <span className="text-[8px] font-medium opacity-70 mt-1">旧バージョンからの移行</span>
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

          <div className="mt-8 p-6 rounded-lg bg-destructive/10 border border-destructive/20 flex flex-col sm:flex-row items-center gap-4">
            <AlertTriangle className="w-6 h-6 text-destructive shrink-0" />
            <div className="flex-1 text-center sm:text-left">
              <p className="text-[10px] font-bold text-muted-foreground leading-relaxed opacity-80">
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
              className="text-destructive hover:bg-destructive/10 font-bold text-[10px] uppercase tracking-widest rounded-md"
            >
              全初期化
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <div className="flex flex-col items-center justify-center pt-8 pb-12">
        <div className="flex items-center gap-3 text-sm font-bold tracking-widest text-foreground mb-3 opacity-40 uppercase">
          <RefreshCcw className="w-4 h-4" /> ALCHEMIST SFA INFRASTRUCTURE v6.3.0
        </div>
        <div className="px-6 py-2 bg-secondary rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">
          Professional Build 2026.05.01
        </div>
      </div>
    </div>
  );
}
