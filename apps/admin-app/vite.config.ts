import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { mergeConfig } from 'vite';
import { createSharedViteConfig } from '../../configs/vite/shared.config.ts';
export default defineConfig(({ mode }) => mergeConfig(createSharedViteConfig({ mode, apiProxyTarget: 'http://localhost:8081' }), { plugins: [react()] }));
