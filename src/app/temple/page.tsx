'use client';
import Image from 'next/image';

import { useMemo } from 'react';
import { useHearsStore, CaseData } from '@/store/useHearsStore';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, LabelList, AreaChart, Area } from 'recharts';
import { Crown, Sparkles, Sword, Coins, ArrowUpRight, Flame, Shield, Star, Wand2, Castle, Medal, Trophy, Clock, History } from 'lucide-react';
import { parseISO, isAfter, startOfMonth, format, addMonths, differenceInMonths, getHours, isWeekend, isSameMonth, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';

const TIER_THRESHOLDS = [
  { tier: 1, level: 1, min: 0, title: "初期ジョブ", jobs: { mage: "魔法使い", merchant: "商人", hero: "勇者" }, image: "/assets/avatars/tier1.png" },
  { tier: 2, level: 20, min: 2000000, title: "最初の壁を突破した専門家", jobs: { mage: "魔導師", merchant: "豪商", hero: "騎士" }, image: "/assets/avatars/tier2.png" },
  { tier: 3, level: 50, min: 5000000, title: "業界で自立した実力者", jobs: { mage: "大賢者", merchant: "資本家", hero: "聖騎士" }, image: "/assets/avatars/tier3.png" },
  { tier: 4, level: 100, min: 10000000, title: "卓越した技術を持つ熟練者", jobs: { mage: "真魔導学者", merchant: "大富豪", hero: "剣聖" }, image: "/assets/avatars/tier4.png" },
  { tier: 5, level: 500, min: 50000000, title: "極致に至った伝説の存在", jobs: { mage: "真理の探求者", merchant: "盤上の支配者", hero: "終焉を断つ者" }, image: "/assets/avatars/tier5.png" },
];

type ClassType = 'mage' | 'merchant' | 'hero';

const CLASS_INFO = {
  mage: {
    title: "魔法使い系統",
    subTitle: "Web / SNS 開発",
    imageSrc: "/assets/avatars/mage.png",
    jobs: ["魔法使い", "魔導師", "大賢者", "真魔導学者", "真理の探求者"],
    colorClass: "text-emerald-500",
    bgClass: "bg-emerald-500",
    borderClass: "border-emerald-500/30",
    glowClass: "shadow-emerald-500/50",
    fillColor: "#10b981"
  },
  merchant: {
    title: "商人系統",
    subTitle: "SiGMARK",
    imageSrc: "/assets/avatars/merchant.png",
    jobs: ["商人", "豪商", "資本家", "大富豪", "盤上の支配者"],
    colorClass: "text-amber-500",
    bgClass: "bg-amber-500",
    borderClass: "border-amber-500/30",
    glowClass: "shadow-amber-500/50",
    fillColor: "#f59e0b"
  },
  hero: {
    title: "勇者系統",
    subTitle: "OTHER GENRES",
    imageSrc: "/assets/avatars/hero.png",
    jobs: ["勇者", "騎士", "聖騎士", "剣聖", "終焉を断つ者"],
    colorClass: "text-blue-500",
    bgClass: "bg-blue-500",
    borderClass: "border-blue-500/30",
    glowClass: "shadow-blue-500/50",
    fillColor: "#3b82f6"
  }
};

const getTierFromRevenue = (revenue: number) => {
  let currentTier = 1;
  for (let i = TIER_THRESHOLDS.length - 1; i >= 0; i--) {
    if (revenue >= TIER_THRESHOLDS[i].min) {
      currentTier = TIER_THRESHOLDS[i].tier;
      break;
    }
  }
  return currentTier;
};

// --- Title Definitions ---
interface TitleCondition {
  id: string;
  name: string;
  description: string;
  category: string;
}

const MAGE_TITLE_DEFS: TitleCondition[] = [
  { id: 'mage_rev_1', name: 'はじまりの呪文', description: '魔法使い系統で最初の1円を記録', category: '累計収益' },
  { id: 'mage_rev_10k', name: '初級魔力の覚醒', description: '累計売上1万円突破', category: '累計収益' },
  { id: 'mage_rev_20k', name: 'マナのしずく', description: '累計売上2万円突破', category: '累計収益' },
  { id: 'mage_rev_30k', name: '術師の第一歩', description: '累計売上3万円突破', category: '累計収益' },
  { id: 'mage_rev_40k', name: '使い魔との契約', description: '累計売上4万円突破', category: '累計収益' },
  { id: 'mage_rev_50k', name: '魔導の基礎', description: '累計売上5万円突破', category: '累計収益' },
  { id: 'mage_rev_60k', name: '初級呪文のマスター', description: '累計売上6万円突破', category: '累計収益' },
  { id: 'mage_rev_70k', name: '魔力回路の形成', description: '累計売上7万円突破', category: '累計収益' },
  { id: 'mage_rev_80k', name: '見習い魔導士の誇り', description: '累計売上8万円突破', category: '累計収益' },
  { id: 'mage_rev_90k', name: '魔導書への記名', description: '累計売上9万円突破', category: '累計収益' },
  { id: 'mage_rev_100k', name: '見習い卒業', description: '累計売上10万円突破', category: '累計収益' },
  { id: 'mage_rev_200k', name: '魔導士の門出', description: '累計売上20万円突破', category: '累計収益' },
  { id: 'mage_rev_300k', name: '中級魔法の心得', description: '累計売上30万円突破', category: '累計収益' },
  { id: 'mage_rev_400k', name: '魔力の奔流', description: '累計売上40万円突破', category: '累計収益' },
  { id: 'mage_rev_500k', name: '魔力の胎動', description: '累計売上50万円突破', category: '累計収益' },
  { id: 'mage_rev_600k', name: '熟練の杖捌き', description: '累計売上60万円突破', category: '累計収益' },
  { id: 'mage_rev_700k', name: '高位魔法の予感', description: '累計売上70万円突破', category: '累計収益' },
  { id: 'mage_rev_800k', name: '魔導の探求者', description: '累計売上80万円突破', category: '累計収益' },
  { id: 'mage_rev_900k', name: '英知の入り口', description: '累計売上90万円突破', category: '累計収益' },
  { id: 'mage_rev_1m', name: '中級術師の自覚', description: '累計売上100万円突破', category: '累計収益' },
  { id: 'mage_rev_1.1m', name: '銀の杖の主', description: '累計売上110万円突破', category: '累計収益' },
  { id: 'mage_rev_1.2m', name: '魔力結晶의 精製', description: '累計売上120万円突破', category: '累計収益' },
  { id: 'mage_rev_1.3m', name: '元素の理解', description: '累計売上130万円突破', category: '累計収益' },
  { id: 'mage_rev_1.4m', name: '魔導回路の拡張', description: '累計売上140万円突破', category: '累計収益' },
  { id: 'mage_rev_1.5m', name: '中堅魔導士の威厳', description: '累計売上150万円突破', category: '累計収益' },
  { id: 'mage_rev_1.6m', name: '術式の最適化', description: '累計売上160万円突破', category: '累計収益' },
  { id: 'mage_rev_1.7m', name: '深淵への一歩', description: '累計売上170万円突破', category: '累計収益' },
  { id: 'mage_rev_1.8m', name: '魔力制御の極致', description: '累計売上180万円突破', category: '累計収益' },
  { id: 'mage_rev_1.9m', name: '叡智の萌芽', description: '累計売上190万円突破', category: '累計収益' },
  { id: 'mage_rev_3m', name: '魔導の担い手', description: '累計売上300万円突破', category: '累計収益' },
  { id: 'mage_rev_3.5m', name: '金色の魔導書', description: '累計売上350万円突破', category: '累計収益' },
  { id: 'mage_rev_4m', name: '高位魔導士の証', description: '累計売上400万円突破', category: '累計収益' },
  { id: 'mage_rev_4.5m', name: '魔力の海を泳ぐ者', description: '累計売上450万円突破', category: '累計収益' },
  { id: 'mage_rev_5m', name: '大魔導への道', description: '累計売上500万円突破', category: '累計収益' },
  { id: 'mage_rev_5.5m', name: '星詠みの術師', description: '累計売上550万円突破', category: '累計収益' },
  { id: 'mage_rev_6m', name: '魔導の求道者', description: '累計売上600万円突破', category: '累計収益' },
  { id: 'mage_rev_6.5m', name: '精霊の加護', description: '累計売上650万円突破', category: '累計収益' },
  { id: 'mage_rev_7m', name: '叡智の守護者', description: '累計売上700万円突破', category: '累計収益' },
  { id: 'mage_rev_7.5m', name: '聖域の魔導士', description: '累計売上750万円突破', category: '累計収益' },
  { id: 'mage_rev_8m', name: '次元の理解者', description: '累計売上800万円突破', category: '累計収益' },
  { id: 'mage_rev_8.5m', name: '賢者の領域', description: '累計売上850万円突破', category: '累計収益' },
  { id: 'mage_rev_9m', name: '古の呪文の継承者', description: '累計売上900万円突破', category: '累計収益' },
  { id: 'mage_rev_9.5m', name: '真理の門の番人', description: '累計売上950万円突破', category: '累計収益' },
  { id: 'mage_rev_10m', name: '伝説の魔導師', description: '累計売上1,000万円突破', category: '累計収益' },
  { id: 'mage_rev_12m', name: '禁忌の扉を叩く者', description: '累計売上1,200万円突破', category: '累計収益' },
  { id: 'mage_rev_15m', name: '魔法都市の主', description: '累計売上1,500万円突破', category: '累計収益' },
  { id: 'mage_rev_18m', name: '魔力の支配者', description: '累計売上1,800万円突破', category: '累計収益' },
  { id: 'mage_rev_20m', name: '叡智の頂', description: '累計売上2,000万円突破', category: '累計収益' },
  { id: 'mage_rev_30m', name: '理の超越', description: '累計売上3,000万円突破', category: '累計収益' },
  { id: 'mage_rev_50m', name: '真理の探求者', description: '累計売上5,000万円達成', category: '累計収益' },
  { id: 'mage_maint_10k', name: '聖域の小石', description: '保守累計収益1万円突破', category: '保守・継続' },
  { id: 'mage_maint_50k', name: '静かなる守護', description: '保守累計収益5万円突破', category: '保守・継続' },
  { id: 'mage_maint_100k', name: '聖域の柱', description: '保守累計収益10万円突破', category: '保守・継続' },
  { id: 'mage_maint_200k', name: '不落の魔力供給', description: '保守累計収益20万円突破', category: '保守・継続' },
  { id: 'mage_maint_300k', name: '不変の結界', description: '保守累計収益30万円突破', category: '保守・継続' },
  { id: 'mage_maint_1m', name: '聖域の賢者', description: '保守累計収益100万円突破', category: '保守・継続' },
  { id: 'mage_maint_2m', name: '永久機関の構築', description: '保守累計収益200万円突破', category: '保守・継続' },
  { id: 'mage_maint_3m', name: '信頼の芽', description: '保守収益が3ヶ月連続発生', category: '保守・継続' },
  { id: 'mage_maint_6m', name: '番人の日常', description: '保守収益が6ヶ月連続発生', category: '保守・継続' },
  { id: 'mage_maint_12m', name: '不変の魔力', description: '保守収益が12ヶ月連続発生', category: '保守・継続' },
  { id: 'mage_maint_24m', name: 'マナの源流', description: '保守収益が24ヶ月連続発生', category: '保守・継続' },
  { id: 'mage_maint_36m', name: '伝説の維持者', description: '保守収益が36ヶ月連続発生', category: '保守・継続' },
  { id: 'mage_cast_double', name: '二重詠唱（ダブルキャスト）', description: '同一月に「HP制作」と「SNS運用」の両方で売上を記録', category: '月間アクション' },
  { id: 'mage_cast_triple', name: '三連詠唱（トリプルキャスト）', description: '同一月にHP制作/SNS運用に加え、さらにもう1件別のWeb案件を完了', category: '月間アクション' },
  { id: 'mage_cast_quad', name: '四重詠唱（クアドラキャスト）', description: '同一月にWeb系統案件を4件完了', category: '月間アクション' },
  { id: 'mage_cast_penta', name: '五重詠唱（ペンタキャスト）', description: '同一月にWeb系統案件を5件完了', category: '月間アクション' },
  { id: 'mage_cast_multi', name: '神速のマルチキャスト', description: '同一月にWeb系統案件を10件完了', category: '月間アクション' },
  { id: 'mage_cast_storm', name: '乱れ打ち', description: '同一月にWeb系統案件を15件完了', category: '月間アクション' },
  { id: 'mage_stream_6m', name: 'マナの潮流', description: '魔法使い系統の総収益が6ヶ月連続で発生', category: '月間アクション' },
  { id: 'mage_stream_12m', name: '魔導の黄金時代', description: '魔法使い系統の総収益が12ヶ月連続で発生', category: '月間アクション' },
  { id: 'mage_stream_24m', name: '止まらぬ詠唱', description: '魔法使い系統の総収益が24ヶ月連続で発生', category: '月間アクション' },
  { id: 'mage_speed_7d', name: 'クイックキャスト', description: '案件作成から完了までが7日以内', category: '単価・瞬発力' },
  { id: 'mage_speed_3d', name: '瞬唱', description: '案件作成から完了までが3日以内', category: '単価・瞬発力' },
  { id: 'mage_speed_24h', name: '神速の具現化', description: '案件作成から完了までが24時間以内', category: '単価・瞬発力' },
  { id: 'mage_power_500k', name: '一撃の極大魔法', description: '1件の案件単価が50万円以上', category: '単価・瞬発力' },
  { id: 'mage_power_1m', name: '禁忌の究極魔法', description: '1件の案件単価が100万円以上', category: '単価・瞬発力' },
  { id: 'mage_power_2m', name: '天変地異', description: '1件の案件単価が200万円以上', category: '単価・瞬発力' },
  { id: 'mage_limit_break', name: '限界突破', description: '魔法使い系統の案件単価が過去最高額を更新', category: '単価・瞬発力' },
  { id: 'mage_pioneer', name: '魔導の開を開拓者', description: 'これまで扱ったことのない新しい取引先とWeb案件を完了', category: '単価・瞬発力' },
  { id: 'mage_repeat_2', name: '契約の更新', description: '同一取引先から累計2件完了', category: 'リピート・信頼' },
  { id: 'mage_repeat_3', name: '御用達の魔導士', description: '同一取引先から累計3件完了', category: 'リピート・信頼' },
  { id: 'mage_repeat_5', name: '宮廷魔導士', description: '同一取引先から累計5件完了', category: 'リピート・信頼' },
  { id: 'mage_repeat_10', name: '専属契約の真理', description: '同一取引先から累計10件完了', category: 'リピート・信頼' },
  { id: 'mage_trust_1m', name: '運命の共同体', description: '同一取引先からの累計売上が100万円突破', category: 'リピート・信頼' },
  { id: 'mage_trust_3m', name: '国の筆頭魔導士', description: '同一取引先からの累計売上が300万円突破', category: 'リピート・信頼' },
  { id: 'mage_trust_5m', name: '魔法界の重鎮', description: '同一取引先からの累計売上が500万円突破', category: 'リピート・信頼' },
  { id: 'mage_network_10', name: '知の集積地', description: '取引先名の重複なし数が10社に到達', category: 'リピート・信頼' },
  { id: 'mage_network_30', name: '世界を繋ぐ魔導網', description: '取引先名の重複なし数が30社に到達', category: 'リピート・信頼' },
  { id: 'mage_network_50', name: '全知のネットワーク', description: '取引先名の重複なし数が50社に到達', category: 'リピート・信頼' },
  { id: 'mage_time_midnight', name: '夜明けの魔導士', description: '深夜（24時〜5時）にWeb案件を完了', category: '複合・時間' },
  { id: 'mage_time_night', name: '月光の詠唱者', description: '22時〜24時の間にWeb案件を完了', category: '複合・時間' },
  { id: 'mage_time_weekend', name: '安息日の開拓者', description: '土日祝日にWeb案件を完了', category: '複合・時間' },
  { id: 'mage_routine', name: '魔導のルーチン', description: '同一週内に3件以上のWeb案件を完了', category: '複合・時間' },
  { id: 'mage_gold_month', name: '黄金の月', description: '魔法使い系統の月間売上が過去最高を更新', category: '複合・時間' },
  { id: 'mage_gold_year', name: '奇跡の世代', description: '魔法使い系統の年間売上が前年比2倍突破', category: '複合・時間' },
  { id: 'mage_hybrid', name: 'ハイブリッド・メイジ', description: 'HP制作とSNS運用の累計件数がそれぞれ10件到達', category: '複合・時間' },
  { id: 'mage_sns_master', name: 'SNSの魔術師', description: 'SNS運用カテゴリの累計売上が100万円突破', category: '複合・時間' },
  { id: 'mage_hp_architect', name: 'HPの建築家', description: 'HP制作カテゴリの累計売上が500万円突破', category: '複合・時間' },
  { id: 'mage_hall_of_fame', name: '魔導の殿堂入り', description: '魔法使い系統の全称号の50%を獲得', category: '複合・時間' },
  { id: 'mage_zenith', name: 'アルケミストの極致', description: '魔法使い系統の累計売上が1億円に到達', category: '複合・時間' },
];

const MERCHANT_TITLE_DEFS: TitleCondition[] = [
  { id: 'merchant_rev_1', name: '看板の掲揚', description: '商人系統で最初の1円を記録', category: '累計収益' },
  { id: 'merchant_rev_10k', name: '露天商の第一歩', description: '累計売上1万円突破', category: '累計収益' },
  { id: 'merchant_rev_20k', name: '商いの芽', description: '累計売上2万円突破', category: '累計収益' },
  { id: 'merchant_rev_30k', name: '小さな利銭', description: '累計売上3万円突破', category: '累計収益' },
  { id: 'merchant_rev_40k', name: '行商人の誇り', description: '累計売上4万円突破', category: '累計収益' },
  { id: 'merchant_rev_50k', name: '商売の基礎', description: '累計売上5万円突破', category: '累計収益' },
  { id: 'merchant_rev_60k', name: '駆け出し店主', description: '累計売上6万円突破', category: '累計収益' },
  { id: 'merchant_rev_70k', name: '仕入れの極意', description: '累計売上7万円突破', category: '累計収益' },
  { id: 'merchant_rev_80k', name: '看板娘の微笑み', description: '累計売上8万円突破', category: '累計収益' },
  { id: 'merchant_rev_90k', name: '商店の賑わい', description: '累計売上9万円突破', category: '累計収益' },
  { id: 'merchant_rev_100k', name: '街の商店主', description: '累計売上10万円突破', category: '累計収益' },
  { id: 'merchant_rev_200k', name: '市場の顔役', description: '累計売上20万円突破', category: '累計収益' },
  { id: 'merchant_rev_300k', name: '商売繁盛', description: '累計売上30万円突破', category: '累計収益' },
  { id: 'merchant_rev_400k', name: '利益の奔流', description: '累計売上40万円突破', category: '累計収益' },
  { id: 'merchant_rev_500k', name: '豪商の卵', description: '累計売上50万円突破', category: '累計収益' },
  { id: 'merchant_rev_600k', name: '商才の目覚め', description: '累計売上60万円突破', category: '累計収益' },
  { id: 'merchant_rev_700k', name: '富の呼び声', description: '累計売上70万円突破', category: '累計収益' },
  { id: 'merchant_rev_800k', name: '流通の支配者', description: '累計売上80万円突破', category: '累計収益' },
  { id: 'merchant_rev_900k', name: '金の匂いを知る者', description: '累計売上90万円突破', category: '累計収益' },
  { id: 'merchant_rev_1m', name: '豪商の風格', description: '累計売上100万円突破', category: '累計収益' },
  { id: 'merchant_rev_1.1m', name: '銀の算盤', description: '累計売上110万円突破', category: '累計収益' },
  { id: 'merchant_rev_1.2m', name: '資産の再投資', description: '累計売上120万円突破', category: '累計収益' },
  { id: 'merchant_rev_1.3m', name: '相場の理解', description: '累計売上130万円突破', category: '累計収益' },
  { id: 'merchant_rev_1.4m', name: '商業網の拡張', description: '累計売上140万円突破', category: '累計収益' },
  { id: 'merchant_rev_1.5m', name: '富豪の予感', description: '累計売上150万円突破', category: '累計収益' },
  { id: 'merchant_rev_1.6m', name: '商談の達人', description: '累計売上160万円突破', category: '累計収益' },
  { id: 'merchant_rev_1.7m', name: '富の集積', description: '累計売上170万円突破', category: '累計収益' },
  { id: 'merchant_rev_1.8m', name: '不変の価値', description: '累計売上180万円突破', category: '累計収益' },
  { id: 'merchant_rev_1.9m', name: '黄金の直感', description: '累計売上190万円突破', category: '累計収益' },
  { id: 'merchant_rev_3m', name: '資本家の卵', description: '累計売上300万円突破', category: '累計収益' },
  { id: 'merchant_rev_3.5m', name: '金の成る木', description: '累計売上350万円突破', category: '累計収益' },
  { id: 'merchant_rev_4m', name: '一等地の主', description: '累計売上400万円突破', category: '累計収益' },
  { id: 'merchant_rev_4.5m', name: '富の潮流に乗る者', description: '累計売上450万円突破', category: '累計収益' },
  { id: 'merchant_rev_5m', name: 'ギルドマスター', description: '累計売上500万円突破', category: '累計収益' },
  { id: 'merchant_rev_5.5m', name: '星を売る商人', description: '累計売上550万円突破', category: '累計収益' },
  { id: 'merchant_rev_6m', name: '富の開拓者', description: '累計売上600万円突破', category: '累計収益' },
  { id: 'merchant_rev_6.5m', name: '大富豪の資質', description: '累計売上650万円突破', category: '累計収益' },
  { id: 'merchant_rev_7m', name: '一国の経済', description: '累計売上700万円突破', category: '累計収益' },
  { id: 'merchant_rev_7.5m', name: '黄金の邸宅', description: '累計売上750万円突破', category: '累計収益' },
  { id: 'merchant_rev_8m', name: '中央銀行の主', description: '累計売上800万円突破', category: '累計収益' },
  { id: 'merchant_rev_8.5m', name: '経済の心臓', description: '累計売上850万円突破', category: '累計収益' },
  { id: 'merchant_rev_9m', name: '古の秘宝の売り手', description: '累計売上900万円突破', category: '累計収益' },
  { id: 'merchant_rev_9.5m', name: '富の真理の門', description: '累計売上950万円突破', category: '累計収益' },
  { id: 'merchant_rev_10m', name: '黄金郷の主（エル・ドラド）', description: '累計売上1,000万円突破', category: '累計収益' },
  { id: 'merchant_rev_12m', name: '世界の相場師', description: '累計売上1,200万円突破', category: '累計収益' },
  { id: 'merchant_rev_15m', name: '資本の城塞', description: '累計売上1,500万円突破', category: '累計収益' },
  { id: 'merchant_rev_18m', name: '不滅의 資産家', description: '累計売上1,800万円突破', category: '累計収益' },
  { id: 'merchant_rev_20m', name: '黄金の支配力', description: '累計売上2,000万円突破', category: '累計収益' },
  { id: 'merchant_rev_30m', name: 'マーケットの帝王', description: '累計売上3,000万円突破', category: '累計収益' },
  { id: 'merchant_rev_50m', name: '盤上の支配者', description: '累計売上5,000万円達成', category: '累計収益' },
  { id: 'merchant_maint_3m', name: '開店休業なし', description: '商人系統で3ヶ月連続売上', category: '保守・継続' },
  { id: 'merchant_maint_6m', name: 'ブランドの守護者', description: '商人系統で6ヶ月連続売上', category: '保守・継続' },
  { id: 'merchant_maint_12m', name: '不変の屋号', description: '商人系統で12ヶ月連続売上', category: '保守・継続' },
  { id: 'merchant_maint_24m', name: '千年の暖簾', description: '商人系統で24ヶ月連続売上', category: '保守・継続' },
  { id: 'merchant_maint_36m', name: '枯れない泉', description: '商人系統で36ヶ月連続売上', category: '保守・継続' },
  { id: 'merchant_up_3m', name: '富の再生産', description: '売上が3ヶ月連続で前月を上回る', category: '保守・継続' },
  { id: 'merchant_up_6m', name: 'バブルの予兆', description: '売上が6ヶ月連続で前月を上回る', category: '保守・継続' },
  { id: 'merchant_up_12m', name: '市場の熱気', description: '売上が12ヶ月連続で前月を上回る', category: '保守・継続' },
  { id: 'merchant_cast_2', name: '爆売りの兆し', description: '同一月に商談を2件完了', category: '月間アクション' },
  { id: 'merchant_cast_3', name: '市場の台風', description: '同一月に商談を3件完了', category: '月間アクション' },
  { id: 'merchant_cast_5', name: 'ブームの仕掛け人', description: '同一月に商談を5件完了', category: '月間アクション' },
  { id: 'merchant_cast_10', name: '爆売りの豪商', description: '同一月に商談を10件完了', category: '月間アクション' },
  { id: 'merchant_cast_20', name: '千客万来', description: '同一月に商談を20件完了', category: '月間アクション' },
  { id: 'merchant_cast_30', name: '市場の王', description: '同一月に商談を30件完了', category: '月間アクション' },
  { id: 'merchant_total_10', name: '商魂の火', description: '累計完了案件数10件', category: '月間アクション' },
  { id: 'merchant_total_50', name: '商魂の業火', description: '累計完了案件数50件', category: '月間アクション' },
  { id: 'merchant_total_100', name: '商魂の太陽', description: '累計完了案件数100件', category: '月間アクション' },
  { id: 'merchant_gold_month', name: '黄金の月', description: '月間売上が過去最高を更新', category: '月間アクション' },
  { id: 'merchant_gold_quarter', name: '黄金の四半期', description: '3ヶ月間の合計売上が過去最高を更新', category: '月間アクション' },
  { id: 'merchant_repeat_2', name: 'お得意様', description: '同一顧客からの累計受注2回', category: 'リピート・信頼' },
  { id: 'merchant_repeat_5', name: '生涯のパートナー', description: '同一顧客からの累計受注5回', category: 'リピート・信頼' },
  { id: 'merchant_repeat_10', name: '信用の錬金術', description: '同一顧客からの累計受注10回', category: 'リピート・信頼' },
  { id: 'merchant_network_5', name: '顔の広い商人', description: '顧客（取引先名）重複なし数が5社に到達', category: 'リピート・信頼' },
  { id: 'merchant_network_10', name: '人脈の金脈', description: '顧客重複なし数が10社に到達', category: 'リピート・信頼' },
  { id: 'merchant_network_20', name: '市場の顔役', description: '顧客重複なし数が20社に到達', category: 'リピート・信頼' },
  { id: 'merchant_network_50', name: '万客千客', description: '顧客重複なし数が50社に到達', category: 'リピート・信頼' },
  { id: 'merchant_network_100', name: '世界を繋ぐ鎖', description: '顧客重複なし数が100社に到達', category: 'リピート・信頼' },
  { id: 'merchant_trust_1m', name: '財界のフィクサー', description: '特定顧客からの累計売上100万円突破', category: 'リピート・信頼' },
  { id: 'merchant_trust_5m', name: '独占禁止法', description: '特定顧客からの累計売上500万円突破', category: 'リピート・信頼' },
  { id: 'merchant_speed_48h', name: '即決即断', description: '案件作成から完了まで48時間以内', category: '単価・瞬発力' },
  { id: 'merchant_speed_24h', name: '電光石火の取引', description: '案件作成から完了まで24時間以内', category: '単価・瞬発力' },
  { id: 'merchant_growth_50', name: '相場の魔術師', description: '前月比の売上成長率が50%を超える', category: '単価・瞬発力' },
  { id: 'merchant_high_margin', name: '賢い商い', description: '案件あたりの平均利益（想定）が一定基準を突破', category: '単価・瞬発力' },
  { id: 'merchant_perfect_target', name: '黄金のバランス', description: '指定月内の売上目標を100%ぴったりで達成', category: '単価・瞬発力' },
  { id: 'merchant_limit_break', name: '限界突破の豪商', description: '過去最高の単価を更新', category: '単価・瞬発力' },
  { id: 'merchant_branding_start', name: 'ブランドの種', description: 'SiGMARKで最初の売上', category: '複合・時間' },
  { id: 'merchant_sig_100k', name: 'ステッカー・マニア', description: 'SiGMARKカテゴリで累計売上10万円', category: '複合・時間' },
  { id: 'merchant_sig_1m', name: 'ブランドの象徴', description: 'SiGMARKカテゴリで累計売上100万円', category: '複合・時間' },
  { id: 'merchant_sig_5m', name: '歩く看板', description: 'SiGMARKカテゴリで累計売上500万円', category: '複合・時間' },
  { id: 'merchant_time_weekend', name: '休日のバイヤー', description: '土日祝日にSiGMARK案件を完了', category: '複合・時間' },
  { id: 'merchant_time_midnight', name: '闇市の主', description: '深夜（24時〜5時）にSiGMARK案件を完了', category: '複合・時間' },
  { id: 'merchant_growth_year', name: '黄金の1年', description: '年間の商人系統総売上が前年超え', category: '複合・時間' },
  { id: 'merchant_bubble_year', name: '奇跡のバブル', description: '年間の商人系統総売上が前年比2倍', category: '複合・時間' },
  { id: 'merchant_sns_lead', name: '広告塔の主', description: 'SNS経由（または特定フラグ）での売上を初記録', category: '複合・時間' },
  { id: 'merchant_dominate', name: '資本の支配者', description: '他系統の売上を商人系統が上回る', category: '複合・時間' },
  { id: 'merchant_roadmap_4', name: '商いのロードマップ', description: '商人系統の4次職に到達', category: '複合・時間' },
  { id: 'merchant_roadmap_5', name: '盤上の支配', description: '商人系統の5次職に到達', category: '複合・時間' },
  { id: 'merchant_out_of_pref', name: '全商人の憧れ', description: '累計取引先が県外（または特定フラグ）に到達', category: '複合・時間' },
  { id: 'merchant_hall_of_fame', name: '商いの殿堂入り', description: '商人系統の称号50%獲得', category: '複合・時間' },
  { id: 'merchant_zenith', name: '無限の資本', description: '商人系統累計売上1億円達成', category: '複合・時間' },
];

// Avatar Component
const AvatarNode = ({ classType, tier }: { classType: ClassType, tier: number }) => {
  const info = CLASS_INFO[classType];
  
  return (
    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
      {/* Rotating Magic Circle */}
      <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ animation: 'spin 12s linear infinite' }}>
        <svg viewBox="0 0 100 100" className={cn("w-full h-full", info.colorClass)} fill="none" stroke="currentColor">
          <circle cx="50" cy="50" r="48" strokeWidth="0.5" strokeDasharray="4 2" />
          <circle cx="50" cy="50" r="40" strokeWidth="1" strokeDasharray="10 5" />
          <path d="M50 5 L55 45 L95 50 L55 55 L50 95 L45 55 L5 50 L45 45 Z" strokeWidth="0.5" />
          <path d="M15 15 L85 85 M85 15 L15 85" strokeWidth="0.5" strokeDasharray="2 2" />
        </svg>
      </div>

      {/* Ambient Glow */}
      <div className={cn("absolute inset-0 opacity-20 rounded-full blur-xl", info.bgClass)} />
      
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Ground Shadow */}
        <div className="absolute bottom-2 w-12 h-3 bg-black/40 blur-[2px] rounded-[100%]" />

        {/* Character Image */}
        <div className={cn(
          "relative w-24 h-24 transition-transform duration-700",
          tier >= 2 && "scale-110",
          tier >= 4 && "scale-125"
        )}>
          <Image 
            src={info.imageSrc} 
            alt={`${info.title} Avatar`}
            fill
            className="object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      </div>

      <div className="absolute bottom-1 right-1 text-[10px] font-black opacity-40 z-10">T{tier}</div>
    </div>
  );
};

export default function TemplePage() {
  const { cases } = useHearsStore();

  const data = useMemo(() => {
    const nowD = startOfMonth(new Date());
    
    const totals = { mage: 0, merchant: 0, hero: 0 };
    const counts = { mage: 0, merchant: 0, hero: 0 };
    const history: Record<ClassType, { month: string, revenue: number }[]> = { mage: [], merchant: [], hero: [] };
    
    // For expanded stats & Rankings
    const maintenanceTotals = { mage: 0, merchant: 0, hero: 0 };
    const currentMonthMaint = { mage: 0, merchant: 0, hero: 0 };
    const spotTotals = { mage: 0, merchant: 0, hero: 0 };
    const clientRevenueMap: Record<ClassType, Record<string, { name: string, count: number, revenue: number, caseIds: string[] }>> = {
      mage: {}, merchant: {}, hero: {}
    };

    cases.forEach(c => {
      const g = c.genre || '';
      const t: ClassType = (g === 'HP制作' || g === 'SNS運用') ? 'mage' : (g === 'SiGMARK') ? 'merchant' : 'hero';
      
      if (!c.finance || !c.finance.revenueStartMonth) return;
      counts[t]++;
      
      const startStr = c.finance.revenueStartMonth;
      const startD = parseISO(`${startStr}-01`);
      
      // Calculate revenue up to current month
      const isStockType = g === 'HP制作' || g === 'SNS運用';
      let caseTotal = 0;
      let caseMaintenance = 0;
      let caseSpot = 0;
      
      const caseHistory: { month: string, amount: number }[] = [];
      
      if (isStockType) {
        const recM = c.finance.oneTimeFeeMonth || startStr;
        const recD = parseISO(`${recM}-01`);
        if (!isAfter(recD, nowD)) {
           const amt = c.finance.oneTimeFee || 0;
           caseHistory.push({ month: recM, amount: amt });
           caseTotal += amt;
           caseSpot += amt;
        }
        if (!isAfter(startD, nowD)) {
           const months = differenceInMonths(nowD, startD) + 1;
           for(let i=0; i<months; i++) {
              const dateObj = addMonths(startD, i);
              const mStr = format(dateObj, 'yyyy-MM');
              const amt = c.finance.maintenanceFee || 0;
              caseHistory.push({ month: mStr, amount: amt });
              caseTotal += amt;
              caseMaintenance += amt;
              
              if (isSameMonth(dateObj, nowD)) {
                currentMonthMaint[t] += amt;
              }
           }
        }
      } else {
        const recM = c.finance.spotMonth || startStr;
        const recD = parseISO(`${recM}-01`);
        if (!isAfter(recD, nowD)) {
           const amt = c.finance.spotFee || 0;
           caseHistory.push({ month: recM, amount: amt });
           caseTotal += amt;
           caseSpot += amt;
        }
      }
      
      totals[t] += caseTotal;
      maintenanceTotals[t] += caseMaintenance;
      spotTotals[t] += caseSpot;

      // Aggregate by Client (Ranking)
      const cName = c.contractEntity || c.clientName || '不明な取引先';
      if (!clientRevenueMap[t][cName]) {
        clientRevenueMap[t][cName] = { name: cName, count: 0, revenue: 0, caseIds: [] };
      }
      clientRevenueMap[t][cName].count += 1;
      clientRevenueMap[t][cName].revenue += caseTotal;
      clientRevenueMap[t][cName].caseIds.push(c.id);
      
      // Merge into class history
      caseHistory.forEach(h => {
        if (h.amount > 0) {
           const existing = history[t].find(x => x.month === h.month);
           if (existing) existing.revenue += h.amount;
           else history[t].push({ month: h.month, revenue: h.amount });
        }
      });
    });

    // Compute stats for each class
    const result: Record<ClassType, any> = {} as any;
    (['mage', 'merchant', 'hero'] as ClassType[]).forEach(t => {
       const rev = totals[t];
       const level = Math.floor(rev / 100000);
       const tier = getTierFromRevenue(rev);
       const jobName = CLASS_INFO[t].jobs[tier - 1];
       const currentTitle = TIER_THRESHOLDS.find(th => th.tier === tier)?.title || "";
       const nextThreshold = TIER_THRESHOLDS.find(th => th.tier === tier + 1);
       const nextLevel = nextThreshold ? nextThreshold.level : null;
       const toNext = nextLevel ? nextLevel - level : 0;
       const progress = nextThreshold ? Math.min(100, (rev - TIER_THRESHOLDS[tier-1].min) / (nextThreshold.min - TIER_THRESHOLDS[tier-1].min) * 100) : 100;
       
       // Top Clients Ranking
       const topClients = Object.values(clientRevenueMap[t])
         .sort((a, b) => b.revenue - a.revenue)
         .slice(0, 5);
         
       const revenueToNextLevel = nextThreshold ? Math.max(0, nextThreshold.min - rev) : 0;
       const nextLevelExpTarget = (Math.floor(rev / 100000) + 1) * 100000;
       const revenueToNextExpLevel = Math.max(0, nextLevelExpTarget - rev);

       // Calculate achieve month
       history[t].sort((a,b) => a.month.localeCompare(b.month));
       let acc = 0;
       let achieveMonth = "----";
       const targetMin = TIER_THRESHOLDS[tier-1].min;
       for(const h of history[t]) {
          acc += h.revenue;
          if (acc >= targetMin && targetMin > 0) {
             achieveMonth = h.month;
             break;
          }
       }
       if (tier === 1) achieveMonth = "INITIAL";

       const chartData = [];
       for(let i=11; i>=0; i--) {
          const mStr = format(addMonths(nowD, -i), 'yyyy-MM');
          const found = history[t].find(x => x.month === mStr);
          const dateObj = parseISO(`${mStr}-01`);
          chartData.push({ 
            month: `${format(dateObj, 'M')}月`, 
            value: found ? found.revenue : 0 
          });
       }

       result[t] = {
         revenue: rev,
         level: Math.max(1, level),
         tier,
         jobName,
         currentTitle,
         toNext,
         progress,
         achieveMonth,
         count: counts[t],
         maintenanceTotal: maintenanceTotals[t],
         currentMonthMaint: currentMonthMaint[t],
         spotTotal: spotTotals[t],
         topClients,
         revenueToNextLevel,
         revenueToNextExpLevel,
         chartData,
         titles: calculateTitles(t, cases, history[t], totals)
       };
    });

    return result;
  }, [cases]);

  // Helper to calculate titles
  function calculateTitles(type: ClassType, allCases: CaseData[], typeHistory: any[], allTotals: Record<ClassType, number>) {
    const isMage = type === 'mage';
    const isMerchant = type === 'merchant';
    if (!isMage && !isMerchant) return [];
    
    const acquired: any[] = [];
    const classCases = allCases.filter(c => {
      if (isMage) return c.genre === 'HP制作' || c.genre === 'SNS運用';
      if (isMerchant) return c.genre === 'SiGMARK';
      return false;
    });
    
    const titleDefs = isMage ? MAGE_TITLE_DEFS : MERCHANT_TITLE_DEFS;
    
    // Revenue Based
    const thresholds = [
      { id: `${type}_rev_1`, val: 1 }, { id: `${type}_rev_10k`, val: 10000 }, { id: `${type}_rev_20k`, val: 20000 },
      { id: `${type}_rev_30k`, val: 30000 }, { id: `${type}_rev_40k`, val: 40000 }, { id: `${type}_rev_50k`, val: 50000 },
      { id: `${type}_rev_60k`, val: 60000 }, { id: `${type}_rev_70k`, val: 70000 }, { id: `${type}_rev_80k`, val: 80000 },
      { id: `${type}_rev_90k`, val: 90000 }, { id: `${type}_rev_100k`, val: 100000 }, { id: `${type}_rev_200k`, val: 200000 },
      { id: `${type}_rev_300k`, val: 300000 }, { id: `${type}_rev_400k`, val: 400000 }, { id: `${type}_rev_500k`, val: 500000 },
      { id: `${type}_rev_600k`, val: 600000 }, { id: `${type}_rev_700k`, val: 700000 }, { id: `${type}_rev_800k`, val: 800000 },
      { id: `${type}_rev_900k`, val: 900000 }, { id: `${type}_rev_1m`, val: 1000000 }, { id: `${type}_rev_1.1m`, val: 1100000 },
      { id: `${type}_rev_1.2m`, val: 1200000 }, { id: `${type}_rev_1.3m`, val: 1300000 }, { id: `${type}_rev_1.4m`, val: 1400000 },
      { id: `${type}_rev_1.5m`, val: 1500000 }, { id: `${type}_rev_1.6m`, val: 1600000 }, { id: `${type}_rev_1.7m`, val: 1700000 },
      { id: `${type}_rev_1.8m`, val: 1800000 }, { id: `${type}_rev_1.9m`, val: 1900000 }, { id: `${type}_rev_3m`, val: 3000000 },
      { id: `${type}_rev_3.5m`, val: 3500000 }, { id: `${type}_rev_4m`, val: 4000000 }, { id: `${type}_rev_4.5m`, val: 4500000 },
      { id: `${type}_rev_5m`, val: 5000000 }, { id: `${type}_rev_5.5m`, val: 5500000 }, { id: `${type}_rev_6m`, val: 6000000 },
      { id: `${type}_rev_6.5m`, val: 6500000 }, { id: `${type}_rev_7m`, val: 7000000 }, { id: `${type}_rev_7.5m`, val: 7500000 },
      { id: `${type}_rev_8m`, val: 8000000 }, { id: `${type}_rev_8.5m`, val: 8500000 }, { id: `${type}_rev_9m`, val: 9000000 },
      { id: `${type}_rev_9.5m`, val: 9500000 }, { id: `${type}_rev_10m`, val: 10000000 }, { id: `${type}_rev_12m`, val: 12000000 },
      { id: `${type}_rev_15m`, val: 15000000 }, { id: `${type}_rev_18m`, val: 18000000 }, { id: `${type}_rev_20m`, val: 20000000 },
      { id: `${type}_rev_30m`, val: 30000000 }, { id: `${type}_rev_50m`, val: 50000000 }, { id: `${type}_zenith`, val: 100000000 }
    ];
    
    let cumulative = 0;
    const sortedHistory = [...typeHistory].sort((a,b) => a.month.localeCompare(b.month));
    sortedHistory.forEach(h => {
      cumulative += h.revenue;
      thresholds.forEach(t => {
        if (cumulative >= t.val && !acquired.some(a => a.id === t.id)) {
          const def = titleDefs.find(d => d.id === t.id);
          if (def) acquired.push({ ...def, acquiredAt: `${h.month}-01` });
        }
      });
    });

    // Continuity & History Checks
    let consecutiveRevenue = 0;
    let consecutiveGrowth = 0;
    let maxMonthRev = 0;
    let maxQTotal = 0;
    
    sortedHistory.forEach((h, i) => {
      if (h.revenue > 0) consecutiveRevenue++; else consecutiveRevenue = 0;
      if (i > 0 && h.revenue > sortedHistory[i-1].revenue) consecutiveGrowth++; else consecutiveGrowth = 0;

      const prefix = isMage ? 'mage_stream' : 'merchant_maint';
      if (consecutiveRevenue >= 3 && !acquired.some(a => a.id === `${prefix}_3m`)) acquired.push({ ...titleDefs.find(d => d.id === `${prefix}_3m`), acquiredAt: h.month });
      if (consecutiveRevenue >= 6 && !acquired.some(a => a.id === `${prefix}_6m`)) acquired.push({ ...titleDefs.find(d => d.id === `${prefix}_6m`), acquiredAt: h.month });
      if (consecutiveRevenue >= 12 && !acquired.some(a => a.id === `${prefix}_12m`)) acquired.push({ ...titleDefs.find(d => d.id === `${prefix}_12m`), acquiredAt: h.month });
      if (consecutiveRevenue >= 24 && !acquired.some(a => a.id === `${prefix}_24m`)) acquired.push({ ...titleDefs.find(d => d.id === `${prefix}_24m`), acquiredAt: h.month });
      if (consecutiveRevenue >= 36 && !acquired.some(a => a.id === `${prefix}_36m`)) acquired.push({ ...titleDefs.find(d => d.id === `${prefix}_36m`), acquiredAt: h.month });

      if (isMerchant) {
        if (consecutiveGrowth >= 3 && !acquired.some(a => a.id === 'merchant_up_3m')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_up_3m'), acquiredAt: h.month });
        if (consecutiveGrowth >= 6 && !acquired.some(a => a.id === 'merchant_up_6m')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_up_6m'), acquiredAt: h.month });
        if (consecutiveGrowth >= 12 && !acquired.some(a => a.id === 'merchant_up_12m')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_up_12m'), acquiredAt: h.month });

        // Gold Month
        if (h.revenue > maxMonthRev && maxMonthRev > 0) {
           if (!acquired.some(a => a.id === 'merchant_gold_month')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_gold_month'), acquiredAt: h.month });
        }
        if (h.revenue > maxMonthRev) maxMonthRev = h.revenue;

        // Growth 50%
        if (i > 0 && sortedHistory[i-1].revenue > 0 && h.revenue > sortedHistory[i-1].revenue * 1.5) {
           if (!acquired.some(a => a.id === 'merchant_growth_50')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_growth_50'), acquiredAt: h.month });
        }

        // Gold Quarter
        if (i >= 2) {
          const qTotal = h.revenue + sortedHistory[i-1].revenue + sortedHistory[i-2].revenue;
          if (qTotal > maxQTotal && maxQTotal > 0) {
             if (!acquired.some(a => a.id === 'merchant_gold_quarter')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_gold_quarter'), acquiredAt: h.month });
          }
          if (qTotal > maxQTotal) maxQTotal = qTotal;
        }
      }
    });

    // Year-on-year
    if (isMerchant) {
      const years: Record<string, number> = {};
      sortedHistory.forEach(h => {
        const y = h.month.split('-')[0];
        years[y] = (years[y] || 0) + h.revenue;
      });
      const yearList = Object.keys(years).sort();
      yearList.forEach((y, i) => {
        if (i > 0) {
          const prevYear = years[yearList[i-1]];
          const currYear = years[y];
          if (currYear > prevYear && !acquired.some(a => a.id === 'merchant_growth_year')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_growth_year'), acquiredAt: y });
          if (currYear > prevYear * 2 && !acquired.some(a => a.id === 'merchant_bubble_year')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_bubble_year'), acquiredAt: y });
        }
      });
    }

    // Case Specific
    let maxSingleFee = 0;
    const clientStats: Record<string, { count: number, revenue: number }> = {};

    classCases.forEach(c => {
      const finishDate = new Date(c.updatedAt);
      const finishFullDateStr = format(finishDate, 'yyyy-MM-dd');
      const diffMs = c.updatedAt - c.createdAt;
      const diffHrs = diffMs / (1000 * 60 * 60);
      const diffDays = diffHrs / 24;
      const hour = getHours(finishDate);
      
      const fee = (c.finance?.oneTimeFee || 0) + (c.finance?.spotFee || 0);
      if (fee > maxSingleFee) {
        const limitId = isMage ? 'mage_limit_break' : 'merchant_limit_break';
        if (maxSingleFee > 0 && !acquired.some(a => a.id === limitId)) acquired.push({ ...titleDefs.find(d => d.id === limitId), acquiredAt: finishFullDateStr });
        maxSingleFee = fee;
      }

      // Client aggregation
      const cName = c.contractEntity || c.clientName || 'Unknown';
      if (!clientStats[cName]) clientStats[cName] = { count: 0, revenue: 0 };
      clientStats[cName].count++;
      clientStats[cName].revenue += (c.finance?.oneTimeFee || 0) + (c.finance?.spotFee || 0) + (c.finance?.maintenanceFee || 0);

      if (isMage) {
        if (diffDays <= 7 && !acquired.some(a => a.id === 'mage_speed_7d')) acquired.push({ ...titleDefs.find(d => d.id === 'mage_speed_7d'), acquiredAt: finishFullDateStr });
        if (diffDays <= 3 && !acquired.some(a => a.id === 'mage_speed_3d')) acquired.push({ ...titleDefs.find(d => d.id === 'mage_speed_3d'), acquiredAt: finishFullDateStr });
        if (diffDays <= 1 && !acquired.some(a => a.id === 'mage_speed_24h')) acquired.push({ ...titleDefs.find(d => d.id === 'mage_speed_24h'), acquiredAt: finishFullDateStr });
        if (fee >= 500000 && !acquired.some(a => a.id === 'mage_power_500k')) acquired.push({ ...titleDefs.find(d => d.id === 'mage_power_500k'), acquiredAt: finishFullDateStr });
        if (fee >= 1000000 && !acquired.some(a => a.id === 'mage_power_1m')) acquired.push({ ...titleDefs.find(d => d.id === 'mage_power_1m'), acquiredAt: finishFullDateStr });
        if (fee >= 2000000 && !acquired.some(a => a.id === 'mage_power_2m')) acquired.push({ ...titleDefs.find(d => d.id === 'mage_power_2m'), acquiredAt: finishFullDateStr });
        if (hour >= 0 && hour < 5 && !acquired.some(a => a.id === 'mage_time_midnight')) acquired.push({ ...titleDefs.find(d => d.id === 'mage_time_midnight'), acquiredAt: finishFullDateStr });
        if (isWeekend(finishDate) && !acquired.some(a => a.id === 'mage_time_weekend')) acquired.push({ ...titleDefs.find(d => d.id === 'mage_time_weekend'), acquiredAt: finishFullDateStr });
      }

      if (isMerchant) {
        if (diffHrs <= 48 && !acquired.some(a => a.id === 'merchant_speed_48h')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_speed_48h'), acquiredAt: finishFullDateStr });
        if (diffHrs <= 24 && !acquired.some(a => a.id === 'merchant_speed_24h')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_speed_24h'), acquiredAt: finishFullDateStr });
        if (hour >= 0 && hour < 5 && !acquired.some(a => a.id === 'merchant_time_midnight')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_time_midnight'), acquiredAt: finishFullDateStr });
        if (isWeekend(finishDate) && !acquired.some(a => a.id === 'merchant_time_weekend')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_time_weekend'), acquiredAt: finishFullDateStr });

        // Branding Start
        if (!acquired.some(a => a.id === 'merchant_branding_start')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_branding_start'), acquiredAt: finishFullDateStr });

        // High Margin (Simple: fee > 100k)
        if (fee >= 100000 && !acquired.some(a => a.id === 'merchant_high_margin')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_high_margin'), acquiredAt: finishFullDateStr });

        // SNS & Regional
        if (c.isSnsLead && !acquired.some(a => a.id === 'merchant_sns_lead')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_sns_lead'), acquiredAt: finishFullDateStr });
        if (c.isOutOfPref && !acquired.some(a => a.id === 'merchant_out_of_pref')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_out_of_pref'), acquiredAt: finishFullDateStr });
      }
    });

    // Client based titles
    if (isMerchant) {
      Object.entries(clientStats).forEach(([name, stats]) => {
        if (stats.count >= 2 && !acquired.some(a => a.id === 'merchant_repeat_2')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_repeat_2'), acquiredAt: 'ACHIEVED' });
        if (stats.count >= 5 && !acquired.some(a => a.id === 'merchant_repeat_5')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_repeat_5'), acquiredAt: 'ACHIEVED' });
        if (stats.count >= 10 && !acquired.some(a => a.id === 'merchant_repeat_10')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_repeat_10'), acquiredAt: 'ACHIEVED' });
        if (stats.revenue >= 1000000 && !acquired.some(a => a.id === 'merchant_trust_1m')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_trust_1m'), acquiredAt: 'ACHIEVED' });
        if (stats.revenue >= 5000000 && !acquired.some(a => a.id === 'merchant_trust_5m')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_trust_5m'), acquiredAt: 'ACHIEVED' });
      });
      
      // Dominate
      const othersMax = Math.max(allTotals.mage, allTotals.hero);
      if (allTotals.merchant > othersMax && othersMax > 0) {
         if (!acquired.some(a => a.id === 'merchant_dominate')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_dominate'), acquiredAt: 'ACHIEVED' });
      }
      
      // Roadmap
      const tier = getTierFromRevenue(allTotals.merchant);
      if (tier >= 4 && !acquired.some(a => a.id === 'merchant_roadmap_4')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_roadmap_4'), acquiredAt: 'ACHIEVED' });
      if (tier >= 5 && !acquired.some(a => a.id === 'merchant_roadmap_5')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_roadmap_5'), acquiredAt: 'ACHIEVED' });
    }

    // Multi-cast / Action
    const casesByMonth: Record<string, CaseData[]> = {};
    classCases.forEach(c => {
      const m = format(new Date(c.updatedAt), 'yyyy-MM');
      if (!casesByMonth[m]) casesByMonth[m] = [];
      casesByMonth[m].push(c);
    });
    Object.entries(casesByMonth).forEach(([m, monthCases]) => {
      if (isMage) {
        const genres = new Set(monthCases.map(c => c.genre));
        if (genres.has('HP制作') && genres.has('SNS運用') && !acquired.some(a => a.id === 'mage_cast_double')) acquired.push({ ...titleDefs.find(d => d.id === 'mage_cast_double'), acquiredAt: m });
        if (monthCases.length >= 4 && !acquired.some(a => a.id === 'mage_cast_quad')) acquired.push({ ...titleDefs.find(d => d.id === 'mage_cast_quad'), acquiredAt: m });
      }
      if (isMerchant) {
        const c = monthCases.length;
        if (c >= 2 && !acquired.some(a => a.id === 'merchant_cast_2')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_cast_2'), acquiredAt: m });
        if (c >= 3 && !acquired.some(a => a.id === 'merchant_cast_3')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_cast_3'), acquiredAt: m });
        if (c >= 5 && !acquired.some(a => a.id === 'merchant_cast_5')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_cast_5'), acquiredAt: m });
        if (c >= 10 && !acquired.some(a => a.id === 'merchant_cast_10')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_cast_10'), acquiredAt: m });
        if (c >= 20 && !acquired.some(a => a.id === 'merchant_cast_20')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_cast_20'), acquiredAt: m });
        if (c >= 30 && !acquired.some(a => a.id === 'merchant_cast_30')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_cast_30'), acquiredAt: m });
      }
    });

    // Network / Hybrid
    const uniqueClients = new Set(classCases.map(c => c.contractEntity || c.clientName).filter(Boolean));
    if (isMage) {
      if (uniqueClients.size >= 10) acquired.push({ ...titleDefs.find(d => d.id === 'mage_network_10'), acquiredAt: 'ACHIEVED' });
    }
    if (isMerchant) {
      if (uniqueClients.size >= 5) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_network_5'), acquiredAt: 'ACHIEVED' });
      if (uniqueClients.size >= 10) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_network_10'), acquiredAt: 'ACHIEVED' });
      if (uniqueClients.size >= 20) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_network_20'), acquiredAt: 'ACHIEVED' });
      if (uniqueClients.size >= 50) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_network_50'), acquiredAt: 'ACHIEVED' });
      if (uniqueClients.size >= 100) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_network_100'), acquiredAt: 'ACHIEVED' });
      if (classCases.length >= 10 && !acquired.some(a => a.id === 'merchant_total_10')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_total_10'), acquiredAt: 'ACHIEVED' });
      if (classCases.length >= 50 && !acquired.some(a => a.id === 'merchant_total_50')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_total_50'), acquiredAt: 'ACHIEVED' });
      if (classCases.length >= 100 && !acquired.some(a => a.id === 'merchant_total_100')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_total_100'), acquiredAt: 'ACHIEVED' });
    }

    // Special
    if (isMerchant) {
      const sigRev = classCases.reduce((acc, c) => acc + (c.finance?.oneTimeFee || 0) + (c.finance?.spotFee || 0) + (c.finance?.maintenanceFee || 0), 0);
      if (sigRev >= 100000 && !acquired.some(a => a.id === 'merchant_sig_100k')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_sig_100k'), acquiredAt: 'ACHIEVED' });
      if (sigRev >= 1000000 && !acquired.some(a => a.id === 'merchant_sig_1m')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_sig_1m'), acquiredAt: 'ACHIEVED' });
      if (sigRev >= 5000000 && !acquired.some(a => a.id === 'merchant_sig_5m')) acquired.push({ ...titleDefs.find(d => d.id === 'merchant_sig_5m'), acquiredAt: 'ACHIEVED' });
    }

    if (acquired.length >= titleDefs.length * 0.5) {
      const hallId = isMage ? 'mage_hall_of_fame' : 'merchant_hall_of_fame';
      if (!acquired.some(a => a.id === hallId)) acquired.push({ ...titleDefs.find(d => d.id === hallId), acquiredAt: 'ACHIEVED' });
    }

    return acquired.sort((a, b) => (b.acquiredAt || '').localeCompare(a.acquiredAt || ''));
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-sans pb-20 max-w-[1600px] mx-auto pt-8">

      {/* 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {(['mage', 'merchant', 'hero'] as ClassType[]).map((type) => {
          const stats = data[type];
          const info = CLASS_INFO[type];
          
          return (
            <Card key={type} className="bg-card border-border overflow-hidden relative group">
              <div className={cn("absolute top-0 left-0 w-full h-1", info.bgClass)} />
              
              <CardContent className="p-8 space-y-8">
                {/* Avatar & Level */}
                <div className="flex gap-6 items-center relative">
                  <AvatarNode classType={type} tier={stats.tier} />
                  <div className="flex-1 min-w-0">
                    <span className={cn("text-xs font-black uppercase tracking-widest mb-1 block", info.colorClass)}>{info.subTitle}</span>
                    <h2 className="text-2xl font-black tracking-tight text-foreground leading-tight truncate mb-1">{stats.jobName}</h2>
                    <div className="text-[9px] font-bold text-muted-foreground opacity-80 mb-2">&quot;{stats.currentTitle}&quot;</div>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-black font-[family-name:var(--font-outfit)] leading-none">Lv.{stats.level}</span>
                      <span className="text-[10px] font-bold text-muted-foreground mb-1">({stats.tier}次職)</span>
                    </div>
                  </div>
                  {/* Latest Title */}
                  {stats.titles?.[0] && (
                    <div className="absolute top-0 right-0 flex flex-col items-end">
                      <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1">最近取得した称号</span>
                      <div className="bg-primary/10 border border-primary/20 px-2 py-1 rounded flex items-center gap-1">
                        <Medal className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-black text-primary truncate max-w-[80px]">{stats.titles[0].name}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">NEXT JOB (次の目標)</span>
                    <span className="text-xs font-black uppercase">{stats.toNext > 0 ? `あと ${stats.toNext} Lv で転職` : 'MAX TIER'}</span>
                  </div>
                  <Progress value={stats.progress} className={cn("h-2 bg-secondary", `[&>div]:${info.bgClass}`)} />
                  <div className="flex justify-between items-center text-[9px] font-bold text-muted-foreground uppercase tracking-tight">
                    <span>Lv.{stats.level}</span>
                    <span>次レベル(Lv.{stats.level+1})まで: <span className="text-foreground">¥{stats.revenueToNextExpLevel.toLocaleString()}</span></span>
                  </div>
                </div>

                {/* Stats List (Always Visible) */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                     詳細ステータス & 討伐記録
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div className="text-base font-bold">{stats.count} <span className="text-[10px]">件</span></div>
                    <div className="text-xl font-black tracking-tight">¥{stats.revenue.toLocaleString()}</div>
                  </div>

                  <div className="bg-secondary/30 rounded-md p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border/50">
                      <div>
                        <div className="text-[9px] font-bold text-muted-foreground uppercase">保守累計獲得額</div>
                        <div className="text-sm font-black">¥{stats.maintenanceTotal.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-muted-foreground uppercase">当月保守料</div>
                        <div className="text-sm font-black text-emerald-500">¥{stats.currentMonthMaint.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-muted-foreground uppercase">制作・スポット累計</div>
                        <div className="text-sm font-black">¥{stats.spotTotal.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-muted-foreground uppercase">次の転職まで</div>
                        <div className="text-sm font-black text-amber-500">¥{stats.revenueToNextLevel.toLocaleString()}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] font-bold text-muted-foreground uppercase mb-2 tracking-widest">討伐記録 (収益TOP5取引先)</div>
                      <div className="space-y-2">
                        {stats.topClients.map((client: any, i: number) => (
                          <div key={i} className="flex justify-between items-center bg-background/50 p-2 rounded border border-border/30">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-primary">#{i+1}</span>
                              <span className="text-xs font-bold truncate max-w-[120px]">{client.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] font-black">¥{client.revenue.toLocaleString()}</div>
                              <div className="text-[8px] font-bold text-muted-foreground">{client.count} 案件</div>
                            </div>
                          </div>
                        ))}
                        {stats.topClients.length === 0 && (
                          <div className="text-[10px] opacity-30 text-center py-2">記録なし</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">前回昇格年月</span>
                    <span className="text-sm font-bold text-primary">{stats.achieveMonth}</span>
                  </div>
                </div>

                {/* Chart */}
                <div className="pt-4 border-t border-border">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-4">ANNUAL REVENUE TREND (年間収益推移)</span>
                  <div className="h-[140px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={info.fillColor} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={info.fillColor} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 8, fontWeight: 'bold', fill: '#94a3b8'}} />
                        <Tooltip cursor={{stroke: info.fillColor, strokeWidth: 1}} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontSize: '10px', fontWeight: 'bold' }} formatter={(v: any) => `¥${v.toLocaleString()}`} />
                        <Area type="monotone" dataKey="value" stroke={info.fillColor} strokeWidth={2} fillOpacity={1} fill={`url(#gradient-${type})`}>
                          <LabelList dataKey="value" position="top" formatter={(v: any) => v > 0 ? `¥${(v/10000).toFixed(0)}万` : ''} style={{ fontSize: '7px', fontWeight: 'bold', fill: '#94a3b8' }} />
                        </Area>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Title History */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <History className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">ACQUIRED TITLES (取得済み称号)</span>
                    </div>
                    <div className={cn("text-[10px] font-black px-2 py-0.5 rounded border backdrop-blur-sm", info.bgClass.replace('bg-', 'bg-') + "/10", info.borderClass)}>
                      取得済み: {stats.titles?.length || 0} <span className="opacity-40 ml-1">/ {type === 'mage' ? MAGE_TITLE_DEFS.length : MERCHANT_TITLE_DEFS.length}</span>
                    </div>
                  </div>
                  
                  {stats.titles && stats.titles.length > 0 ? (
                    <div className="max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                      <div className="grid grid-cols-2 gap-2">
                        {stats.titles.map((title: any, idx: number) => {
                          const catStyles: Record<string, string> = {
                            '累計収益': 'bg-violet-500/10 border-violet-500/30 text-violet-200',
                            '保守・継続': 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200',
                            '月間アクション': 'bg-amber-500/10 border-amber-500/30 text-amber-200',
                            '単価・瞬発力': 'bg-rose-500/10 border-rose-500/30 text-rose-200',
                            'リピート・信頼': 'bg-blue-500/10 border-blue-500/30 text-blue-200',
                            '複合・時間': 'bg-slate-500/10 border-slate-500/30 text-slate-200'
                          };
                          const style = catStyles[title.category] || 'bg-secondary/20 border-border/50 text-foreground';
                          
                          return (
                            <div key={idx} className={cn(
                              "group p-2 rounded border backdrop-blur-md transition-all hover:brightness-125 relative overflow-hidden",
                              style,
                              idx === 0 && "ring-1 ring-primary/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                            )}>
                              {idx === 0 && (
                                <div className="absolute top-0 right-0 bg-primary/40 text-[6px] font-black px-1.5 py-0.5 rounded-bl uppercase animate-pulse">New</div>
                              )}
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-1">
                                  <Medal className={cn("w-2.5 h-2.5", idx === 0 ? "text-primary" : "opacity-40")} />
                                  <span className="text-[10px] font-black truncate">{title.name}</span>
                                </div>
                                <div className="text-[8px] font-bold leading-tight line-clamp-2 opacity-70 group-hover:opacity-100">
                                  {title.description}
                                </div>
                                <div className="mt-1 text-[7px] font-black opacity-30 uppercase tracking-tighter">
                                  {title.acquiredAt}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="h-[100px] flex flex-col items-center justify-center border border-dashed border-border rounded bg-secondary/5">
                      <Medal className="w-6 h-6 text-muted-foreground opacity-20 mb-2" />
                      <span className="text-[10px] font-bold text-muted-foreground opacity-40 uppercase tracking-widest">称号未取得</span>
                      <p className="text-[8px] text-muted-foreground opacity-30 mt-1">案件を完了して称号を獲得しましょう</p>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-border/30">
                    <button 
                      onClick={() => document.getElementById('roadmap-section')?.scrollIntoView({ behavior: 'smooth' })}
                      className="w-full py-2 bg-secondary/30 hover:bg-secondary/50 rounded text-[9px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                    >
                      <Star className="w-3 h-3 text-amber-500" />
                      全称号の取得条件を確認
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Class Roadmap & Titles */}
      <Card id="roadmap-section" className="bg-card border-border">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <Star className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-base font-black tracking-tight uppercase">CLASS ROADMAP & TITLES (クラスと称号)</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">転職条件と全称号取得条件の一覧</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-16">
            {TIER_THRESHOLDS.map((th) => (
              <div key={th.tier} className="bg-secondary/20 rounded-md p-4 border border-border relative overflow-hidden group">
                <div className="absolute top-2 right-2 text-3xl font-black opacity-5 group-hover:opacity-10 transition-opacity">T{th.tier}</div>
                <div className="flex flex-col gap-3 relative z-10">
                   <div className="w-12 h-12 bg-background rounded-md flex items-center justify-center border border-border shadow-sm">
                      <Image src={th.image} alt={th.title} width={32} height={32} className="object-contain" style={{ imageRendering: 'pixelated' }} />
                   </div>
                   <div>
                     <div className="text-[10px] font-black text-primary uppercase">Lv.{th.level}</div>
                     <div className="text-xs font-black truncate">{th.title}</div>
                     <div className="text-[9px] font-bold text-muted-foreground mt-1">
                       累計 ¥{(th.min/10000).toFixed(0)}万
                     </div>
                   </div>
                   <div className="space-y-1">
                     <div className="flex justify-between text-[8px] font-bold">
                       <span className="text-emerald-500 font-black">MAGE:</span>
                       <span className="text-foreground">{th.jobs.mage}</span>
                     </div>
                     <div className="flex justify-between text-[8px] font-bold">
                       <span className="text-amber-500 font-black">MERCHANT:</span>
                       <span className="text-foreground">{th.jobs.merchant}</span>
                     </div>
                     <div className="flex justify-between text-[8px] font-bold">
                       <span className="text-blue-500 font-black">HERO:</span>
                       <span className="text-foreground">{th.jobs.hero}</span>
                     </div>
                   </div>
                </div>
              </div>
            ))}
          </div>

          {/* 3-Column Title List Section */}
          <div className="pt-10 border-t border-border">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Mage Titles */}
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <Wand2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-emerald-500 uppercase">MAGE TITLES</h4>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">魔法使い系統 称号リスト</p>
                  </div>
                </div>
                
                <div className="space-y-8 max-h-[1200px] overflow-y-auto pr-4 custom-scrollbar">
                  {['累計収益', '保守・継続', '月間アクション', '単価・瞬発力', 'リピート・信頼', '複合・時間'].map(cat => (
                    <div key={cat} className="space-y-3">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm">
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{cat}</span>
                        </div>
                        <div className="flex-1 h-[1px] bg-border opacity-30" />
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {MAGE_TITLE_DEFS.filter(d => d.category === cat).map(def => (
                          <div key={def.id} className="group p-2 rounded bg-secondary/10 border border-border/30 hover:border-emerald-500/30 transition-all">
                            <div className="text-[10px] font-black text-foreground group-hover:text-emerald-500 transition-colors">{def.name}</div>
                            <div className="text-[8px] font-bold text-muted-foreground leading-tight mt-0.5">{def.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Merchant Titles */}
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                    <Coins className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-amber-500 uppercase">MERCHANT TITLES</h4>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">商人系統 称号リスト</p>
                  </div>
                </div>
                
                <div className="space-y-8 max-h-[1200px] overflow-y-auto pr-4 custom-scrollbar">
                  {['累計収益', '保守・継続', '月間アクション', '単価・瞬発力', 'リピート・信頼', '複合・時間'].map(cat => (
                    <div key={cat} className="space-y-3">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm">
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">{cat}</span>
                        </div>
                        <div className="flex-1 h-[1px] bg-border opacity-30" />
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {MERCHANT_TITLE_DEFS.filter(d => d.category === cat).map(def => (
                          <div key={def.id} className="group p-2 rounded bg-secondary/10 border border-border/30 hover:border-amber-500/30 transition-all">
                            <div className="text-[10px] font-black text-foreground group-hover:text-amber-500 transition-colors">{def.name}</div>
                            <div className="text-[8px] font-bold text-muted-foreground leading-tight mt-0.5">{def.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero Titles (Placeholder) */}
              <div className="space-y-8 opacity-40">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                    <Sword className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-blue-500 uppercase">HERO TITLES</h4>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase">勇者系統 称号リスト (準備中)</p>
                  </div>
                </div>
                <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg">
                  <span className="text-[10px] font-black uppercase tracking-widest">COMING SOON</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
