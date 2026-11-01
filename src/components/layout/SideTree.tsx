'use client';

import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * RootWrapper が用意する #side-tree-slot（PCのみ表示）に、
 * 各ページがツリーの中身を差し込むための部品。
 */
export const SIDE_TREE_SLOT_ID = 'side-tree-slot';

export function SideTree({ title, children }: { title: string; children: React.ReactNode }) {
  const slot = useSyncExternalStore(
    () => () => {},
    () => document.getElementById(SIDE_TREE_SLOT_ID),
    () => null
  );

  if (!slot) return null;

  return createPortal(
    <>
      <div className="px-2 pb-1.5 text-[10px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
        {title}
      </div>
      <div className="flex flex-col gap-px overflow-y-auto custom-scrollbar">{children}</div>
    </>,
    slot
  );
}

interface TreeItemProps {
  label: React.ReactNode;
  depth?: number;
  glyph?: string;
  badge?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  href?: string;
}

export function TreeItem({ label, depth = 0, glyph, badge, active, onClick, href }: TreeItemProps) {
  const className = cn(
    'flex items-center gap-1.5 w-full text-left rounded-[5px] py-1.5 pr-2 text-xs transition-colors',
    depth ? 'font-medium' : 'font-bold',
    active ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary'
  );
  const style = { paddingLeft: 8 + depth * 16 };
  const inner = (
    <>
      <span className={cn('w-2.5 shrink-0 text-center', active ? 'text-inherit' : 'text-muted-foreground')}>
        {glyph}
      </span>
      <span className="flex-1 min-w-0 truncate">{label}</span>
      {badge !== undefined && <span className="text-[10px] opacity-70 shrink-0">{badge}</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className} style={style}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className} style={style}>
      {inner}
    </button>
  );
}
