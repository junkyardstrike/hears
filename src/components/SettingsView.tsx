'use client';

import { useState, useRef } from 'react';
import { useHearsStore } from '@/store/useHearsStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Shield, Download, Upload, Trash2, Key, Info, 
  AlertTriangle, CheckCircle2, Database, ChevronRight,
  ShieldCheck, RefreshCcw, Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function SettingsView() {
  const { pinCode, setPinCode, projects, cases, importData } = useHearsStore();
  const [newPin, setNewPin] = useState('');
  const [showPinSuccess, setShowPinSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdatePin = () => {
    if (newPin.length === 4) {
      setPinCode(newPin);
      setNewPin('');
      setShowPinSuccess(true);
      setTimeout(() => setShowPinSuccess(false), 3000);
    } else {
      alert('PINは4桁で入力してください');
    }
  };

  const handleExport = () => {
    const data = {
      projects,
      cases,
      exportDate: new Date().toISOString(),
      version: '6.1.0'
    };
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alchemist_sfa_backup_${format(new Date(), 'yyyyMMdd')}.json`;
    link.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);
        importData(data);
        alert('データを正常にインポートしました');
      } catch (err) {
        console.error(err);
        alert('ファイルの読み込みに失敗しました。正しい形式のJSONを選択してください。');
      }
      e.target.value = ''; // Reset
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black italic tracking-tighter text-foreground flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" /> SYSTEM SETTINGS
        </h2>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">セキュリティとデータ管理の設定</p>
      </div>

      {/* Passcode Settings */}
      <Card className="bg-white border-none paper-shadow-lg rounded-[2.5rem] overflow-hidden">
        <div className="h-2 w-full bg-primary" />
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-xl font-black italic tracking-tighter flex items-center gap-4 text-foreground uppercase">
            <ShieldCheck className="w-6 h-6 text-primary" /> Passcode Setup
          </CardTitle>
          <CardDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">起動時の4桁PINコードを管理します</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Key className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground opacity-30" />
              <Input 
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="新しい4桁のPIN"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                className="h-16 bg-secondary/30 border-none rounded-2xl font-black text-3xl tracking-[1em] text-center pl-10"
              />
            </div>
            <Button onClick={handleUpdatePin} className="bg-primary hover:bg-primary/90 text-white font-black h-16 px-10 rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
              更新
            </Button>
          </div>
          {showPinSuccess && (
            <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-black italic">PINコードを正常に更新しました</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="bg-white border-none paper-shadow-lg rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-xl font-black italic tracking-tighter flex items-center gap-4 text-foreground uppercase">
            <Database className="w-6 h-6 text-blue-500" /> Data Management
          </CardTitle>
          <CardDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">バックアップ・復元・初期化の操作</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Button 
              variant="outline" 
              onClick={handleExport} 
              className="h-32 flex flex-col items-center justify-center gap-4 border-none bg-secondary/30 hover:bg-secondary/50 rounded-3xl transition-all hover:scale-[1.02] active:scale-98"
            >
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600">
                <Download className="w-6 h-6" />
              </div>
              <div className="text-center">
                <div className="text-lg font-black italic text-foreground tracking-tighter">Backup</div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">全データをJSON出力</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()} 
              className="h-32 flex flex-col items-center justify-center gap-4 border-none bg-secondary/30 hover:bg-secondary/50 rounded-3xl transition-all hover:scale-[1.02] active:scale-98"
            >
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-center">
                <div className="text-lg font-black italic text-foreground tracking-tighter">Restore</div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">バックアップを読込</div>
              </div>
            </Button>
            
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              accept=".json" 
              onChange={handleImport}
            />
          </div>

          <div className="p-8 rounded-[2rem] bg-destructive/5 border border-destructive/10 flex flex-col sm:flex-row items-center gap-6">
            <div className="bg-destructive/10 p-4 rounded-2xl">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-lg font-black italic text-destructive tracking-tighter mb-1 uppercase">Danger Zone</p>
              <p className="text-[11px] font-bold text-muted-foreground leading-relaxed opacity-80">
                すべてのヒアリングシートと案件データが削除されます。実行前に必ずバックアップを取ってください。
              </p>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => {
                if(confirm('【警告】本当にすべてのデータを削除しますか？\nこの操作は取り消せません。')) {
                  useHearsStore.setState({ projects: [], cases: [] });
                  alert('すべてのデータを削除しました');
                }
              }}
              className="w-full sm:w-auto h-14 px-8 rounded-2xl text-destructive hover:bg-destructive/10 font-black text-xs uppercase tracking-widest"
            >
              全データを初期化
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <div className="flex flex-col items-center justify-center pt-8 pb-12">
        <div className="flex items-center gap-3 text-sm font-black italic tracking-[0.2em] text-foreground mb-3 opacity-40 uppercase">
          <RefreshCcw className="w-4 h-4" /> ALCHEMIST SFA INFRASTRUCTURE v6.3.0
        </div>
        <div className="px-6 py-2 bg-secondary/50 rounded-full text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-30">
          Professional Build 2026.04.29
        </div>
      </div>
    </div>
  );
}
