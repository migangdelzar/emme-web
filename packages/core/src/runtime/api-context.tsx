import { createContext } from 'react';
import type { Api } from '@emme/api';

export const ApiContext = createContext<Api | null>(null);
