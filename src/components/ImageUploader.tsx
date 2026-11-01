'use client';

import React, { useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { UploadCloud, X, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface Props {
  value: string | null;
  onChange: (base64: string | null) => void;
  label?: string;
}

export function ImageUploader({ value, onChange, label = "画像アップロード" }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: 'image/webp',
        initialQuality: 0.8
      };
      
      const compressedFile = await imageCompression(file, options);
      
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('hears_assets')
        .upload(filePath, compressedFile, {
          contentType: 'image/webp',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('hears_assets')
        .getPublicUrl(filePath);

      onChange(publicUrlData.publicUrl);
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('画像のアップロードに失敗しました。');
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="mt-3 border-t border-border/50 pt-3">
      <p className="text-xs font-bold text-muted-foreground mb-2">{label}</p>
      
      {value ? (
        <div className="relative inline-block border border-border rounded-md overflow-hidden bg-secondary group">
          <img src={value} alt="Uploaded" className="h-32 w-auto object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
          
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-md" onClick={() => setIsPreviewOpen(true)}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" className="h-8 w-8 rounded-md" onClick={() => onChange(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-border hover:border-primary/50 bg-input hover:bg-secondary transition-colors rounded-md p-4 flex flex-col items-center justify-center cursor-pointer text-center"
        >
          <UploadCloud className={`w-6 h-6 mb-1.5 ${isCompressing ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
          <p className="text-xs font-bold text-muted-foreground">
            {isCompressing ? '圧縮中...' : 'クリックして画像をアップロード'}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            (自動的にWebP形式に圧縮・最適化されます)
          </p>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {isPreviewOpen && value && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setIsPreviewOpen(false)}>
          <div className="relative max-w-5xl max-h-screen">
            <Button 
              variant="outline" 
              size="icon" 
              className="absolute -top-4 -right-4 rounded-md bg-background z-50"
              onClick={() => setIsPreviewOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <img src={value} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-md border border-border" />
          </div>
        </div>
      )}
    </div>
  );
}
