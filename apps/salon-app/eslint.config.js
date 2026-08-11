import js from '@eslint/js';
import globals from 'globals';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import securityPlugin from 'eslint-plugin-security';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import { createReactEslintConfig } from '../../configs/eslint/react.config.mjs';

export default createReactEslintConfig(
  { js, globals, jsxA11y, prettierConfig, reactHooks, reactRefresh, securityPlugin, tseslint },
  { ignores: ['dist', 'eslint.config.js', 'vite.config.ts', 'src/components/ui/**'] },
);
