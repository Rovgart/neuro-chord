'use client';

import { Button } from '@heroui/react';
import { FileText, Globe, Image, Link, Lock, MoreHorizontal, Star, Video } from 'lucide-react';
import { useState } from 'react';

export type MaterialType = 'File' | 'Video' | 'Link' | 'Image';

export interface MaterialDto {
  id: string;
  topic: string;
  url: string;
  type: MaterialType;
  ownerId: string;
  isPublic: boolean;
  folderId: string;
  requiresSubscription: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MaterialItemProps {
  material: MaterialDto;
  onOpen?: (material: MaterialDto) => void;
  onStar?: (id: string) => void;
  isStarred?: boolean;
}

const TYPE_CONFIG: Record<
  MaterialType,
  {
    icon: React.ElementType;
    label: string;
    accentVar: string;
    bgVar: string;
  }
> = {
  File: { icon: FileText, label: 'File', accentVar: 'var(--color-primary)', bgVar: 'var(--color-primary-subtle)' },
  Video: {
    icon: Video,
    label: 'Video',
    accentVar: 'var(--teal-500)',
    bgVar: 'oklch(from var(--teal-500) l c h / 0.1)',
  },
  Link: { icon: Link, label: 'Link', accentVar: 'var(--gold-500)', bgVar: 'oklch(from var(--gold-400) l c h / 0.12)' },
  Image: {
    icon: Image,
    label: 'Image',
    accentVar: 'var(--amber-500)',
    bgVar: 'oklch(from var(--amber-400) l c h / 0.12)',
  },
};

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));

export default function MaterialItem({ material, onOpen, onStar, isStarred = false }: MaterialItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { icon: Icon, label, accentVar, bgVar } = TYPE_CONFIG[material.type] ?? TYPE_CONFIG.File;
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen?.(material);
    }
  };
  return (
    <article
      onKeyDown={handleKeyDown}
      onClick={() => onOpen?.(material)}
      className="group relative flex items-start gap-4 cursor-pointer"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        boxShadow: 'var(--shadow-sm)',
        transition:
          'box-shadow var(--transition-fast), border-color var(--transition-fast), transform var(--transition-fast)',
        fontFamily: 'var(--font-sans)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-strong)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)';
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border)';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
    >
      <div
        className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl mt-0.5"
        style={{ background: bgVar, color: accentVar }}
      >
        <Icon size={18} strokeWidth={2} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold leading-snug truncate" style={{ color: 'var(--color-text)' }}>
            {material.topic}
          </p>

          {/** biome-ignore lint/a11y/noStaticElementInteractions: <explanation> */}
          <div
            role="presentation"
            className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <Button
              onKeyDown={handleKeyDown}
              aria-label={isStarred ? 'Unstar' : 'Star'}
              onClick={() => onStar?.(material.id)}
              className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
              style={{
                background: isStarred ? 'oklch(from var(--gold-400) l c h / 0.15)' : 'transparent',
                color: isStarred ? 'var(--gold-400)' : 'var(--color-text-muted)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'oklch(from var(--gold-400) l c h / 0.15)')}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = isStarred
                  ? 'oklch(from var(--gold-400) l c h / 0.15)'
                  : 'transparent')
              }
            >
              <Star size={14} fill={isStarred ? 'currentColor' : 'none'} />
            </Button>

            <div className="relative">
              <Button
                aria-label="More options"
                onClick={() => setMenuOpen((p) => !p)}
                className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-hover-overlay)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <MoreHorizontal size={14} />
              </Button>

              {menuOpen && (
                <div
                  className="absolute right-0 top-8 z-50 flex flex-col min-w-[140px] py-1 rounded-xl"
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                >
                  {[
                    { label: 'Open', action: () => onOpen?.(material) },
                    { label: 'Copy link', action: () => navigator.clipboard.writeText(material.url) },
                    { label: 'Star', action: () => onStar?.(material.id) },
                  ].map((item) => (
                    <Button
                      key={item.label}
                      onClick={() => {
                        item.action();
                        setMenuOpen(false);
                      }}
                      className="px-3 py-2 text-xs text-left transition-colors"
                      style={{ color: 'var(--color-text)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-elevated)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type badge */}
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
            style={{ background: bgVar, color: accentVar }}
          >
            <Icon size={10} strokeWidth={2.5} />
            {label}
          </span>

          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
            style={{
              background: material.isPublic
                ? 'oklch(from var(--teal-500) l c h / 0.1)'
                : 'var(--color-surface-elevated)',
              color: material.isPublic ? 'var(--teal-600)' : 'var(--color-text-muted)',
            }}
          >
            <Globe size={10} strokeWidth={2.5} />
            {material.isPublic ? 'Public' : 'Private'}
          </span>

          {/* Subscription badge */}
          {material.requiresSubscription && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
              style={{
                background: 'oklch(from var(--gold-400) l c h / 0.12)',
                color: 'var(--gold-500)',
              }}
            >
              <Lock size={10} strokeWidth={2.5} />
              Premium
            </span>
          )}
        </div>

        {/* Date */}
        <p className="text-[11px]" style={{ color: 'var(--color-text-placeholder)' }}>
          Updated {formatDate(material.updatedAt)}
        </p>
      </div>

      {/* ── LEFT ACCENT BAR (visible on hover) ─────────── */}
      <div
        className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: accentVar }}
      />
    </article>
  );
}
