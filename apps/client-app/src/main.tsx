import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClientRouter } from './app/router.js';
createRoot(document.getElementById('root')!).render(<StrictMode><ClientRouter /></StrictMode>);
