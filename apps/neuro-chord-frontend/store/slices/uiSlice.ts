import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ModalType = 'CREATE_MATERIAL' | 'EDIT_PROFILE' | 'CONFIRM_DELETE' | null;
interface UiState {
  modal: {
    isOpen: boolean;
    data: any;
    type: ModalType;
  };
}
const initialState: UiState = {
  modal: {
    type: null,
    data: null,
    isOpen: false,
  },
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<{ type: ModalType; data: any }>) => {
      state.modal = {
        isOpen: true,
        type: action.payload.type,
        data: action.payload.data,
      };
    },
    closeModal: (state) => {
      state.modal.type = null;
      state.modal.data = null;
      state.modal.isOpen = false;
    },
  },
});
export const { openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;
