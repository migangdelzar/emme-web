import { useContext } from 'react';
import { ApiContext } from './api-context.js';
import type { Api } from '@emme/api';

export function useApi(): Api {
  const api = useContext(ApiContext);

  if (api === null) {
    throw new Error('useApi must be used within an ApiProvider');
  }

  return api;
}
