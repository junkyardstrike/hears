'use client';

import { useState } from 'react';
import { ProjectData } from '@/store/useHearsStore';
import { Button } from '@/components/ui/button';
import { Copy, Check, Download, Bot, Plus, X, FileText, Share2 } from 'lucide-react';
import Papa from 'papaparse';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

interface Props {
  project: ProjectData;
  activeTab: 'loveHotel' | 'general';
}

export function ExportPanel({ project, activeTab }: Props) {
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const generateMarkdown = () => {
    let md = `# ヒアリングシート (${activeTab === 'loveHotel' ? 'ラブホテル特化' : '汎用'})\n\n`;
    const { basicInfo, loveHotel, generalQuestions } = project;

    md += `## 基本情報\n`;
    if (basicInfo.clientName) md += `- **クライアント名**: ${basicInfo.clientName}\n`;
    if (basicInfo.managerName) md += `- **担当者名**: ${basicInfo.managerName}\n`;
    if (basicInfo.contact) md += `- **メールアドレス**: ${basicInfo.contact}\n`;
    if (basicInfo.siteName) md += `- **サイト名**: ${basicInfo.siteName}\n`;
    if (basicInfo.urlOrDomain) md += `- **既存URL/希望ドメイン**: ${basicInfo.urlOrDomain}\n`;
    if (basicInfo.deadline) md += `- **希望納期**: ${basicInfo.deadline}\n`;
    if (basicInfo.budget) md += `- **概算予算**: ${basicInfo.budget}\n`;
    md += `\n`;

    if (activeTab === 'loveHotel') {
      const pricing = loveHotel.pricing || { rest: '', stay: '', freeTime: '', shortTime: '', extension: '', image: null };
      const access = loveHotel.access || { entryEase: '', parkingHiding: '', highRoof: false };

      if (loveHotel.sellingPoints) {
        md += `## ① ホテルの推しポイント\n${loveHotel.sellingPoints}\n\n`;
      }

      md += `## ② 部屋詳細\n`;
      const common = loveHotel.commonEquipments.map(e => e.name).filter(Boolean).join(', ');
      if (common) md += `- **共通設備**: ${common}\n`;
      md += `### 部屋リスト (${loveHotel.rooms.length}室)\n`;
      loveHotel.rooms.forEach(r => {
        const specialEqs = r.specialEquipments.map(e => e.name).filter(Boolean).join(', ');
        md += `- [${r.roomNumber || '未入力'}] ランク: ${r.rank || '未入力'} | 限定設備: ${specialEqs || 'なし'}\n`;
      });
      
      md += `\n## ③ 料金システム\n`;
      if (pricing.rest) md += `- 休憩: ${pricing.rest}\n`;
      if (pricing.stay) md += `- 宿泊: ${pricing.stay}\n`;
      if (pricing.freeTime) md += `- フリータイム: ${pricing.freeTime}\n`;
      if (pricing.shortTime) md += `- ショートタイム: ${pricing.shortTime}\n`;
      if (pricing.extension) md += `- 延長料金: ${pricing.extension}\n`;

      md += `\n## ④ フード・飲食\n`;
      md += `- ウェルカムサービス: ${loveHotel.food.welcomeService ? 'あり' : 'なし'}\n`;
      md += `- 深夜メニュー: ${loveHotel.food.midnightMenu ? 'あり' : 'なし'}\n`;
      md += `- メンバー価格: ${loveHotel.food.memberPrice ? 'あり' : 'なし'}\n`;
      
      md += `\n## ⑤ システム・サービス\n`;
      md += `### ホテナビ連携\n`;
      md += `- メンバー特典: ${loveHotel.system.hotenavi.displays.member}\n`;
      md += `- 料金・客室情報: ${loveHotel.system.hotenavi.displays.price}\n`;
      md += `- サービス・設備: ${loveHotel.system.hotenavi.displays.service}\n`;
      md += `- フードメニュー: ${loveHotel.system.hotenavi.displays.food}\n`;
      if (loveHotel.system.hotenavi.reverseLinks) {
        md += `- 逆連携: ${loveHotel.system.hotenavi.reverseLinks}\n`;
      }
      md += `### その他\n`;
      md += `- メンバーシステム: ${loveHotel.system.hasMemberSystem ? 'あり' : 'なし'}\n`;
      if (loveHotel.system.hasMemberSystem && loveHotel.system.memberDetails) {
        md += `  - 詳細: ${loveHotel.system.memberDetails}\n`;
      }
      md += `- レンタル品: ${loveHotel.system.hasRental ? 'あり' : 'なし'}\n`;
      if (loveHotel.system.hasRental) {
        loveHotel.system.rentals.forEach(r => {
          if(r.name) md += `  - ${r.name} (${r.price || '料金未定'})\n`;
        });
      }
      md += `- 販売品: ${(loveHotel.system.hasSale ?? true) ? 'あり' : 'なし'}\n`;
      if (loveHotel.system.hasSale ?? true) {
        (loveHotel.system.sales || []).forEach(r => {
          if(r.name) md += `  - ${r.name} (${r.price || '料金未定'})\n`;
        });
      }
      if (loveHotel.system.couponInfo) md += `- クーポン情報: ${loveHotel.system.couponInfo}\n`;

      md += `\n## ⑥ アクセス・立地\n`;
      if (basicInfo.location) md += `- 所在地: ${basicInfo.location}\n`;
      if (basicInfo.phone) md += `- 電話番号: ${basicInfo.phone}\n`;
      if (basicInfo.parking) md += `- 駐車場台数: ${basicInfo.parking}\n`;
      if (access.entryEase) md += `- 車での入りやすさ: ${access.entryEase}\n`;
      if (access.parkingHiding) md += `- 駐車場の隠蔽性: ${access.parkingHiding}\n`;
      md += `- ハイルーフ車対応: ${access.highRoof ? 'あり' : 'なし'}\n`;

      if (loveHotel.memo) {
        md += `\n## ⑦ 担当者メモ\n${loveHotel.memo}\n\n`;
      }

    } else {
      const filled = generalQuestions.filter(q => q.value.trim() !== '');
      const cats = Array.from(new Set(filled.map(q => q.category)));
      for (const cat of cats) {
        md += `## ${cat}\n`;
        filled.filter(q => q.category === cat).forEach(q => {
          md += `### ${q.label}\n${q.value}\n\n`;
        });
      }
    }
    return md;
  };

  const generateReaddyPrompt = () => {
    let prompt = `あなたはプロのWebディレクターです。今から渡すヒアリングシートの情報を元に、ノーコードツール『Readdy』でホームページを制作するための、詳細なセクション構成案と各ブロックへの指示書を作成してください。\n\n`;
    prompt += `【入力データ】\n`;
    prompt += generateMarkdown();
    
    prompt += `\n\n【Readdy向けの具体的制約】\n`;
    prompt += `1. ラブホテルとしての高級感を出すためのカラーパレットとフォントの指定を行ってください。\n`;
    prompt += `2. 部屋情報（201, 202...）をReaddyのリストブロックやカードブロックでどう表現すべきかの指示を含めてください。\n`;
    prompt += `3. ホテナビとHPの役割分担（どちらに何を載せるか、連携の導線など）を反映したナビゲーション構成を提案してください。\n`;
    prompt += `4. 画像を配置すべき場所のプレースホルダー指示を明確にしてください。\n`;
    prompt += `5. そのままReaddyの設定値や構成案として使えるよう、スリムな箇条書き形式で出力してください。\n`;
    return prompt;
  };

  const handleCopyMd = async () => {
    try {
      await navigator.clipboard.writeText(generateMarkdown());
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generateReaddyPrompt());
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleExportCSV = () => {
    const rows: string[][] = [];
    rows.push(['カテゴリ', '項目名', '内容']);
    
    const { basicInfo, loveHotel, generalQuestions } = project;
    
    const addRow = (cat: string, label: string, val: string) => {
      if (val && val.trim() !== '') {
        rows.push([cat, label, val]);
      }
    };

    addRow('基本情報', 'クライアント名', basicInfo.clientName);
    addRow('基本情報', '担当者名', basicInfo.managerName);
    addRow('基本情報', 'メール', basicInfo.contact);
    addRow('基本情報', 'サイト名', basicInfo.siteName);
    addRow('基本情報', 'ドメイン', basicInfo.urlOrDomain);
    addRow('基本情報', '納期', basicInfo.deadline);
    addRow('基本情報', '予算', basicInfo.budget);

    if (activeTab === 'loveHotel') {
      const pricing = loveHotel.pricing || { rest: '', stay: '', freeTime: '', shortTime: '', extension: '', image: null };
      const access = loveHotel.access || { entryEase: '', parkingHiding: '', highRoof: false };

      addRow('推しポイント', 'ホテルの推しポイント', loveHotel.sellingPoints);
      addRow('部屋詳細', '共通設備', loveHotel.commonEquipments.map(e => e.name).filter(Boolean).join(', '));
      addRow('部屋詳細', '合計部屋数', String(loveHotel.rooms.length));
      
      loveHotel.rooms.forEach((r, i) => {
        const specialEqs = r.specialEquipments.map(e => e.name).filter(Boolean).join(', ');
        addRow('部屋詳細', `部屋 ${i+1}`, `[${r.roomNumber}] ランク:${r.rank} 限定設備:${specialEqs}`);
      });

      addRow('料金システム', '休憩', pricing.rest);
      addRow('料金システム', '宿泊', pricing.stay);
      addRow('料金システム', 'フリータイム', pricing.freeTime);
      addRow('料金システム', 'ショートタイム', pricing.shortTime);
      addRow('料金システム', '延長料金', pricing.extension);

      addRow('フード', 'ウェルカムサービス', loveHotel.food.welcomeService ? 'あり' : 'なし');
      addRow('フード', '深夜メニュー', loveHotel.food.midnightMenu ? 'あり' : 'なし');
      addRow('フード', 'メンバー価格', loveHotel.food.memberPrice ? 'あり' : 'なし');
      
      addRow('システム', 'ホテナビ特典表示', loveHotel.system.hotenavi.displays.member);
      addRow('システム', 'ホテナビ料金表示', loveHotel.system.hotenavi.displays.price);
      addRow('システム', 'ホテナビサービス表示', loveHotel.system.hotenavi.displays.service);
      addRow('システム', 'ホテナビフード表示', loveHotel.system.hotenavi.displays.food);
      addRow('システム', '逆連携', loveHotel.system.hotenavi.reverseLinks);
      
      addRow('システム', 'メンバーシステム', loveHotel.system.hasMemberSystem ? 'あり' : 'なし');
      addRow('システム', 'メンバー詳細', loveHotel.system.memberDetails);
      addRow('システム', 'レンタル品有無', loveHotel.system.hasRental ? 'あり' : 'なし');
      
      if (loveHotel.system.hasRental) {
        const rentals = loveHotel.system.rentals.map(r => `${r.name}(${r.price})`).filter(Boolean).join(', ');
        addRow('システム', 'レンタル品目', rentals);
      }
      
      addRow('システム', '販売品有無', (loveHotel.system.hasSale ?? true) ? 'あり' : 'なし');
      if (loveHotel.system.hasSale ?? true) {
        const sales = (loveHotel.system.sales || []).map(r => `${r.name}(${r.price})`).filter(Boolean).join(', ');
        addRow('システム', '販売品目', sales);
      }
      
      addRow('システム', 'クーポン情報', loveHotel.system.couponInfo);

      addRow('アクセス', '所在地', basicInfo.location);
      addRow('アクセス', '電話', basicInfo.phone);
      addRow('アクセス', '駐車場', basicInfo.parking);
      addRow('アクセス', '車での入りやすさ', access.entryEase);
      addRow('アクセス', '駐車場の隠蔽性', access.parkingHiding);
      addRow('アクセス', 'ハイルーフ車対応', access.highRoof ? 'あり' : 'なし');

      addRow('担当者メモ', 'メモ', loveHotel.memo);

    } else {
      generalQuestions.forEach(q => {
        if (q.value.trim() !== '') {
          addRow(q.category, q.label, q.value);
        }
      });
    }

    const csvStr = Papa.unparse(rows);
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvStr], { type: 'text/csv;charset=utf-8;' }); 
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hears_export_${project.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end gap-4 font-sans">
      
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-10 fade-in duration-500">
            
            <ExportButton 
              onClick={handleExportCSV}
              icon={<Download className="w-5 h-5" />}
              label="CSV 形式で出力"
              subLabel="Excelなどで管理"
              className="bg-card border border-border text-foreground hover:bg-secondary"
            />

            <ExportButton 
              onClick={handleCopyMd}
              icon={copiedMd ? <Check className="w-5 h-5 text-emerald-500" /> : <FileText className="w-5 h-5" />}
              label={copiedMd ? "コピー完了" : "Markdown 出力"}
              subLabel="ドキュメント等に貼り付け"
              className="bg-card border border-border text-foreground hover:bg-secondary"
            />

            <ExportButton 
              onClick={handleCopyPrompt}
              icon={copiedPrompt ? <Check className="w-6 h-6 text-emerald-500" /> : <Bot className="w-6 h-6" />}
              label={copiedPrompt ? "プロンプト生成完了" : "Readdy用指示書"}
              subLabel="AIでサイト構成案を生成"
              className="bg-primary border border-transparent text-primary-foreground hover:brightness-110 shadow-md"
            />
            
          </div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-14 w-14 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center p-0 border border-transparent",
          isOpen ? "bg-card text-foreground rotate-0 border-border hover:bg-secondary" : "bg-primary text-primary-foreground hover:brightness-110"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Share2 className="w-6 h-6" />}
      </Button>
    </div>
  );
}

function ExportButton({ onClick, icon, label, subLabel, className }: any) {
  return (
    <Button 
      onClick={onClick}
      className={cn(
        "h-16 px-6 rounded-lg border border-border bg-card shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-4 min-w-[280px] justify-start group",
        className
      )}
    >
      <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="flex flex-col items-start gap-0.5">
        <span className="text-sm font-bold tracking-tight">{label}</span>
        <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">{subLabel}</span>
      </div>
    </Button>
  );
}
