'use client';

import { type MaterialFormData, materialSchema } from '@/schemas/material';
import { useCreateMaterialMutation } from '@/services/api';
import { useAppDispatch, useAppSelector } from '@/store/index';
import { closeModal } from '@/store/slices/uiSlice';
import { Button, Input, Modal, Switch, Tabs } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileUp, Globe, Link as LinkIcon, Rocket } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { MaterialType } from '../../types/materials';

export default function CreateMaterialModal() {
  const dispatch = useAppDispatch();
  const { isOpen } = useAppSelector((state) => state.ui.modal);
  const [file, setFile] = useState<File | null>(null);
  const [createMaterial, { isLoading }] = useCreateMaterialMutation();

  const { register, handleSubmit, control, setValue, watch, reset } = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      type: 'File',
      topic: '',
      url: '',
      isPublic: true,
    },
  });

  const selectedType = watch('type');

  const handleClose = () => {
    reset();
    setFile(null);
    dispatch(closeModal());
  };

  const onSubmit = async (data: MaterialFormData) => {
    try {
      const formData = new FormData();

      // Mapowanie pól zgodnie ze schematem backendu
      formData.append('Topic', data.topic);
      formData.append('Type', data.type);
      formData.append('IsPublic', String(data.isPublic));

      // Jeśli masz FolderId (np. z parametrów URL lub stanu)
      // formData.append('FolderId', folderId);

      if (data.type === 'Link' && data.url) {
        formData.append('Url', data.url);
      }

      if (data.type === 'File' && file) {
        // 'File' to klucz, którego oczekuje backend dla binarnego strumienia
        formData.append('File', file);
      }

      // Wywołanie mutacji z FormData
      await createMaterial(formData).unwrap();

      handleClose();
    } catch (err) {
      console.error('Błąd przesyłania:', err);
    }
  };

  return (
    <Modal isOpen={isOpen}>
      <Modal.Backdrop className="bg-[var(--modal-overlay)]">
        <Modal.Container>
          <Modal.Dialog
            className="sm:max-w-[480px] bg-[var(--modal-bg)] border border-[var(--color-border-subtle)] outline-none"
            style={{ borderRadius: 'var(--modal-radius)', boxShadow: 'var(--modal-shadow)' }}
          >
            <Modal.Header className="flex flex-col gap-1 p-6">
              <Modal.Icon className="bg-[var(--color-primary-subtle)] text-[var(--color-primary)] mb-2">
                <Rocket className="size-5" />
              </Modal.Icon>
              <Modal.Heading className="text-[var(--color-text)] font-[var(--font-bold)] text-xl">
                Add new material
              </Modal.Heading>
              <p className="text-[var(--text-xs)] text-[var(--color-text-muted)]">
                Share teaching materials with your students.
              </p>
            </Modal.Header>

            <Modal.Body className="gap-6 px-6 py-2">
              {/* Tabs — Controller wires selectedKey to RHF `type` field */}
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Tabs selectedKey={field.value} onSelectionChange={(key) => field.onChange(key as MaterialType)}>
                    <Tabs.ListContainer className="bg-[var(--color-surface-elevated)] rounded-lg p-1">
                      <Tabs.List aria-label="Material type" className="flex w-full">
                        <Tabs.Tab
                          id="File"
                          className="flex-1 flex justify-center items-center gap-2 py-2 text-sm data-[selected=true]:text-white transition-colors relative"
                        >
                          <FileUp size={16} /> File
                          <Tabs.Indicator className="bg-[var(--color-primary)] rounded-md" />
                        </Tabs.Tab>
                        <Tabs.Tab
                          id="Link"
                          className="flex-1 flex justify-center items-center gap-2 py-2 text-sm data-[selected=true]:text-white transition-colors relative"
                        >
                          <LinkIcon size={16} /> Link
                          <Tabs.Indicator className="bg-[var(--color-primary)] rounded-md" />
                        </Tabs.Tab>
                      </Tabs.List>
                    </Tabs.ListContainer>
                  </Tabs>
                )}
              />

              <div className="mt-6 flex flex-col gap-4">
                {/* Topic */}
                <Input placeholder="Introduction to Music Theory" {...register('topic')} className="w-full" />

                {/* File upload or URL — driven by watched `type` */}
                {selectedType === 'File' ? (
                  <div
                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-all hover:bg-[var(--color-surface-elevated)]"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0] || null;
                        setFile(selectedFile); // To zostawiamy dla Twojego podglądu w UI

                        // KLUCZOWY KROK: Przekazanie pliku do walidatora
                        setValue('file', selectedFile as any, { shouldValidate: true });
                      }}
                    />
                    <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer w-full">
                      <FileUp className="mb-2 text-[var(--color-primary)]" size={28} />
                      <span className="text-sm font-medium text-[var(--color-text)] text-center">
                        {file ? file.name : 'Click to upload a file'}
                      </span>
                    </label>
                  </div>
                ) : (
                  <Input placeholder="https://..." {...register('url')} />
                )}

                {/* Toggles — Switch doesn't accept {...register()}, needs Controller */}
                <div className="flex flex-col gap-3 p-4 rounded-lg bg-[var(--color-surface-elevated)]">
                  <Controller
                    control={control}
                    name="isPublic"
                    render={({ field }) => (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Globe size={16} className="text-[var(--color-text-muted)]" />
                          <span className="text-sm text-[var(--color-text)]">Public</span>
                        </div>
                        <Switch isSelected={field.value} onChange={(isSelected) => field.onChange(isSelected)}>
                          <Switch.Control>
                            <Switch.Thumb />
                          </Switch.Control>
                        </Switch>
                      </div>
                    )}
                  />
                </div>
              </div>
            </Modal.Body>

            <Modal.Footer className="gap-3 p-6">
              <Button slot="close" variant="ghost" onPress={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button
                type="submit"
                isPending={isLoading}
                isDisabled={isLoading}
                onPress={handleSubmit(onSubmit, (errors) => console.log('Błędy walidacji:', errors))}
                className="flex-1 bg-[var(--color-primary)] text-white shadow-lg"
              >
                Create
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
