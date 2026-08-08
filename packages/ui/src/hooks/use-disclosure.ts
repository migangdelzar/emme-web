import { useCallback, useState } from 'react';

export interface DisclosureState {
  readonly isOpen: boolean;
  readonly open: () => void;
  readonly close: () => void;
  readonly toggle: () => void;
}

export function useDisclosure(initialIsOpen = false): DisclosureState {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((current) => !current), []);

  return { isOpen, open, close, toggle };
}
