import { createContext } from 'react';
import type { TenantContext } from './tenant.types.js';

export const TenantContextValue = createContext<TenantContext | null>(null);
