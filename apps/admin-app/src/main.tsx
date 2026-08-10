import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PlatformAdminRouter } from './app/router.js';
createRoot(document.getElementById('root')!).render(<StrictMode><PlatformAdminRouter /></StrictMode>);
