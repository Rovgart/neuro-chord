'use client';

import { useAppDispatch, useAppSelector } from '@/store';
import { closeModal, ModalType } from '@/store/slices/uiSlice';
import React from 'react';
import CreateMaterialModal from './CreateMaterialModal';

const MODAL_COMPONENT: Record<ModalType, React.ElementType> = {
  CREATE_MATERIAL: () => <CreateMaterialModal />,
  EDIT_PROFILE: () => <div>EDIT_PROFILE</div>,
  CONFIRM_DELETE: () => <div>CONFIRM_DELETE</div>,
};
function ModalManager() {
  const dispatch = useAppDispatch();
  const { type, data, isOpen } = useAppSelector((state) => state.ui.modal);
  if (!isOpen || !type) return null;
  const ActiveModal = MODAL_COMPONENT[type];
  if (!ActiveModal) return null;
  return <ActiveModal data={data} onClose={() => dispatch(closeModal())} />;
}

export default ModalManager;
