export function createReactEslintConfig(
  { js, globals, jsxA11y, prettierConfig, reactHooks, reactRefresh, securityPlugin, tseslint },
  { ignores = [] } = {},
) {
  return tseslint.config({
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      securityPlugin.configs.recommended,
      jsxA11y.flatConfigs.recommended,
      prettierConfig,
    ],
    files: ['**/*.{ts,tsx}'],
    ignores,
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      security: securityPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      // These React 19 compiler diagnostics are tracked separately from the
      // existing application lint baseline and will be enabled incrementally.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/purity': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      'jsx-a11y/no-noninteractive-element-to-interactive-role': 'off',
    },
  });
}
