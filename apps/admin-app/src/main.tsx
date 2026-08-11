import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AdminRouter } from './app/router.js';
createRoot(document.getElementById('root')!).render(<StrictMode><AdminRouter /></StrictMode>);
