'use client';

import { useHearsStore, ProjectData, generateId } from '@/store/useHearsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import { ImageUploader } from './ImageUploader';

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

  // --- Rooms Section Handlers ---
  const addCommonEq = () => updateProject(project.id, (p) => { p.loveHotel.commonEquipments.push({ id: generateId(), name: '' }); });
  const removeCommonEq = (id: string) => updateProject(project.id, (p) => { p.loveHotel.commonEquipments = p.loveHotel.commonEquipments.filter(e => e.id !== id); });
  const updateCommonEq = (id: string, name: string) => updateProject(project.id, (p) => { const eq = p.loveHotel.commonEquipments.find(e => e.id === id); if (eq) eq.name = name; });

  const addRoom = () => updateProject(project.id, (p) => {
    const rooms = p.loveHotel.rooms;
    let nextRoomNumber = '201';
    if (rooms.length > 0) {
      const lastRoomNumber = rooms[rooms.length - 1].roomNumber;
      if (lastRoomNumber) {
        nextRoomNumber = generateNextRoomNumber(lastRoomNumber);
      }
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
    if (room) {
      room.specialEquipments = room.specialEquipments.filter(e => e.id !== eqId);
    }
  });

  // --- Pricing Handlers ---
  const updatePricing = (key: 'rest' | 'stay' | 'freeTime' | 'shortTime' | 'extension' | 'image', value: string) => updateProject(project.id, p => {
    if (!p.loveHotel.pricing) {
      p.loveHotel.pricing = { rest: '', stay: '', freeTime: '', shortTime: '', extension: '', image: null };
    }
    if (key !== 'image') {
      p.loveHotel.pricing[key] = value;
    }
  });

  const pricing = data.pricing || { rest: '', stay: '', freeTime: '', shortTime: '', extension: '', image: null };
  const access = data.access || { entryEase: '', parkingHiding: '', highRoof: false };

  // --- Food Section Handlers ---
  const handleFoodCheckbox = (key: 'welcomeService' | 'midnightMenu' | 'memberPrice') => updateProject(project.id, (p) => { p.loveHotel.food[key] = !p.loveHotel.food[key]; });

  // --- System Section Handlers ---
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

  // --- Access Section Handlers ---
  const updateAccess = (key: 'entryEase'|'parkingHiding', value: string) => updateProject(project.id, p => { 
    if (!p.loveHotel.access) {
      p.loveHotel.access = { entryEase: '', parkingHiding: '', highRoof: false };
    }
    p.loveHotel.access[key] = value; 
  });
  const toggleHighRoof = () => updateProject(project.id, p => { 
    if (!p.loveHotel.access) {
      p.loveHotel.access = { entryEase: '', parkingHiding: '', highRoof: false };
    }
    p.loveHotel.access.highRoof = !p.loveHotel.access.highRoof; 
  });
  
  const updateAccessBasicInfo = (key: 'location'|'phone'|'parking', value: string) => updateProject(project.id, p => { p.basicInfo[key] = value; });

  const cardStyle = "bg-card border-l-4 border-l-primary/60 border-y border-r border-border/50 shadow-lg mb-8";

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* --- ① 推しポイント --- */}
      <Card className={cardStyle}>
        <CardHeader className="bg-black/20 border-b border-border/30">
          <CardTitle className="text-xl text-primary font-bold">① ホテルの推しポイント</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <Textarea 
            value={sellingPoints} 
            onChange={(e) => updateRootString('sellingPoints', e.target.value)}
            placeholder="例: 客室露天風呂からの夜景、最新カラオケ機種導入、有名シェフ監修のフードメニュー など" 
            className="bg-black/50 min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* --- ② 部屋詳細 --- */}
      <Card className={cardStyle}>
        <CardHeader className="bg-black/20 border-b border-border/30 flex flex-row items-center justify-between">
          <CardTitle className="text-xl text-primary font-bold">② 部屋詳細</CardTitle>
          <div className="text-sm font-semibold bg-primary/10 text-primary px-4 py-1.5 rounded-full border border-primary/20">
            登録済み：計 {data.rooms.length} 室
          </div>
        </CardHeader>
        <CardContent className="pt-8 space-y-10">
          
          <div className="bg-[#0c0c0e] p-5 rounded-lg border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-lg font-bold text-white">全室共通設備</Label>
              <Button size="sm" variant="outline" onClick={addCommonEq} className="border-primary/50 text-primary hover:bg-primary/10">
                <Plus className="w-4 h-4 mr-1"/> 設備追加
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.commonEquipments.map((eq) => (
                <div key={eq.id} className="flex items-center gap-2 bg-black/40 p-2 rounded-md border border-border/50 focus-within:border-primary/50 transition-colors">
                  <Input value={eq.name} onChange={(e) => updateCommonEq(eq.id, e.target.value)} placeholder="設備名" className="flex-1 bg-transparent border-none focus-visible:ring-0 px-2" />
                  <Button variant="ghost" size="icon" onClick={() => removeCommonEq(eq.id)} className="text-muted-foreground hover:text-destructive w-8 h-8"><Trash2 className="w-4 h-4"/></Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/30">
              <Label className="text-lg font-bold text-white">部屋リスト管理</Label>
              <Button size="sm" onClick={addRoom} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
                <Plus className="w-4 h-4 mr-1"/> 次の部屋を追加
              </Button>
            </div>
            
            <div className="space-y-4">
              {data.rooms.map((room) => (
                <div key={room.id} className="flex flex-col md:flex-row items-start gap-4 p-5 bg-[#0c0c0e] border border-border/50 rounded-lg group hover:border-primary/30 transition-colors">
                  <div className="flex gap-4 w-full md:w-1/3">
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground mb-1.5 block">部屋番号</Label>
                      <Input value={room.roomNumber} onChange={(e) => updateRoom(room.id, 'roomNumber', e.target.value)} placeholder="例: 201" className="bg-black/50 font-bold text-lg" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground mb-1.5 block">ランク</Label>
                      <Input value={room.rank} onChange={(e) => updateRoom(room.id, 'rank', e.target.value)} placeholder="例: A" className="bg-black/50" />
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs text-muted-foreground">限定設備</Label>
                      <Button variant="ghost" size="sm" onClick={() => addSpecialEq(room.id)} className="h-6 px-2 text-xs text-primary hover:bg-primary/10">
                        <Plus className="w-3 h-3 mr-1"/> 設備追加
                      </Button>
                    </div>
                    {room.specialEquipments.length === 0 && (
                      <p className="text-sm text-muted-foreground/50 italic py-2">限定設備はありません</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {room.specialEquipments.map(eq => (
                        <div key={eq.id} className="flex items-center bg-black border border-primary/30 rounded px-2 py-1 gap-1">
                          <Input value={eq.name} onChange={(e) => updateSpecialEq(room.id, eq.id, e.target.value)} placeholder="設備名" className="h-6 text-sm border-none bg-transparent p-0 w-24 focus-visible:ring-0" />
                          <button onClick={() => removeSpecialEq(room.id, eq.id)} className="text-muted-foreground hover:text-destructive"><XIcon /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="w-full md:w-auto md:pt-6 flex justify-end">
                    <Button variant="ghost" size="sm" onClick={() => removeRoom(room.id)} className="text-destructive bg-destructive/10 hover:bg-destructive/20 md:bg-transparent md:hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4 mr-2 md:mr-0"/> <span className="md:hidden">削除</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <ImageUploader value={data.images.rooms} onChange={(val) => updateProject(project.id, p => { p.loveHotel.images.rooms = val; })} label="部屋詳細 関連画像アップロード" />
        </CardContent>
      </Card>

      {/* --- ③ 料金システム --- */}
      <Card className={cardStyle}>
        <CardHeader className="bg-black/20 border-b border-border/30">
          <CardTitle className="text-xl text-primary font-bold">③ 料金システム</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">休憩</Label>
              <Input value={pricing.rest} onChange={(e) => updatePricing('rest', e.target.value)} placeholder="例: 2時間 3,980円〜" className="bg-black/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-white">宿泊</Label>
              <Input value={pricing.stay} onChange={(e) => updatePricing('stay', e.target.value)} placeholder="例: 20:00〜翌12:00 7,980円〜" className="bg-black/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-white">フリータイム</Label>
              <Input value={pricing.freeTime} onChange={(e) => updatePricing('freeTime', e.target.value)} placeholder="例: 最大12時間 4,980円〜" className="bg-black/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-white">ショートタイム</Label>
              <Input value={pricing.shortTime} onChange={(e) => updatePricing('shortTime', e.target.value)} placeholder="例: 90分 2,980円〜" className="bg-black/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-white">延長料金</Label>
              <Input value={pricing.extension} onChange={(e) => updatePricing('extension', e.target.value)} placeholder="例: 30分 1,000円" className="bg-black/50" />
            </div>
          </div>
          <ImageUploader value={pricing.image} onChange={(val) => updateProject(project.id, p => { p.loveHotel.pricing.image = val; })} label="料金表画像アップロード" />
        </CardContent>
      </Card>


      {/* --- ④ フードセクション --- */}
      <Card className={cardStyle}>
        <CardHeader className="bg-black/20 border-b border-border/30">
          <CardTitle className="text-xl text-primary font-bold">④ フード・飲食</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex items-center space-x-3 p-4 border border-border/50 rounded-lg cursor-pointer hover:bg-white/5 hover:border-primary/50 transition-all bg-[#0c0c0e]">
              <input type="checkbox" checked={data.food.welcomeService} onChange={() => handleFoodCheckbox('welcomeService')} className="w-5 h-5 accent-primary" />
              <span className="font-medium text-white tracking-wide">ウェルカムサービス</span>
            </label>
            <label className="flex items-center space-x-3 p-4 border border-border/50 rounded-lg cursor-pointer hover:bg-white/5 hover:border-primary/50 transition-all bg-[#0c0c0e]">
              <input type="checkbox" checked={data.food.midnightMenu} onChange={() => handleFoodCheckbox('midnightMenu')} className="w-5 h-5 accent-primary" />
              <span className="font-medium text-white tracking-wide">深夜メニュー</span>
            </label>
            <label className="flex items-center space-x-3 p-4 border border-border/50 rounded-lg cursor-pointer hover:bg-white/5 hover:border-primary/50 transition-all bg-[#0c0c0e]">
              <input type="checkbox" checked={data.food.memberPrice} onChange={() => handleFoodCheckbox('memberPrice')} className="w-5 h-5 accent-primary" />
              <span className="font-medium text-white tracking-wide">メンバー価格あり</span>
            </label>
          </div>
          <ImageUploader value={data.food.menuImageBase64} onChange={(val) => updateProject(project.id, p => { p.loveHotel.food.menuImageBase64 = val; })} label="メニュー画像・フード写真" />
        </CardContent>
      </Card>


      {/* --- ⑤ システム・サービス --- */}
      <Card className={cardStyle}>
        <CardHeader className="bg-black/20 border-b border-border/30">
          <CardTitle className="text-xl text-primary font-bold">⑤ システム・サービス</CardTitle>
        </CardHeader>
        <CardContent className="pt-8 space-y-10">
          
          <div className="space-y-5 bg-[#0c0c0e] p-5 rounded-lg border border-border/50">
            <Label className="text-lg font-bold text-white flex items-center gap-2"><LinkIcon className="w-5 h-5 text-primary"/> ホテナビ連携</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {([
                { key: 'member', label: 'メンバー特典' },
                { key: 'price', label: '料金・客室情報' },
                { key: 'service', label: 'サービス・設備情報' },
                { key: 'food', label: 'フードメニュー' }
              ] as const).map(item => (
                <div key={item.key} className="flex items-center justify-between bg-black/40 p-3 rounded border border-border/30">
                  <span className="text-sm font-medium">{item.label}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleHotenaviToggle(item.key, data.system.hotenavi.displays[item.key])}
                    className={`w-32 border-primary/50 ${data.system.hotenavi.displays[item.key] === 'ホテナビで表示' ? 'text-[#ff4b4b]' : data.system.hotenavi.displays[item.key] === 'HPで表示' ? 'text-[#4169E1]' : 'text-primary'}`}
                  >
                    {data.system.hotenavi.displays[item.key]}
                  </Button>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <Label className="text-sm text-muted-foreground mb-2 block">逆連携（HPからホテナビへリンクさせる項目・URLなど）</Label>
              <Input 
                value={data.system.hotenavi.reverseLinks} 
                onChange={(e) => updateProject(project.id, p => { p.loveHotel.system.hotenavi.reverseLinks = e.target.value })}
                placeholder="例: 空室情報リンク -> https://..." 
                className="bg-black/50"
              />
            </div>
          </div>

          <div className={`space-y-4 p-5 border border-border/50 rounded-lg transition-all ${data.system.hasMemberSystem ? 'bg-[#0c0c0e]' : 'bg-black/20 opacity-70'}`}>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-lg font-bold text-white block">メンバーシステム</Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" checked={data.system.hasMemberSystem} onChange={() => handleSystemRadio('hasMemberSystem', true)} className="w-4 h-4 accent-primary" />
                  <span className="font-bold">有り</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" checked={!data.system.hasMemberSystem} onChange={() => handleSystemRadio('hasMemberSystem', false)} className="w-4 h-4 accent-primary" />
                  <span>無し</span>
                </label>
              </div>
            </div>
            <Textarea 
              value={data.system.memberDetails}
              onChange={(e) => updateProject(project.id, p => { p.loveHotel.system.memberDetails = e.target.value })}
              disabled={!data.system.hasMemberSystem}
              placeholder="メンバー特典の詳細（ポイント、割引率など）"
              className={`min-h-[100px] bg-black/50 ${!data.system.hasMemberSystem ? 'cursor-not-allowed border-dashed' : 'border-primary/30 focus-visible:ring-primary'}`}
            />
          </div>

          <div className={`space-y-4 p-5 border border-border/50 rounded-lg transition-all ${data.system.hasRental ? 'bg-[#0c0c0e]' : 'bg-black/20 opacity-70'}`}>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-lg font-bold text-white block">レンタル品</Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" checked={data.system.hasRental} onChange={() => handleSystemRadio('hasRental', true)} className="w-4 h-4 accent-primary" />
                  <span className="font-bold">有り</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" checked={!data.system.hasRental} onChange={() => handleSystemRadio('hasRental', false)} className="w-4 h-4 accent-primary" />
                  <span>無し</span>
                </label>
              </div>
            </div>
            
            {data.system.hasRental && (
              <div className="space-y-3 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.system.rentals.map((rental) => (
                    <div key={rental.id} className="flex items-center gap-1 bg-black/50 p-2 rounded border border-border/50 focus-within:border-primary/50">
                      <Input value={rental.name} onChange={(e) => updateRental(rental.id, 'name', e.target.value)} placeholder="品名" className="flex-1 bg-transparent border-none focus-visible:ring-0 px-2 text-sm" />
                      <Input value={rental.price} onChange={(e) => updateRental(rental.id, 'price', e.target.value)} placeholder="金額(無料等)" className="w-20 bg-transparent border-none border-l border-border/50 rounded-none focus-visible:ring-0 px-2 text-sm" />
                      <Button variant="ghost" size="icon" onClick={() => removeRental(rental.id)} className="text-muted-foreground hover:text-destructive w-6 h-6"><Trash2 className="w-3 h-3"/></Button>
                    </div>
                  ))}
                </div>
                <Button size="sm" variant="outline" onClick={addRental} className="mt-3 border-primary/50 text-primary hover:bg-primary/10"><Plus className="w-4 h-4 mr-1"/> 品目追加</Button>
              </div>
            )}
          </div>

          <div className={`space-y-4 p-5 border border-border/50 rounded-lg transition-all ${(data.system.hasSale ?? true) ? 'bg-[#0c0c0e]' : 'bg-black/20 opacity-70'}`}>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-lg font-bold text-white block">販売品</Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" checked={(data.system.hasSale ?? true)} onChange={() => handleSystemRadio('hasSale', true)} className="w-4 h-4 accent-primary" />
                  <span className="font-bold">有り</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" checked={!(data.system.hasSale ?? true)} onChange={() => handleSystemRadio('hasSale', false)} className="w-4 h-4 accent-primary" />
                  <span>無し</span>
                </label>
              </div>
            </div>
            
            {(data.system.hasSale ?? true) && (
              <div className="space-y-3 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(data.system.sales || []).map((sale) => (
                    <div key={sale.id} className="flex items-center gap-1 bg-black/50 p-2 rounded border border-border/50 focus-within:border-primary/50">
                      <Input value={sale.name} onChange={(e) => updateSale(sale.id, 'name', e.target.value)} placeholder="品名" className="flex-1 bg-transparent border-none focus-visible:ring-0 px-2 text-sm" />
                      <Input value={sale.price} onChange={(e) => updateSale(sale.id, 'price', e.target.value)} placeholder="金額(500円等)" className="w-20 bg-transparent border-none border-l border-border/50 rounded-none focus-visible:ring-0 px-2 text-sm" />
                      <Button variant="ghost" size="icon" onClick={() => removeSale(sale.id)} className="text-muted-foreground hover:text-destructive w-6 h-6"><Trash2 className="w-3 h-3"/></Button>
                    </div>
                  ))}
                </div>
                <Button size="sm" variant="outline" onClick={addSale} className="mt-3 border-primary/50 text-primary hover:bg-primary/10"><Plus className="w-4 h-4 mr-1"/> 販売品追加</Button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-lg font-bold text-white">クーポン情報</Label>
            <Textarea 
              value={data.system.couponInfo} 
              onChange={(e) => updateProject(project.id, p => { p.loveHotel.system.couponInfo = e.target.value })}
              placeholder="クーポンの種類、利用条件、配布媒体など" 
              className="bg-black/50"
            />
          </div>

          <ImageUploader value={data.images.system} onChange={(val) => updateProject(project.id, p => { p.loveHotel.images.system = val; })} label="システム・サービス 関連画像" />
        </CardContent>
      </Card>


      {/* --- ⑥ アクセス・立地 --- */}
      <Card className={cardStyle}>
        <CardHeader className="bg-black/20 border-b border-border/30">
          <CardTitle className="text-xl text-primary font-bold">⑥ アクセス・立地情報</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0c0c0e] p-5 rounded-lg border border-border/50">
            <div className="space-y-2 md:col-span-2">
              <Label className="text-white">所在地（住所）</Label>
              <Input 
                value={basicInfo.location} 
                onChange={(e) => updateAccessBasicInfo('location', e.target.value)}
                placeholder="東京都渋谷区..." 
                className="bg-black/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">電話番号</Label>
              <Input 
                value={basicInfo.phone} 
                onChange={(e) => updateAccessBasicInfo('phone', e.target.value)}
                placeholder="090-XXXX-XXXX" 
                className="bg-black/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">駐車場台数</Label>
              <Input 
                value={basicInfo.parking} 
                onChange={(e) => updateAccessBasicInfo('parking', e.target.value)}
                placeholder="30台 / なし" 
                className="bg-black/50"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-white">車での入りやすさ</Label>
              <Input 
                value={access.entryEase} 
                onChange={(e) => updateAccess('entryEase', e.target.value)}
                placeholder="例: 大通りから直接、裏道から 等" 
                className="bg-black/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">駐車場の隠蔽性</Label>
              <Input 
                value={access.parkingHiding} 
                onChange={(e) => updateAccess('parkingHiding', e.target.value)}
                placeholder="例: シャッター付き、暖簾あり 等" 
                className="bg-black/50"
              />
            </div>
          </div>
          <label className="flex items-center space-x-3 p-4 border border-border/50 rounded-lg cursor-pointer hover:bg-white/5 hover:border-primary/50 transition-all bg-[#0c0c0e] w-full md:w-auto md:inline-flex">
            <input type="checkbox" checked={access.highRoof} onChange={toggleHighRoof} className="w-5 h-5 accent-primary" />
            <span className="font-medium text-white tracking-wide">ハイルーフ車対応</span>
          </label>

          <ImageUploader value={data.images.access} onChange={(val) => updateProject(project.id, p => { p.loveHotel.images.access = val; })} label="外観・駐車場 関連画像" />
        </CardContent>
      </Card>


      {/* --- ⑦ 担当者メモ --- */}
      <Card className={cardStyle}>
        <CardHeader className="bg-black/20 border-b border-border/30">
          <CardTitle className="text-xl text-primary font-bold">⑦ 担当者メモ</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <Textarea 
            value={memo} 
            onChange={(e) => updateRootString('memo', e.target.value)}
            placeholder="その他の連絡事項、懸念点、要望など自由に記載してください" 
            className="bg-black/50 min-h-[150px]"
          />
        </CardContent>
      </Card>

    </div>
  );
}

// X icon
function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  );
}
