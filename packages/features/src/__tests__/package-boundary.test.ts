import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { Appointments } from '@emme/features/appointments';
import { Clients } from '@emme/features/clients';
import { MobileNav } from '@emme/features/navigation';
import { Services } from '@emme/features/services';
import { Settings } from '@emme/features/settings';
import { createReactEslintConfig } from '../../../../configs/eslint/react.config.mjs';

const publicFeatureSubpaths = [
  'analytics',
  'appointments',
  'catalog',
  'clients',
  'communications',
  'customers',
  'integrations',
  'navigation',
  'onboarding',
  'payments',
  'services',
  'settings',
  'staff',
  'tenant-configuration',
];
const workspaceRoot = resolve(process.cwd(), '../..');

describe('@emme/features package boundary', () => {
  it('imports reusable capabilities through explicit public feature barrels', () => {
    expect([Appointments, Clients, MobileNav, Services, Settings]).toHaveLength(5);

    const manifest = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
    const exports = manifest.exports as Record<string, unknown>;

    expect(Object.keys(exports).sort()).toEqual(['.', ...publicFeatureSubpaths.map((path) => `./${path}`)]);
    expect(exports['./*']).toBeUndefined();
  });

  it('rejects feature implementation paths outside the public export map', async () => {
    const privateSpecifier = '@emme/features/appointments/components/Appointments';

    await expect(import(/* @vite-ignore */ privateSpecifier)).rejects.toThrow();
  });

  it('shares strict tooling baselines without changing the Bun workspace manifest', () => {
    const configFiles = [
      'configs/typescript/tsconfig.strict.json',
      'configs/eslint/react.config.mjs',
      'configs/prettier/prettier.config.mjs',
      'configs/vite/shared.config.ts',
    ];

    for (const configFile of configFiles) {
      expect(existsSync(join(workspaceRoot, configFile)), configFile).toBe(true);
    }

    for (const projectConfig of [
      'apps/salon-app/tsconfig.json',
      ...['api', 'application', 'core', 'domain', 'features', 'i18n', 'infrastructure', 'test-support', 'ui', 'validation'].map(
        (packageName) => `packages/${packageName}/tsconfig.json`,
      ),
    ]) {
      const config = JSON.parse(readFileSync(join(workspaceRoot, projectConfig), 'utf8'));
      expect(config.extends, projectConfig).toBe('../../configs/typescript/tsconfig.strict.json');
    }

    expect(readFileSync(join(workspaceRoot, 'apps/salon-app/eslint.config.js'), 'utf8')).toContain(
      '../../configs/eslint/react.config.mjs',
    );
    expect(readFileSync(join(workspaceRoot, 'apps/salon-app/vite.config.ts'), 'utf8')).toContain(
      '../../configs/vite/shared.config.ts',
    );
    expect(readFileSync(join(workspaceRoot, 'prettier.config.mjs'), 'utf8')).toContain(
      './configs/prettier/prettier.config.mjs',
    );
  });

  it('keeps the shared ESLint factory independent from application dependency resolution', () => {
    const config = createReactEslintConfig(
      {
        js: { configs: { recommended: { name: 'eslint:recommended' } } },
        globals: { browser: { window: 'readonly' } },
        jsxA11y: { flatConfigs: { recommended: { name: 'jsx-a11y:recommended' } } },
        prettierConfig: { name: 'prettier' },
        reactHooks: { configs: { recommended: { rules: { 'react-hooks/rules-of-hooks': 'error' } } } },
        reactRefresh: {},
        securityPlugin: { configs: { recommended: { name: 'security:recommended' } } },
        tseslint: {
          config: (configuration: unknown) => configuration,
          configs: { recommended: [{ name: 'typescript:recommended' }] },
        },
      },
      { ignores: ['dist'] },
    ) as { ignores: string[]; rules: Record<string, unknown> };

    expect(config.ignores).toEqual(['dist']);
    expect(config.rules['react-hooks/rules-of-hooks']).toBe('error');
  });

  it('does not import application internals or concrete infrastructure', () => {
    const sourceFiles = collectSourceFiles(join(process.cwd(), 'src'));
    const forbidden = /(?:from\s+|import\s*\()['"](?:apps\/|[^'"]*\/apps\/)/;

    for (const sourceFile of sourceFiles) {
      expect(readFileSync(sourceFile, 'utf8'), sourceFile).not.toMatch(forbidden);
    }
  });
});

function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.name === '__tests__' || entry.name === 'dist' || entry.name.endsWith('.test.ts') || entry.name.endsWith('.test.tsx')) {
      return [];
    }
    if (entry.isDirectory()) return collectSourceFiles(path);
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  });
}
