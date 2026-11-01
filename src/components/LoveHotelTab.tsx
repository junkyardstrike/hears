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

  const sectionCardStyle = "bg-card border border-border shadow-none rounded-md overflow-hidden font-sans py-3 gap-0 scroll-mt-3";

  return (
    <div className="space-y-3 animate-in fade-in duration-300 pb-4">
      
      {/* --- ① 推しポイント --- */}
      <Card id="sec-lh-1" className={sectionCardStyle}>
        <CardHeader className="px-4 pb-1">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2 uppercase">
            <Info className="w-4 h-4 text-primary" /> ① ホテルの推しポイント
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-2">
          <Textarea 
            value={sellingPoints} 
            onChange={(e) => updateRootString('sellingPoints', e.target.value)}
            placeholder="例: 客室露天風呂からの夜景、最新カラオケ機種導入、有名シェフ監修のフードメニュー など" 
            className="bg-input min-h-[96px] border border-border rounded-md p-3 font-medium text-sm leading-relaxed placeholder:opacity-60 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </CardContent>
      </Card>

      {/* --- ② 部屋詳細 --- */}
      <Card id="sec-lh-2" className={sectionCardStyle}>
        <CardHeader className="px-4 pb-1 flex flex-row items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2 uppercase">
            <Bed className="w-4 h-4 text-primary" /> ② 客室・設備詳細
          </CardTitle>
          <Badge className="bg-primary text-primary-foreground border-none font-bold py-1 px-3 rounded-md">
            登録済み：計 {data.rooms.length} 室
          </Badge>
        </CardHeader>
        <CardContent className="px-4 pt-2 space-y-4">
          
          <div className="bg-secondary/50 p-3 rounded-md border border-border">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-bold text-foreground flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full" /> 全室共通設備
              </Label>
              <Button size="sm" variant="ghost" onClick={addCommonEq} className="text-primary hover:bg-secondary font-bold border border-transparent hover:border-border rounded-md">
                <Plus className="w-4 h-4 mr-1"/> 設備を追加
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {data.commonEquipments.map((eq) => (
                <div key={eq.id} className="flex items-center gap-2 bg-card p-1 rounded-md border border-border focus-within:ring-1 focus-within:ring-primary transition-all">
                  <Input value={eq.name} onChange={(e) => updateCommonEq(eq.id, e.target.value)} placeholder="設備名" className="flex-1 bg-transparent border-none focus-visible:ring-0 px-3 font-medium h-8" />
                  <Button variant="ghost" size="icon" onClick={() => removeCommonEq(eq.id)} className="text-muted-foreground hover:text-destructive w-8 h-8 rounded-md"><Trash2 className="w-4 h-4"/></Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-border/50">
              <Label className="text-sm font-bold text-foreground">個別客室リスト管理</Label>
              <Button size="sm" onClick={addRoom} className="bg-primary text-primary-foreground hover:brightness-110 font-bold px-4 rounded-md shadow-none transition-all">
                <Plus className="w-4 h-4 mr-2"/> 次の部屋を追加
              </Button>
            </div>
            
            <div className="space-y-3">
              {data.rooms.map((room) => (
                <div key={room.id} className="flex flex-col lg:flex-row items-start gap-3 p-3 bg-card border border-border rounded-md group hover:border-primary/50 transition-all">
                  <div className="flex gap-3 w-full lg:w-1/3">
                    <div className="flex-1">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1 block ml-0.5">部屋番号</Label>
                      <Input value={room.roomNumber} onChange={(e) => updateRoom(room.id, 'roomNumber', e.target.value)} placeholder="201" className="bg-input border border-border font-bold text-base h-9 rounded-md px-3 focus-visible:ring-1 focus-visible:ring-primary" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1 block ml-0.5">ランク</Label>
                      <Input value={room.rank} onChange={(e) => updateRoom(room.id, 'rank', e.target.value)} placeholder="A" className="bg-input border border-border font-bold text-base h-9 rounded-md px-3 focus-visible:ring-1 focus-visible:ring-primary" />
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide ml-0.5">限定設備・特徴</Label>
                      <Button variant="ghost" size="sm" onClick={() => addSpecialEq(room.id)} className="h-7 px-3 text-[10px] font-bold text-primary hover:bg-secondary rounded-md border border-transparent hover:border-border">
                        <Plus className="w-3 h-3 mr-1"/> 設備追加
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 min-h-[36px] p-2 rounded-md bg-secondary/50 border border-border">
                      {room.specialEquipments.length === 0 && (
                        <p className="text-[10px] text-muted-foreground py-1 px-2 uppercase tracking-wide font-bold">No special equipments</p>
                      )}
                      {room.specialEquipments.map(eq => (
                        <div key={eq.id} className="flex items-center bg-card border border-border rounded-md pl-3 pr-1 py-1 gap-1 group/item">
                          <Input value={eq.name} onChange={(e) => updateSpecialEq(room.id, eq.id, e.target.value)} placeholder="設備名" className="h-6 text-xs font-medium border-none bg-transparent p-0 w-24 focus-visible:ring-0" />
                          <button onClick={() => removeSpecialEq(room.id, eq.id)} className="text-muted-foreground hover:text-destructive p-1 rounded-sm hover:bg-destructive/10 transition-all"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="w-full lg:w-auto lg:pt-5 flex justify-end shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => removeRoom(room.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 rounded-md">
                      <Trash2 className="w-4 h-4"/>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <ImageUploader value={data.images.rooms} onChange={(val) => updateProject(project.id, p => { p.loveHotel.images.rooms = val; })} label="部屋詳細に関連する写真 (複数可)" />
          </div>
        </CardContent>
      </Card>

      {/* --- ③ 料金システム --- */}
      <Card id="sec-lh-3" className={sectionCardStyle}>
        <CardHeader className="px-4 pb-1">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2 uppercase">
            <CreditCard className="w-4 h-4 text-primary" /> ③ 料金・システム
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <PriceField label="休憩" value={pricing.rest} onChange={(v: string) => updatePricing('rest', v)} placeholder="例: 2時間 3,980円〜" />
            <PriceField label="宿泊" value={pricing.stay} onChange={(v: string) => updatePricing('stay', v)} placeholder="例: 20:00〜翌12:00 7,980円〜" />
            <PriceField label="フリータイム" value={pricing.freeTime} onChange={(v: string) => updatePricing('freeTime', v)} placeholder="例: 最大12時間 4,980円〜" />
            <PriceField label="ショートタイム" value={pricing.shortTime} onChange={(v: string) => updatePricing('shortTime', v)} placeholder="例: 90分 2,980円〜" />
            <PriceField label="延長料金" value={pricing.extension} onChange={(v: string) => updatePricing('extension', v)} placeholder="例: 30分 1,000円" />
          </div>
          <div>
            <ImageUploader value={pricing.image} onChange={(val) => updateProject(project.id, p => { p.loveHotel.pricing.image = val; })} label="料金表画像 (看板・案内等)" />
          </div>
        </CardContent>
      </Card>

      {/* --- ④ フードセクション --- */}
      <Card id="sec-lh-4" className={sectionCardStyle}>
        <CardHeader className="px-4 pb-1">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2 uppercase">
            <Utensils className="w-4 h-4 text-primary" /> ④ フード・飲食
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <FoodCheckbox label="ウェルカムサービス" checked={data.food.welcomeService} onChange={() => handleFoodCheckbox('welcomeService')} />
            <FoodCheckbox label="深夜メニュー" checked={data.food.midnightMenu} onChange={() => handleFoodCheckbox('midnightMenu')} />
            <FoodCheckbox label="メンバー価格あり" checked={data.food.memberPrice} onChange={() => handleFoodCheckbox('memberPrice')} />
          </div>
          <div>
            <ImageUploader value={data.food.menuImageBase64} onChange={(val) => updateProject(project.id, p => { p.loveHotel.food.menuImageBase64 = val; })} label="フードメニュー・料理写真" />
          </div>
        </CardContent>
      </Card>

      {/* --- ⑤ システム・サービス --- */}
      <Card id="sec-lh-5" className={sectionCardStyle}>
        <CardHeader className="px-4 pb-1">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2 uppercase">
            <LinkIcon className="w-4 h-4 text-primary" /> ⑤ 連携・サービス設定
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-2 space-y-4">
          
          <div className="bg-secondary/50 p-3 rounded-md border border-border">
            <Label className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-card flex items-center justify-center border border-border">
                <LinkIcon className="w-3.5 h-3.5 text-primary"/>
              </div>
              ホテナビ連携設定
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {([
                { key: 'member', label: 'メンバー特典' },
                { key: 'price', label: '料金・客室情報' },
                { key: 'service', label: 'サービス・設備情報' },
                { key: 'food', label: 'フードメニュー' }
              ] as const).map(item => (
                <div key={item.key} className="flex items-center justify-between bg-card p-2 rounded-md border border-border">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{item.label}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleHotenaviToggle(item.key, data.system.hotenavi.displays[item.key])}
                    className={cn(
                      "min-w-[120px] font-bold text-[10px] uppercase tracking-wide rounded-sm transition-all",
                      data.system.hotenavi.displays[item.key] === 'ホテナビで表示' ? 'bg-red-600/10 text-red-700' : 
                      data.system.hotenavi.displays[item.key] === 'HPで表示' ? 'bg-blue-600/10 text-blue-700' : 
                      'bg-emerald-600/10 text-emerald-700'
                    )}
                  >
                    {data.system.hotenavi.displays[item.key]}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Member System */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-2">
                <Label className="text-sm font-bold text-foreground">メンバーシステム</Label>
                <div className="flex bg-secondary p-1 rounded-md">
                  <button onClick={() => handleSystemRadio('hasMemberSystem', true)} className={cn("px-3 py-1 rounded-sm text-[10px] font-bold uppercase transition-all", data.system.hasMemberSystem ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}>有り</button>
                  <button onClick={() => handleSystemRadio('hasMemberSystem', false)} className={cn("px-3 py-1 rounded-sm text-[10px] font-bold uppercase transition-all", !data.system.hasMemberSystem ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}>無し</button>
                </div>
              </div>
              <Textarea 
                value={data.system.memberDetails}
                onChange={(e) => updateProject(project.id, p => { p.loveHotel.system.memberDetails = e.target.value })}
                disabled={!data.system.hasMemberSystem}
                placeholder="特典詳細 (ポイント・割引など)"
                className="bg-input border border-border rounded-md p-3 font-medium text-sm min-h-[96px] focus-visible:ring-1 focus-visible:ring-primary disabled:opacity-50 transition-all"
              />
            </div>

            {/* Rental Items */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-2">
                <Label className="text-sm font-bold text-foreground">レンタル品管理</Label>
                <div className="flex bg-secondary p-1 rounded-md">
                  <button onClick={() => handleSystemRadio('hasRental', true)} className={cn("px-3 py-1 rounded-sm text-[10px] font-bold uppercase transition-all", data.system.hasRental ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}>有り</button>
                  <button onClick={() => handleSystemRadio('hasRental', false)} className={cn("px-3 py-1 rounded-sm text-[10px] font-bold uppercase transition-all", !data.system.hasRental ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}>無し</button>
                </div>
              </div>
              {data.system.hasRental && (
                <div className="space-y-2 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {data.system.rentals.map((rental) => (
                      <div key={rental.id} className="flex items-center gap-2 bg-card p-1 rounded-md border border-border">
                        <Input value={rental.name} onChange={(e) => updateRental(rental.id, 'name', e.target.value)} placeholder="品名" className="flex-1 bg-transparent border-none focus-visible:ring-0 px-2 font-medium text-xs h-8" />
                        <Input value={rental.price} onChange={(e) => updateRental(rental.id, 'price', e.target.value)} placeholder="金額" className="w-20 bg-input border border-border rounded-md focus-visible:ring-1 focus-visible:ring-primary px-2 text-[10px] font-medium text-center h-8" />
                        <Button variant="ghost" size="icon" onClick={() => removeRental(rental.id)} className="text-muted-foreground hover:text-destructive w-8 h-8 rounded-md"><Trash2 className="w-4 h-4"/></Button>
                      </div>
                    ))}
                  </div>
                  <Button size="sm" variant="ghost" onClick={addRental} className="text-primary hover:bg-secondary font-bold rounded-md border border-transparent hover:border-border"><Plus className="w-4 h-4 mr-1"/> 品目を追加</Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- ⑥ アクセス --- */}
      <Card id="sec-lh-6" className={sectionCardStyle}>
        <CardHeader className="px-4 pb-1">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2 uppercase">
            <MapPin className="w-4 h-4 text-primary" /> ⑥ アクセス・立地
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide ml-0.5">車での入りやすさ</Label>
              <Input value={access.entryEase} onChange={(e) => updateAccess('entryEase', e.target.value)} placeholder="例: 大通りから直接、裏道から 等" className="h-9 bg-input border border-border rounded-md px-3 font-medium focus-visible:ring-1 focus-visible:ring-primary" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide ml-0.5">駐車場の隠蔽性</Label>
              <Input value={access.parkingHiding} onChange={(e) => updateAccess('parkingHiding', e.target.value)} placeholder="例: シャッター付き、暖簾あり 等" className="h-9 bg-input border border-border rounded-md px-3 font-medium focus-visible:ring-1 focus-visible:ring-primary" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge 
              onClick={toggleHighRoof}
              className={cn(
                "cursor-pointer px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wide border transition-all",
                access.highRoof ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/50"
              )}
            >
              ハイルーフ車対応 {access.highRoof ? '✓' : '✗'}
            </Badge>
          </div>
          <div>
            <ImageUploader value={data.images.access} onChange={(val) => updateProject(project.id, p => { p.loveHotel.images.access = val; })} label="外観・駐車場に関連する写真" />
          </div>
        </CardContent>
      </Card>

      {/* --- ⑦ 担当者メモ --- */}
      <Card id="sec-lh-7" className={sectionCardStyle}>
        <CardHeader className="px-4 pb-1">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2 uppercase">
            <MessageSquare className="w-4 h-4 text-primary" /> ⑦ 担当者メモ
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-2">
          <Textarea 
            value={memo} 
            onChange={(e) => updateRootString('memo', e.target.value)}
            placeholder="その他の連絡事項、懸念点、要望など..." 
            className="bg-input min-h-[120px] border border-border rounded-md p-3 font-medium text-sm leading-relaxed placeholder:opacity-60 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </CardContent>
      </Card>

    </div>
  );
}

function PriceField({ label, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide ml-0.5">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-9 bg-input border border-border rounded-md px-3 font-medium text-foreground focus-visible:ring-1 focus-visible:ring-primary" />
    </div>
  );
}

function FoodCheckbox({ label, checked, onChange }: any) {
  return (
    <div 
      onClick={onChange}
      className={cn(
        "flex items-center justify-between p-3 rounded-md border transition-all cursor-pointer group",
        checked ? "bg-primary/10 border-primary" : "bg-card border-border hover:border-primary/50"
      )}
    >
      <span className={cn("text-xs font-bold transition-colors", checked ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}>{label}</span>
      <div className={cn("w-5 h-5 rounded border flex items-center justify-center transition-all", checked ? "bg-primary border-primary" : "border-border")}>
        {checked && <Plus className="w-3 h-3 text-primary-foreground rotate-45" />}
      </div>
    </div>
  );
}
