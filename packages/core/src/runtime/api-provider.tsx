import { type ReactNode } from 'react';
import { ApiContext } from './api-context.js';
import type { Api } from '@emme/api';

export interface ApiProviderProps {
  readonly api: Api;
  readonly children?: ReactNode;
}

export function ApiProvider({ api, children }: ApiProviderProps): ReactNode {
  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}
