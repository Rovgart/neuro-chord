'use client';

import { Button } from '@heroui/react';
import { Link2, Upload } from 'lucide-react';
import { useState } from 'react';
import MaterialItem, { type MaterialDto, type MaterialType } from './Material';

/* =========================================================
   MOCK DATA
   ========================================================= */

const MOCK_MATERIALS: MaterialDto[] = [
  {
    id: '1',
    topic: 'Introduction to Music Theory',
    url: '#',
    type: 'File' as MaterialType,
    ownerId: 'owner-1',
    isPublic: true,
    folderId: 'folder-1',
    requiresSubscription: false,
    createdAt: '2026-05-01T10:00:00.000Z',
    updatedAt: '2026-05-01T10:00:00.000Z',
  },
  {
    id: '2',
    topic: 'Fast Picking Techniques',
    url: '#',
    type: 'Video' as MaterialType,
    ownerId: 'owner-1',
    isPublic: true,
    folderId: 'folder-1',
    requiresSubscription: true,
    createdAt: '2026-05-03T12:00:00.000Z',
    updatedAt: '2026-05-03T12:00:00.000Z',
  },
  {
    id: '3',
    topic: 'Principles of Counterpoint',
    url: '#',
    type: 'Link' as MaterialType,
    ownerId: 'owner-1',
    isPublic: false,
    folderId: 'folder-1',
    requiresSubscription: true,
    createdAt: '2026-05-05T15:30:00.000Z',
    updatedAt: '2026-05-05T15:30:00.000Z',
  },
  {
    id: '4',
    topic: 'Chord Diagrams Reference Sheet',
    url: '#',
    type: 'Image' as MaterialType,
    ownerId: 'owner-1',
    isPublic: true,
    folderId: 'folder-1',
    requiresSubscription: false,
    createdAt: '2026-05-07T09:15:00.000Z',
    updatedAt: '2026-05-07T09:15:00.000Z',
  },
];

/* =========================================================
   COMPONENT
   ========================================================= */

function MaterialsList() {
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());

  const toggleStar = (id: string) =>
    setStarredIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleOpen = (material: MaterialDto) => {
    if (material.url && material.url !== '#') {
      window.open(material.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="flex flex-col gap-8" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* ── HEADER ─────────────────────────────────────── */}
      <div className="flex justify-between items-end gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
            Learning Materials
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Manage files and resources for your courses.
          </p>
        </div>

        {/* Count pill */}
        <span
          className="shrink-0 px-3 py-1 rounded-full text-xs font-semibold"
          style={{
            background: 'var(--color-primary-subtle)',
            color: 'var(--color-primary)',
          }}
        >
          {MOCK_MATERIALS.length} items
        </span>
      </div>

      {/* ── DIVIDER ────────────────────────────────────── */}
      <div className="h-px w-full" style={{ background: 'var(--color-border-subtle)' }} />

      {/* ── GRID ───────────────────────────────────────── */}
      {MOCK_MATERIALS.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {MOCK_MATERIALS.map((material) => (
            <MaterialItem
              key={material.id}
              material={material}
              isStarred={starredIds.has(material.id)}
              onStar={toggleStar}
              onOpen={handleOpen}
            />
          ))}
        </div>
      ) : (
        /* ── EMPTY STATE ─────────────────────────────── */
        <div
          className="flex flex-col items-center justify-center gap-5 py-20 rounded-2xl text-center"
          style={{
            background: 'var(--color-surface)',
            border: '1px dashed var(--color-border)',
          }}
        >
          {/* Icon */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: 'var(--color-primary-subtle)',
              color: 'var(--color-primary)',
            }}
          >
            {/* FolderOpen musi być zaimportowane z lucide-react, jeśli go nie ma - dodaj w importach */}
            <Upload size={26} strokeWidth={1.5} />
          </div>

          {/* Copy */}
          <div className="flex flex-col gap-1.5 max-w-xs">
            <p className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
              No materials yet
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Start building your course by uploading a file, adding a link, or recording a video. Your students are
              waiting.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                /* open upload modal */
              }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors"
              style={{
                background: 'var(--button-bg)',
                color: 'var(--button-text)',
                borderRadius: 'var(--button-radius)',
                boxShadow: 'var(--button-shadow)',
              }}
            >
              <Upload size={15} strokeWidth={2.5} />
              Upload Material
            </Button>

            <Button
              onClick={() => {
                /* open add link modal */
              }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors"
              style={{
                background: 'var(--button-ghost-bg)',
                color: 'var(--button-ghost-text)',
                border: '1px solid var(--button-ghost-border)',
                borderRadius: 'var(--button-radius)',
              }}
            >
              <Link2 size={15} strokeWidth={2.5} />
              Add Link
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MaterialsList;
