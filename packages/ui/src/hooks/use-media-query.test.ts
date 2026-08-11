// @vitest-environment happy-dom

import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useMediaQuery } from './use-media-query.js';

describe('useMediaQuery', () => {
  it('tracks media query changes and cleans up its listener', () => {
    let matches = false;
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    const removeEventListener = vi.fn((_: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    });

    vi.stubGlobal('matchMedia', () => ({
      get matches() {
        return matches;
      },
      media: '(min-width: 768px)',
      addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.add(listener);
      },
      removeEventListener,
    }));

    const { result, unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);

    matches = true;
    act(() => {
      for (const listener of listeners) listener({ matches } as MediaQueryListEvent);
    });
    expect(result.current).toBe(true);

    unmount();
    expect(removeEventListener).toHaveBeenCalledTimes(1);
  });
});
