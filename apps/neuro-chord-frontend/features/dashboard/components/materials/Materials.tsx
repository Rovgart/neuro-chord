'use client';

import { useGetOwnedMaterialsQuery } from '@/services/api';
import { useAppDispatch } from '@/store';
import { openModal } from '@/store/slices/uiSlice';
import { Button } from '@heroui/react';
import { Link2, Plus, Upload } from 'lucide-react';
import { useState } from 'react';
import type { MaterialDto, MaterialType } from '../../types/materials';
import MaterialItem from './Material';

const FILTER_OPTIONS = ['All', 'File', 'Video', 'Link', 'Image'] as const;
const TYPE_FILTERS = ['All', 'File', 'Video', 'Link', 'Image'] as const;
const ACCESS_FILTERS = ['All', 'Public', 'Private'] as const;

type TypeFilter = (typeof TYPE_FILTERS)[number];
type AccessFilter = (typeof ACCESS_FILTERS)[number];
type FilterOption = (typeof FILTER_OPTIONS)[number];

function MaterialsList() {
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All');
  const [accessFilter, setAccessFilter] = useState<AccessFilter>('All');
  const { data: ownedMaterials, isLoading, isError } = useGetOwnedMaterialsQuery();
  const dispatch = useAppDispatch();

  const materials = ownedMaterials ?? [];

  const filtered = materials
    .filter((m) => typeFilter === 'All' || m.type === (typeFilter as MaterialType))
    .filter((m) => accessFilter === 'All' || m.isPublic === (accessFilter === 'Public'));

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
    dispatch(openModal({ type: 'CREATE_MATERIAL', data: null }));
  };

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
          {/* Count shows filtered results */}
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              background: 'var(--color-primary-subtle)',
              color: 'var(--color-primary)',
            }}
          >
            {filtered.length} / {materials.length} items
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

      {/* ── FILTERS ──────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        {/* Type */}
        <div className="flex items-center gap-2">
          {TYPE_FILTERS.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTypeFilter(type)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: typeFilter === type ? 'var(--color-primary-subtle)' : 'transparent',
                color: typeFilter === type ? 'var(--color-primary)' : 'var(--color-text-muted)',
                border: typeFilter === type ? '1px solid var(--color-border)' : '1px solid transparent',
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Visibility */}
        <div className="flex items-center gap-2">
          {ACCESS_FILTERS.map((access) => (
            <button
              key={access}
              type="button"
              onClick={() => setAccessFilter(access)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: accessFilter === access ? 'oklch(from var(--teal-500) l c h / 0.1)' : 'transparent',
                color: accessFilter === access ? 'var(--teal-600)' : 'var(--color-text-muted)',
                border: accessFilter === access ? '1px solid var(--teal-500)' : '1px solid transparent',
              }}
            >
              {access}
            </button>
          ))}
        </div>
      </div>

      {/* ── DIVIDER ──────────────────────────────────────── */}
      <div className="h-px w-full" style={{ background: 'var(--color-border-subtle)' }} />

      {/* ── GRID ─────────────────────────────────────────── */}
      {materials.length > 0 ? (
        filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((material) => (
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
          /* ── NO FILTER RESULTS ───────────────────────── */
          <div
            className="flex flex-col items-center justify-center gap-3 py-16 rounded-2xl text-center"
            style={{
              background: 'var(--color-surface)',
              border: '1px dashed var(--color-border)',
            }}
          >
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
              No {activeFilter} materials
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Try a different filter or add a new material.
            </p>
            <button
              type="button"
              onClick={() => setActiveFilter('All')}
              className="text-xs font-semibold underline underline-offset-2"
              style={{ color: 'var(--color-primary)' }}
            >
              Clear filter
            </button>
          </div>
        )
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
              onPress={handleOpenAddModal}
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
              onPress={handleOpenAddModal}
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
