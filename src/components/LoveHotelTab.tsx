'use client';

import { useHearsStore, ProjectData, generateId } from '@/store/useHearsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Link as LinkIcon, Info, Bed, Utensils, CreditCard, MapPin, MessageSquare, X } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { cn } from '@/lib/utils';

interface Props {
  project: ProjectData;
}

const generateNextRoomNumber = (prevNumStr: string) => {
  let num = parseInt(prevNumStr, 10);
  if (isNaN(num)) return prevNumStr; 
  do {
    num++;
  } while (num % 10 === 4 || num % 10 === 9);
  return num.toString();
};

export function LoveHotelTab({ project }: Props) {
  const updateProject = useHearsStore(state => state.updateProject);
  const data = project.loveHotel;
  const basicInfo = project.basicInfo;

  const sellingPoints = data.sellingPoints || '';
  const memo = data.memo || '';

  const updateRootString = (key: 'sellingPoints' | 'memo', value: string) => updateProject(project.id, p => {
    p.loveHotel[key] = value;
  });

  // --- Handlers ---
  const addCommonEq = () => updateProject(project.id, (p) => { p.loveHotel.commonEquipments.push({ id: generateId(), name: '' }); });
  const removeCommonEq = (id: string) => updateProject(project.id, (p) => { p.loveHotel.commonEquipments = p.loveHotel.commonEquipments.filter(e => e.id !== id); });
  const updateCommonEq = (id: string, name: string) => updateProject(project.id, (p) => { const eq = p.loveHotel.commonEquipments.find(e => e.id === id); if (eq) eq.name = name; });

  const addRoom = () => updateProject(project.id, (p) => {
    const rooms = p.loveHotel.rooms;
    let nextRoomNumber = '201';
    if (rooms.length > 0) {
      const lastRoomNumber = rooms[rooms.length - 1].roomNumber;
      if (lastRoomNumber) nextRoomNumber = generateNextRoomNumber(lastRoomNumber);
    }
    rooms.push({ id: generateId(), roomNumber: nextRoomNumber, rank: '', specialEquipments: [] });
  });
  
  const removeRoom = (id: string) => updateProject(project.id, (p) => { p.loveHotel.rooms = p.loveHotel.rooms.filter(r => r.id !== id); });
  const updateRoom = (id: string, key: 'roomNumber'|'rank', value: string) => updateProject(project.id, (p) => {
    const room = p.loveHotel.rooms.find(r => r.id === id);
    if (room) room[key] = value;
  });

  const addSpecialEq = (roomId: string) => updateProject(project.id, (p) => {
    const room = p.loveHotel.rooms.find(r => r.id === roomId);
    if (room) room.specialEquipments.push({ id: generateId(), name: '' });
  });
  
  const updateSpecialEq = (roomId: string, eqId: string, name: string) => updateProject(project.id, (p) => {
    const room = p.loveHotel.rooms.find(r => r.id === roomId);
    if (room) {
      const eq = room.specialEquipments.find(e => e.id === eqId);
      if (eq) eq.name = name;
    }
  });

  const removeSpecialEq = (roomId: string, eqId: string) => updateProject(project.id, (p) => {
    const room = p.loveHotel.rooms.find(r => r.id === roomId);
    if (room) room.specialEquipments = room.specialEquipments.filter(e => e.id !== eqId);
  });

  const updatePricing = (key: 'rest' | 'stay' | 'freeTime' | 'shortTime' | 'extension' | 'image', value: string) => updateProject(project.id, p => {
    if (!p.loveHotel.pricing) p.loveHotel.pricing = { rest: '', stay: '', freeTime: '', shortTime: '', extension: '', image: null };
    if (key !== 'image') p.loveHotel.pricing[key] = value;
  });

  const pricing = data.pricing || { rest: '', stay: '', freeTime: '', shortTime: '', extension: '', image: null };
  const access = data.access || { entryEase: '', parkingHiding: '', highRoof: false };

  const handleFoodCheckbox = (key: 'welcomeService' | 'midnightMenu' | 'memberPrice') => updateProject(project.id, (p) => { p.loveHotel.food[key] = !p.loveHotel.food[key]; });

  const handleHotenaviToggle = (key: 'member'|'price'|'service'|'food', current: string) => {
    const nextVal = current === 'ホテナビで表示' ? 'HPで表示' : current === 'HPで表示' ? '両方' : 'ホテナビで表示';
    updateProject(project.id, p => { p.loveHotel.system.hotenavi.displays[key] = nextVal; });
  };

  const handleSystemRadio = (key: 'hasMemberSystem' | 'hasRental' | 'hasSale', value: boolean) => updateProject(project.id, (p) => { p.loveHotel.system[key] = value; });
  
  const addRental = () => updateProject(project.id, (p) => { p.loveHotel.system.rentals.push({ id: generateId(), name: '', price: '' }); });
  const removeRental = (id: string) => updateProject(project.id, (p) => { p.loveHotel.system.rentals = p.loveHotel.system.rentals.filter(r => r.id !== id); });
  const updateRental = (id: string, key: 'name'|'price', value: string) => updateProject(project.id, (p) => {
    const rental = p.loveHotel.system.rentals.find(r => r.id === id);
    if (rental) rental[key] = value;
  });

  const addSale = () => updateProject(project.id, (p) => { 
    if (!p.loveHotel.system.sales) p.loveHotel.system.sales = [];
    p.loveHotel.system.sales.push({ id: generateId(), name: '', price: '' }); 
  });
  const removeSale = (id: string) => updateProject(project.id, (p) => { p.loveHotel.system.sales = p.loveHotel.system.sales.filter(r => r.id !== id); });
  const updateSale = (id: string, key: 'name'|'price', value: string) => updateProject(project.id, (p) => {
    const sale = p.loveHotel.system.sales.find(r => r.id === id);
    if (sale) sale[key] = value;
  });

  const updateAccess = (key: 'entryEase'|'parkingHiding', value: string) => updateProject(project.id, p => { 
    if (!p.loveHotel.access) p.loveHotel.access = { entryEase: '', parkingHiding: '', highRoof: false };
    p.loveHotel.access[key] = value; 
  });
  const toggleHighRoof = () => updateProject(project.id, p => { 
    if (!p.loveHotel.access) p.loveHotel.access = { entryEase: '', parkingHiding: '', highRoof: false };
    p.loveHotel.access.highRoof = !p.loveHotel.access.highRoof; 
  });
  
  const updateAccessBasicInfo = (key: 'location'|'phone'|'parking', value: string) => updateProject(project.id, p => { p.basicInfo[key] = value; });

  const sectionCardStyle = "bg-white border-none paper-shadow-lg rounded-[2.5rem] overflow-hidden mb-12 font-[family-name:var(--font-noto)]";

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* --- ① 推しポイント --- */}
      <Card className={sectionCardStyle}>
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-xl font-bold italic tracking-tighter text-foreground flex items-center gap-3 uppercase font-[family-name:var(--font-outfit)]">
            <Info className="w-8 h-8 text-primary" /> ① ホテルの推しポイント
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <Textarea 
            value={sellingPoints} 
            onChange={(e) => updateRootString('sellingPoints', e.target.value)}
            placeholder="例: 客室露天風呂からの夜景、最新カラオケ機種導入、有名シェフ監修のフードメニュー など" 
            className="bg-secondary/30 min-h-[120px] border-none rounded-2xl p-6 font-bold text-lg leading-relaxed placeholder:opacity-30"
          />
        </CardContent>
      </Card>

      {/* --- ② 部屋詳細 --- */}
      <Card className={sectionCardStyle}>
        <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-xl font-bold italic tracking-tighter text-foreground flex items-center gap-3 uppercase font-[family-name:var(--font-outfit)]">
            <Bed className="w-8 h-8 text-primary" /> ② 客室・設備詳細
          </CardTitle>
          <Badge className="bg-primary/10 text-primary border-none font-bold py-1.5 px-4 rounded-xl">
            登録済み：計 {data.rooms.length} 室
          </Badge>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-10">
          
          <div className="bg-secondary/20 p-6 rounded-[2rem] border border-border/50">
            <div className="flex items-center justify-between mb-6">
              <Label className="text-sm font-bold text-foreground flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" /> 全室共通設備
              </Label>
              <Button size="sm" variant="ghost" onClick={addCommonEq} className="text-primary hover:bg-primary/5 font-bold">
                <Plus className="w-4 h-4 mr-1"/> 設備を追加
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.commonEquipments.map((eq) => (
                <div key={eq.id} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-border shadow-sm focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                  <Input value={eq.name} onChange={(e) => updateCommonEq(eq.id, e.target.value)} placeholder="設備名" className="flex-1 bg-transparent border-none focus-visible:ring-0 px-3 font-bold" />
                  <Button variant="ghost" size="icon" onClick={() => removeCommonEq(eq.id)} className="text-muted-foreground hover:text-destructive w-9 h-9 rounded-lg"><Trash2 className="w-4 h-4"/></Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-border/30">
              <Label className="text-base font-bold text-foreground">個別客室リスト管理</Label>
              <Button size="sm" onClick={addRoom} className="bg-primary text-white hover:bg-primary/90 font-bold px-6 rounded-xl shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4 mr-2"/> 次の部屋を追加
              </Button>
            </div>
            
            <div className="space-y-6">
              {data.rooms.map((room) => (
                <div key={room.id} className="flex flex-col lg:flex-row items-start gap-6 p-6 bg-white border border-border rounded-[2rem] paper-shadow-sm group hover:border-primary/20 transition-all">
                  <div className="flex gap-4 w-full lg:w-1/3">
                    <div className="flex-1">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block ml-1">部屋番号</Label>
                      <Input value={room.roomNumber} onChange={(e) => updateRoom(room.id, 'roomNumber', e.target.value)} placeholder="201" className="bg-secondary/30 border-none font-bold text-xl h-14 rounded-xl px-4 font-[family-name:var(--font-outfit)]" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block ml-1">ランク</Label>
                      <Input value={room.rank} onChange={(e) => updateRoom(room.id, 'rank', e.target.value)} placeholder="A" className="bg-secondary/30 border-none font-bold text-xl h-14 rounded-xl px-4" />
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">限定設備・特徴</Label>
                      <Button variant="ghost" size="sm" onClick={() => addSpecialEq(room.id)} className="h-7 px-3 text-[10px] font-bold text-primary hover:bg-primary/5 rounded-lg border border-primary/10">
                        <Plus className="w-3 h-3 mr-1"/> 設備追加
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[40px] p-2 rounded-xl bg-secondary/10 border border-dashed border-border/50">
                      {room.specialEquipments.length === 0 && (
                        <p className="text-[10px] text-muted-foreground/30 italic py-1 px-2 uppercase tracking-widest font-bold">No special equipments</p>
                      )}
                      {room.specialEquipments.map(eq => (
                        <div key={eq.id} className="flex items-center bg-white border border-border rounded-lg pl-3 pr-1 py-1 gap-2 shadow-sm group/item">
                          <Input value={eq.name} onChange={(e) => updateSpecialEq(room.id, eq.id, e.target.value)} placeholder="設備名" className="h-6 text-xs font-bold border-none bg-transparent p-0 w-24 focus-visible:ring-0" />
                          <button onClick={() => removeSpecialEq(room.id, eq.id)} className="text-muted-foreground hover:text-destructive p-1 rounded-md hover:bg-destructive/5 transition-all"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="w-full lg:w-auto lg:pt-6 flex justify-end shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => removeRoom(room.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 h-12 w-12 rounded-xl">
                      <Trash2 className="w-5 h-5"/>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-6 border-t border-border/50">
            <ImageUploader value={data.images.rooms} onChange={(val) => updateProject(project.id, p => { p.loveHotel.images.rooms = val; })} label="部屋詳細に関連する写真 (複数可)" />
          </div>
        </CardContent>
      </Card>

      {/* --- ③ 料金システム --- */}
      <Card className={sectionCardStyle}>
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-xl font-bold italic tracking-tighter text-foreground flex items-center gap-3 uppercase font-[family-name:var(--font-outfit)]">
            <CreditCard className="w-8 h-8 text-primary" /> ③ 料金・システム
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PriceField label="休憩" value={pricing.rest} onChange={(v: string) => updatePricing('rest', v)} placeholder="例: 2時間 3,980円〜" />
            <PriceField label="宿泊" value={pricing.stay} onChange={(v: string) => updatePricing('stay', v)} placeholder="例: 20:00〜翌12:00 7,980円〜" />
            <PriceField label="フリータイム" value={pricing.freeTime} onChange={(v: string) => updatePricing('freeTime', v)} placeholder="例: 最大12時間 4,980円〜" />
            <PriceField label="ショートタイム" value={pricing.shortTime} onChange={(v: string) => updatePricing('shortTime', v)} placeholder="例: 90分 2,980円〜" />
            <PriceField label="延長料金" value={pricing.extension} onChange={(v: string) => updatePricing('extension', v)} placeholder="例: 30分 1,000円" />
          </div>
          <div className="pt-6 border-t border-border/50">
            <ImageUploader value={pricing.image} onChange={(val) => updateProject(project.id, p => { p.loveHotel.pricing.image = val; })} label="料金表画像 (看板・案内等)" />
          </div>
        </CardContent>
      </Card>

      {/* --- ④ フードセクション --- */}
      <Card className={sectionCardStyle}>
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-xl font-bold italic tracking-tighter text-foreground flex items-center gap-3 uppercase font-[family-name:var(--font-outfit)]">
            <Utensils className="w-8 h-8 text-primary" /> ④ フード・飲食
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FoodCheckbox label="ウェルカムサービス" checked={data.food.welcomeService} onChange={() => handleFoodCheckbox('welcomeService')} />
            <FoodCheckbox label="深夜メニュー" checked={data.food.midnightMenu} onChange={() => handleFoodCheckbox('midnightMenu')} />
            <FoodCheckbox label="メンバー価格あり" checked={data.food.memberPrice} onChange={() => handleFoodCheckbox('memberPrice')} />
          </div>
          <div className="pt-6 border-t border-border/50">
            <ImageUploader value={data.food.menuImageBase64} onChange={(val) => updateProject(project.id, p => { p.loveHotel.food.menuImageBase64 = val; })} label="フードメニュー・料理写真" />
          </div>
        </CardContent>
      </Card>

      {/* --- ⑤ システム・サービス --- */}
      <Card className={sectionCardStyle}>
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-xl font-bold italic tracking-tighter text-foreground flex items-center gap-3 uppercase font-[family-name:var(--font-outfit)]">
            <LinkIcon className="w-8 h-8 text-primary" /> ⑤ 連携・サービス設定
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-12">
          
          <div className="bg-secondary/20 p-8 rounded-[2.5rem] border border-border/50">
            <Label className="text-base font-bold text-foreground flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-border">
                <LinkIcon className="w-5 h-5 text-primary"/>
              </div>
              ホテナビ連携設定
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {([
                { key: 'member', label: 'メンバー特典' },
                { key: 'price', label: '料金・客室情報' },
                { key: 'service', label: 'サービス・設備情報' },
                { key: 'food', label: 'フードメニュー' }
              ] as const).map(item => (
                <div key={item.key} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-border shadow-sm">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{item.label}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleHotenaviToggle(item.key, data.system.hotenavi.displays[item.key])}
                    className={cn(
                      "min-w-[120px] font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all",
                      data.system.hotenavi.displays[item.key] === 'ホテナビで表示' ? 'bg-red-50 text-red-600' : 
                      data.system.hotenavi.displays[item.key] === 'HPで表示' ? 'bg-blue-50 text-blue-600' : 
                      'bg-emerald-50 text-emerald-600'
                    )}
                  >
                    {data.system.hotenavi.displays[item.key]}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Member System */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <Label className="text-sm font-bold text-foreground">メンバーシステム</Label>
                <div className="flex bg-secondary/50 p-1 rounded-xl">
                  <button onClick={() => handleSystemRadio('hasMemberSystem', true)} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all", data.system.hasMemberSystem ? "bg-white text-primary paper-shadow" : "text-muted-foreground")}>有り</button>
                  <button onClick={() => handleSystemRadio('hasMemberSystem', false)} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all", !data.system.hasMemberSystem ? "bg-white text-primary paper-shadow" : "text-muted-foreground")}>無し</button>
                </div>
              </div>
              <Textarea 
                value={data.system.memberDetails}
                onChange={(e) => updateProject(project.id, p => { p.loveHotel.system.memberDetails = e.target.value })}
                disabled={!data.system.hasMemberSystem}
                placeholder="特典詳細 (ポイント・割引など)"
                className="bg-secondary/30 border-none rounded-2xl p-6 font-bold text-sm min-h-[120px] focus-visible:ring-primary/20 disabled:opacity-30 transition-all"
              />
            </div>

            {/* Rental Items */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <Label className="text-sm font-bold text-foreground">レンタル品管理</Label>
                <div className="flex bg-secondary/50 p-1 rounded-xl">
                  <button onClick={() => handleSystemRadio('hasRental', true)} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all", data.system.hasRental ? "bg-white text-primary paper-shadow" : "text-muted-foreground")}>有り</button>
                  <button onClick={() => handleSystemRadio('hasRental', false)} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all", !data.system.hasRental ? "bg-white text-primary paper-shadow" : "text-muted-foreground")}>無し</button>
                </div>
              </div>
              {data.system.hasRental && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {data.system.rentals.map((rental) => (
                      <div key={rental.id} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-border shadow-sm">
                        <Input value={rental.name} onChange={(e) => updateRental(rental.id, 'name', e.target.value)} placeholder="品名" className="flex-1 bg-transparent border-none focus-visible:ring-0 px-2 font-bold text-xs" />
                        <Input value={rental.price} onChange={(e) => updateRental(rental.id, 'price', e.target.value)} placeholder="金額" className="w-20 bg-secondary/20 border-none rounded-lg focus-visible:ring-0 px-2 text-[10px] font-bold text-center h-8" />
                        <Button variant="ghost" size="icon" onClick={() => removeRental(rental.id)} className="text-muted-foreground hover:text-destructive w-8 h-8 rounded-lg"><Trash2 className="w-4 h-4"/></Button>
                      </div>
                    ))}
                  </div>
                  <Button size="sm" variant="ghost" onClick={addRental} className="text-primary hover:bg-primary/5 font-bold"><Plus className="w-4 h-4 mr-1"/> 品目を追加</Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- ⑥ アクセス --- */}
      <Card className={sectionCardStyle}>
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-xl font-bold italic tracking-tighter text-foreground flex items-center gap-3 uppercase font-[family-name:var(--font-outfit)]">
            <MapPin className="w-8 h-8 text-primary" /> ⑥ アクセス・立地
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">車での入りやすさ</Label>
              <Input value={access.entryEase} onChange={(e) => updateAccess('entryEase', e.target.value)} placeholder="例: 大通りから直接、裏道から 等" className="h-14 bg-secondary/30 border-none rounded-2xl px-6 font-bold" />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">駐車場の隠蔽性</Label>
              <Input value={access.parkingHiding} onChange={(e) => updateAccess('parkingHiding', e.target.value)} placeholder="例: シャッター付き、暖簾あり 等" className="h-14 bg-secondary/30 border-none rounded-2xl px-6 font-bold" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Badge 
              onClick={toggleHighRoof}
              className={cn(
                "cursor-pointer px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest border-2 transition-all",
                access.highRoof ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white text-muted-foreground border-border hover:border-primary/20"
              )}
            >
              ハイルーフ車対応 {access.highRoof ? '✓' : '✗'}
            </Badge>
          </div>
          <div className="pt-6 border-t border-border/50">
            <ImageUploader value={data.images.access} onChange={(val) => updateProject(project.id, p => { p.loveHotel.images.access = val; })} label="外観・駐車場に関連する写真" />
          </div>
        </CardContent>
      </Card>

      {/* --- ⑦ 担当者メモ --- */}
      <Card className={sectionCardStyle}>
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-xl font-bold italic tracking-tighter text-foreground flex items-center gap-3 uppercase font-[family-name:var(--font-outfit)]">
            <MessageSquare className="w-8 h-8 text-primary" /> ⑦ 担当者メモ
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <Textarea 
            value={memo} 
            onChange={(e) => updateRootString('memo', e.target.value)}
            placeholder="その他の連絡事項、懸念点、要望など..." 
            className="bg-secondary/30 min-h-[150px] border-none rounded-[2rem] p-8 font-bold text-lg leading-relaxed placeholder:opacity-30"
          />
        </CardContent>
      </Card>

    </div>
  );
}

function PriceField({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-3">
      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-14 bg-secondary/30 border-none rounded-2xl px-6 font-bold text-[#2D3436]" />
    </div>
  );
}

function FoodCheckbox({ label, checked, onChange }: any) {
  return (
    <div 
      onClick={onChange}
      className={cn(
        "flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer group",
        checked ? "bg-primary/5 border-primary shadow-sm" : "bg-white border-border hover:border-primary/20"
      )}
    >
      <span className={cn("text-xs font-bold transition-colors", checked ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}>{label}</span>
      <div className={cn("w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all", checked ? "bg-primary border-primary" : "border-border")}>
        {checked && <Plus className="w-4 h-4 text-white rotate-45" />}
      </div>
    </div>
  );
}
