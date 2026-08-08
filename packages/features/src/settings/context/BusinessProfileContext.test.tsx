import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BusinessProfileProvider, useBusinessProfileContext } from './BusinessProfileContext';

describe('BusinessProfileContext', () => {
  it('provides a stable default profile and persists profile updates for consumers', () => {
    const { result } = renderHook(() => useBusinessProfileContext(), {
      wrapper: BusinessProfileProvider,
    });

    expect(result.current.profile.name).toBe('EmmeNails');

    act(() => {
      result.current.updateProfile({ ...result.current.profile, monthlyGoal: 30000 });
    });

    expect(result.current.profile.monthlyGoal).toBe(30000);
  });

  it('throws when consumed outside its provider', () => {
    expect(() => renderHook(() => useBusinessProfileContext())).toThrow(
      'useBusinessProfileContext must be used within a BusinessProfileProvider'
    );
  });
});
