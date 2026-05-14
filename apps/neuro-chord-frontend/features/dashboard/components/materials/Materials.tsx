'use client';

import { useGetOwnedMaterialsQuery } from '@/services/api';
import { useAppDispatch } from '@/store';
import { openModal } from '@/store/slices/uiSlice';
import { Button } from '@heroui/react';
import { Link2, Plus, Upload } from 'lucide-react';
import { useState } from 'react';
import type { MaterialDto } from '../../types/materials';
import MaterialItem from './Material';

/* =========================================================
   MOCK DATA
   ========================================================= */

// const MOCK_MATERIALS: MaterialDto[] = [
//   {
//     id: '1',
//     topic: 'Introduction to Music Theory',
//     url: '#',
//     type: 'File' as MaterialType,
//     ownerId: 'owner-1',
//     isPublic: true,
//     folderId: 'folder-1',
//     requiresSubscription: false,
//     createdAt: '2026-05-01T10:00:00.000Z',
//     updatedAt: '2026-05-01T10:00:00.000Z',
//   },
//   {
//     id: '2',
//     topic: 'Fast Picking Techniques',
//     url: '#',
//     type: 'Video' as MaterialType,
//     ownerId: 'owner-1',
//     isPublic: true,
//     folderId: 'folder-1',
//     requiresSubscription: true,
//     createdAt: '2026-05-03T12:00:00.000Z',
//     updatedAt: '2026-05-03T12:00:00.000Z',
//   },
//   {
//     id: '3',
//     topic: 'Principles of Counterpoint',
//     url: '#',
//     type: 'Link' as MaterialType,
//     ownerId: 'owner-1',
//     isPublic: false,
//     folderId: 'folder-1',
//     requiresSubscription: true,
//     createdAt: '2026-05-05T15:30:00.000Z',
//     updatedAt: '2026-05-05T15:30:00.000Z',
//   },
//   {
//     id: '4',
//     topic: 'Chord Diagrams Reference Sheet',
//     url: '#',
//     type: 'Image' as MaterialType,
//     ownerId: 'owner-1',
//     isPublic: true,
//     folderId: 'folder-1',
//     requiresSubscription: false,
//     createdAt: '2026-05-07T09:15:00.000Z',
//     updatedAt: '2026-05-07T09:15:00.000Z',
//   },
// ];

/* =========================================================
   COMPONENT
   ========================================================= */

function MaterialsList() {
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());
  const { data: ownedMaterials, isLoading, isError } = useGetOwnedMaterialsQuery();
  const dispatch = useAppDispatch();
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
  const handleOpenAddModal = () => {
    // Wysyłasz akcję z typem modalu.
    // Data może być nullem, jeśli to nowy obiekt.
    dispatch(openModal({ type: 'CREATE_MATERIAL', data: null }));
  };
  const materials = ownedMaterials ?? [];

  /* ── LOADING ─────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{
            borderColor: 'var(--color-border)',
            borderTopColor: 'var(--color-primary)',
          }}
        />
      </div>
    );
  }

  /* ── ERROR ───────────────────────────────────────────── */
  if (isError) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 py-20 rounded-2xl text-center"
        style={{
          background: 'var(--color-danger-subtle)',
          border: '1px solid var(--color-danger)',
        }}
      >
        <p className="text-sm font-semibold" style={{ color: 'var(--color-danger)' }}>
          Failed to load materials
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Please refresh the page or try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* ── HEADER ───────────────────────────────────────── */}
      {/* ── HEADER ───────────────────────────────────────── */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
            Learning Materials
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Manage files and resources for your courses.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              background: 'var(--color-primary-subtle)',
              color: 'var(--color-primary)',
            }}
          >
            {materials.length} items
          </span>

          <Button
            onPress={handleOpenAddModal}
            className="flex items-center gap-2 h-9 px-4 text-sm font-semibold transition-colors"
            style={{
              background: 'var(--button-bg)',
              color: 'var(--button-text)',
              borderRadius: 'var(--button-radius)',
              boxShadow: 'var(--button-shadow)',
            }}
          >
            <Plus size={15} strokeWidth={2.5} />
            Add Material
          </Button>
        </div>
      </div>

      {/* ── DIVIDER ──────────────────────────────────────── */}
      <div className="h-px w-full" style={{ background: 'var(--color-border-subtle)' }} />

      {/* ── GRID ─────────────────────────────────────────── */}
      {materials.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {materials.map((material) => (
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
        /* ── EMPTY STATE ─────────────────────────────────── */
        <div
          className="flex flex-col items-center justify-center gap-5 py-20 rounded-2xl text-center"
          style={{
            background: 'var(--color-surface)',
            border: '1px dashed var(--color-border)',
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{
              background: 'var(--color-primary-subtle)',
              color: 'var(--color-primary)',
            }}
          >
            <Upload size={26} strokeWidth={1.5} />
          </div>

          <div className="flex flex-col gap-1.5 max-w-xs">
            <p className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>
              No materials yet
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
              Start building your course by uploading a file, adding a link, or recording a video. Your students are
              waiting.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onPress={() => {
                handleOpenAddModal();
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
              onPress={() => {
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
