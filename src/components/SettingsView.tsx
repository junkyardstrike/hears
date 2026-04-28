'use client';

import { useState, useRef } from 'react';
import { useHearsStore } from '@/store/useHearsStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Shield, Download, Upload, Trash2, Key, Info, 
  AlertTriangle, CheckCircle2, Database
} from 'lucide-react';
import { format } from 'date-fns';

export function SettingsView() {
  const { pinCode, setPinCode, projects, cases } = useHearsStore();
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
      version: '5.0.0'
    };
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alchemist_backup_${format(new Date(), 'yyyyMMdd')}.json`;
    link.click();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Passcode Settings */}
      <Card className="bg-[#0c0c0e] border-white/5 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary to-transparent" />
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2 text-white">
            <Key className="w-5 h-5 text-primary" /> パスコード設定
          </CardTitle>
          <CardDescription className="text-xs">起動時の4桁PINコードを設定します</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
          <div className="flex gap-2 sm:gap-4">
            <Input 
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="新しい4桁のPIN"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              className="bg-black/40 border-white/5 text-center text-xl sm:text-2xl tracking-[0.5em] sm:tracking-[1em] h-12"
            />
            <Button onClick={handleUpdatePin} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 sm:px-8">
              更新
            </Button>
          </div>
          {showPinSuccess && (
            <p className="text-primary text-[10px] font-bold flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-3 h-3" /> PINコードを更新しました
            </p>
          )}
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="bg-[#0c0c0e] border-white/5">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2 text-white">
            <Database className="w-5 h-5 text-blue-500" /> データ管理
          </CardTitle>
          <CardDescription className="text-xs">データのバックアップと復元を行います</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-6">
          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <Button variant="outline" onClick={handleExport} className="h-20 sm:h-24 flex flex-col gap-1 sm:gap-2 border-white/5 hover:bg-white/5 p-2">
              <Download className="w-5 h-5 text-blue-500" />
              <div className="text-center">
                <div className="text-[11px] sm:text-sm font-bold">バックアップ</div>
                <div className="text-[8px] opacity-40 uppercase tracking-tighter">Export JSON</div>
              </div>
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="h-20 sm:h-24 flex flex-col gap-1 sm:gap-2 border-white/5 hover:bg-white/5 p-2">
              <Upload className="w-5 h-5 text-purple-500" />
              <div className="text-center">
                <div className="text-[11px] sm:text-sm font-bold">インポート</div>
                <div className="text-[8px] opacity-40 uppercase tracking-tighter">Import JSON</div>
              </div>
            </Button>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              accept=".json" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                  try {
                    const content = event.target?.result as string;
                    const data = JSON.parse(content);
                    
                    // 1. Full Store Export
                    if (data.projects && Array.isArray(data.projects)) {
                      useHearsStore.setState({ 
                        projects: data.projects,
                        cases: data.cases || []
                      });
                      alert('データを復元しました');
                    } 
                    // 2. Project Array (Old Backup)
                    else if (Array.isArray(data)) {
                      useHearsStore.setState((state) => ({
                        projects: [...state.projects, ...data]
                      }));
                      alert(`${data.length}件のプロジェクトを追加しました`);
                    }
                    // 3. Single Project
                    else if (data.id && data.name) {
                      useHearsStore.setState((state) => ({
                        projects: [...state.projects, data]
                      }));
                      alert('プロジェクトを1件追加しました');
                    } else {
                      alert('無効なファイル形式です');
                    }
                  } catch (err) {
                    console.error(err);
                    alert('ファイルの読み込みに失敗しました');
                  }
                  e.target.value = ''; // Reset input
                };
                reader.readAsText(file);
              }}
            />
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-destructive/5 border border-destructive/10">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] sm:text-sm font-bold text-destructive mb-1">データの初期化</p>
                <p className="text-[9px] sm:text-[11px] text-muted-foreground leading-relaxed">
                  すべてのヒアリングシートと案件データが削除されます。この操作は取り消せません。
                </p>
                <Button variant="ghost" className="mt-2 text-destructive hover:bg-destructive/10 px-0 h-auto font-bold text-[10px] sm:text-xs">
                  全データを削除する
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <div className="flex flex-col items-center justify-center pt-8 pb-12 opacity-30">
        <div className="flex items-center gap-2 text-xs font-black italic tracking-widest text-white mb-2">
          ALCHEMIST <span className="text-primary not-italic">v5.0.0</span>
        </div>
        <p className="text-[10px] uppercase tracking-widest font-bold">Professional Management Infrastructure</p>
      </div>
    </div>
  );
}
