import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UiState {
  readonly isFirstTime: boolean;
  readonly sidebarOpen: boolean;
}

export type UiAction =
  | { readonly type: 'completeOnboarding' }
  | { readonly type: 'setSidebarOpen'; readonly open: boolean };

export interface UiStore extends UiState {
  readonly dispatch: (action: UiAction) => void;
}

export function createInitialUiState(isFirstTime = true): UiState {
  return {
    isFirstTime,
    sidebarOpen: false,
  };
}

export function reduceUiState(state: UiState, action: UiAction): UiState {
  switch (action.type) {
    case 'completeOnboarding':
      return { ...state, isFirstTime: false };
    case 'setSidebarOpen':
      return { ...state, sidebarOpen: action.open };
  }
}

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      ...createInitialUiState(),
      dispatch: (action) => set((state) => reduceUiState(state, action)),
    }),
    {
      name: 'emme-ui-state',
      partialize: ({ isFirstTime }) => ({ isFirstTime }),
    },
  ),
);
