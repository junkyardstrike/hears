'use client';

import { useState, useRef, useEffect } from 'react';
import { useHearsStore } from '@/store/useHearsStore';
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
  const { 
    pinCode, setPinCode, projects, cases, importData,
    backupSettings, setBackupSettings, exportDatabase, importDatabase, loadSyncDirHandle
  } = useHearsStore();
  
  const [newPin, setNewPin] = useState('');
  const [showPinSuccess, setShowPinSuccess] = useState(false);
  const [masterPassword, setMasterPassword] = useState(backupSettings.masterPassword || '');
  const [showPassword, setShowPassword] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSyncDirHandle();
  }, [loadSyncDirHandle]);

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

  const handleSelectDir = async () => {
    try {
      const handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
      setBackupSettings({ syncDirHandle: handle, enabled: true });
    } catch (e) {
      console.error('Directory selection failed:', e);
    }
  };

  const handleManualExport = async () => {
    if (!backupSettings.syncDirHandle || !masterPassword) {
      alert('同期フォルダとパスワードを設定してください');
      return;
    }
    setIsSyncing(true);
    const res = await exportDatabase(backupSettings.syncDirHandle, masterPassword);
    setIsSyncing(false);
    if (res.success) {
      setBackupSettings({ lastBackupDate: Date.now(), masterPassword });
      alert(`同期フォルダにバックアップを保存しました: ${res.fileName}`);
    } else {
      alert(res.error);
    }
  };

  const handleManualImport = async () => {
    if (!masterPassword) {
      alert('復号用のパスワードを入力してください');
      return;
    }
    try {
      const [fileHandle] = await (window as any).showOpenFilePicker({
        types: [{ description: 'Alchemist DB', accept: { 'application/octet-stream': ['.alchemist'] } }],
        multiple: false
      });
      setIsSyncing(true);
      const res = await importDatabase(fileHandle, masterPassword);
      setIsSyncing(false);
      if (res.success) {
        setBackupSettings({ masterPassword });
        alert('データを正常にインポート（スワップ）しました');
      } else {
        alert(res.error);
      }
    } catch (e) {
      console.error('Import aborted');
    }
  };

  const handleExportJson = () => {
    const data = { projects, cases, exportDate: new Date().toISOString(), version: '6.3.0' };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alchemist_sfa_backup_${format(new Date(), 'yyyyMMdd')}.json`;
    link.click();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black italic tracking-tighter text-foreground flex items-center gap-3 font-[family-name:var(--font-outfit)]">
          <Settings className="w-8 h-8 text-primary" /> SYSTEM SETTINGS
        </h2>
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">セキュリティとデータ管理の設定</p>
      </div>

      {/* Sync & Backup Settings */}
      <Card className="bg-white border-none paper-shadow-lg rounded-[2.5rem] overflow-hidden">
        <div className="h-2 w-full bg-emerald-500" />
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-xl font-black italic tracking-tighter flex items-center gap-4 text-foreground uppercase font-[family-name:var(--font-outfit)]">
            <FolderSync className="w-6 h-6 text-emerald-500" /> Sync & Cloud Backup
          </CardTitle>
          <CardDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">Googleドライブ等を利用したセキュア同期</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-8">
          <div className="space-y-6">
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">1. 同期フォルダを選択 / SELECT FOLDER</label>
              <div className="flex gap-4">
                <div className="flex-1 px-6 py-4 bg-secondary/30 rounded-2xl border border-border flex items-center justify-between min-w-0">
                  <span className="text-xs font-bold truncate text-foreground/70 italic">
                    {backupSettings.syncDirHandle ? `[CONNECTED] ${backupSettings.syncDirHandle.name}` : 'フォルダが選択されていません'}
                  </span>
                  {backupSettings.syncDirHandle && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                </div>
                <Button onClick={handleSelectDir} variant="outline" className="h-14 px-8 rounded-2xl font-bold border-2 border-emerald-500/20 text-emerald-600 hover:bg-emerald-50">
                  変更
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">2. マスターパスワード / MASTER PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground opacity-30" />
                <Input 
                  type={showPassword ? "text" : "password"}
                  placeholder="暗号化・復号に使用するパスワード"
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  className="h-16 bg-secondary/30 border-none rounded-2xl font-bold text-base px-16"
                />
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-[9px] font-bold text-muted-foreground/60 italic">※このパスワードを忘れると、クラウド上のバックアップを復号できなくなります。</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <Button 
              disabled={isSyncing || !backupSettings.syncDirHandle}
              onClick={handleManualExport}
              className="h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-200/50 flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30"
            >
              <Save className="w-5 h-5" />
              <div className="flex flex-col items-start leading-none">
                <span className="text-[11px] uppercase">Force Sync</span>
                <span className="text-[8px] opacity-60 mt-1 font-bold">今すぐ暗号化して保存</span>
              </div>
            </Button>
            <Button 
              disabled={isSyncing}
              onClick={handleManualImport}
              variant="outline"
              className="h-16 border-2 border-emerald-500/20 text-emerald-600 font-black rounded-2xl flex items-center gap-3 hover:bg-emerald-50 transition-all hover:scale-[1.02] active:scale-95"
            >
              <RefreshCcw className={cn("w-5 h-5", isSyncing && "animate-spin")} />
              <div className="flex flex-col items-start leading-none text-left">
                <span className="text-[11px] uppercase">Restore from Cloud</span>
                <span className="text-[8px] opacity-60 mt-1 font-bold">クラウドから復元(スワップ)</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Passcode Settings */}
      <Card className="bg-white border-none paper-shadow-lg rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-xl font-black italic tracking-tighter flex items-center gap-4 text-foreground uppercase font-[family-name:var(--font-outfit)]">
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
        </CardContent>
      </Card>

      {/* Legacy Data Management */}
      <Card className="bg-white border-none paper-shadow-lg rounded-[2.5rem] overflow-hidden opacity-60">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-xl font-black italic tracking-tighter flex items-center gap-4 text-foreground uppercase font-[family-name:var(--font-outfit)]">
            <Database className="w-6 h-6 text-blue-500" /> Legacy Management
          </CardTitle>
          <CardDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-60">非暗号化JSON形式でのバックアップ（非推奨）</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button variant="outline" onClick={handleExportJson} className="h-16 flex items-center gap-3 border-none bg-secondary/30 hover:bg-secondary/50 rounded-2xl transition-all">
              <Download className="w-5 h-5 text-blue-600" />
              <span className="text-[11px] font-black uppercase">Export JSON</span>
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="h-16 flex items-center gap-3 border-none bg-secondary/30 hover:bg-secondary/50 rounded-2xl transition-all">
              <Upload className="w-5 h-5 text-primary" />
              <span className="text-[11px] font-black uppercase">Import JSON</span>
            </Button>
            <input type="file" className="hidden" ref={fileInputRef} accept=".json" onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                try {
                  importData(JSON.parse(ev.target?.result as string));
                  alert('インポート完了');
                } catch (err) { alert('形式が違います'); }
              };
              reader.readAsText(file);
            }} />
          </div>

          <div className="mt-8 p-6 rounded-[2rem] bg-destructive/5 border border-destructive/10 flex flex-col sm:flex-row items-center gap-4">
            <AlertTriangle className="w-6 h-6 text-destructive shrink-0" />
            <div className="flex-1 text-center sm:text-left">
              <p className="text-[10px] font-black text-muted-foreground leading-relaxed opacity-80">
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
              className="text-destructive hover:bg-destructive/10 font-black text-[10px] uppercase tracking-widest"
            >
              全初期化
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <div className="flex flex-col items-center justify-center pt-8 pb-12">
        <div className="flex items-center gap-3 text-sm font-black italic tracking-[0.2em] text-foreground mb-3 opacity-40 uppercase font-[family-name:var(--font-outfit)]">
          <RefreshCcw className="w-4 h-4" /> ALCHEMIST SFA INFRASTRUCTURE v6.3.0
        </div>
        <div className="px-6 py-2 bg-secondary/50 rounded-full text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-30">
          Professional Build 2026.05.01
        </div>
      </div>
    </div>
  );
}
