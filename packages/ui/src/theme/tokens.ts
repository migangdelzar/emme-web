import type { UiTokens } from './ui.types.js';

export const colors = {
  primary: '#7c3aed',
  background: '#ffffff',
  foreground: '#18181b',
  muted: '#71717a',
  danger: '#dc2626',
  success: '#16a34a',
} as const;

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
} as const;

export const typography = {
  body: '1rem',
  small: '0.875rem',
  heading: '1.5rem',
  display: '2.25rem',
} as const;

export const tokens = {
  colors,
  spacing,
  typography,
} as const satisfies UiTokens;
