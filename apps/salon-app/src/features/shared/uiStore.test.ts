import { describe, expect, it } from 'vitest';
import { createInitialUiState, reduceUiState } from './uiStore';

describe('uiStore reducer', () => {
  it('completes onboarding without mutating the previous state', () => {
    const initial = createInitialUiState(true);

    const next = reduceUiState(initial, { type: 'completeOnboarding' });

    expect(initial.isFirstTime).toBe(true);
    expect(next).toEqual({ ...initial, isFirstTime: false });
  });

  it('toggles the sidebar through a typed action', () => {
    const initial = createInitialUiState(false);

    const opened = reduceUiState(initial, { type: 'setSidebarOpen', open: true });
    const closed = reduceUiState(opened, { type: 'setSidebarOpen', open: false });

    expect(opened.sidebarOpen).toBe(true);
    expect(closed.sidebarOpen).toBe(false);
  });
});
