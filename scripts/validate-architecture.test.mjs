import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { expect, test } from 'vitest';
import { validateWorkspaceArchitecture } from './validate-architecture.mjs';

test('reports each prohibited dependency from an isolated workspace fixture', async () => {
  const root = await mkdtemp(join(tmpdir(), 'emme-architecture-'));

  try {
    await Promise.all([
      writeFixtureFile(root, 'apps/web/package.json', '{"name":"@emme/web"}'),
      writeFixtureFile(root, 'apps/admin/package.json', '{"name":"admin-app"}'),
      writeFixtureFile(root, 'apps/web/src/app.ts', "import 'admin-app';"),
      writeFixtureFile(root, 'packages/core/src/package-to-app.ts', "import '@emme/web';"),
      writeFixtureFile(root, 'packages/core/src/package-app-alias.ts', "import '@/lib/api';"),
      writeFixtureFile(root, 'packages/ui/src/ui-business.ts', "import '@emme/domain/orders';"),
      writeFixtureFile(
        root,
        'packages/core/src/feature-private-path.ts',
        "import '@emme/features/billing/internal';",
      ),
    ]);

    const { violations } = await validateWorkspaceArchitecture({ root });

    expect(violations).toHaveLength(5);
    expect(violations).toEqual(
      expect.arrayContaining([
        {
          rule: 'app-cannot-import-app',
          file: 'apps/web/src/app.ts',
          specifier: 'admin-app',
        },
        {
          rule: 'package-cannot-import-app',
          file: 'packages/core/src/package-to-app.ts',
          specifier: '@emme/web',
        },
        {
          rule: 'package-cannot-use-app-alias',
          file: 'packages/core/src/package-app-alias.ts',
          specifier: '@/lib/api',
        },
        {
          rule: 'ui-cannot-import-business',
          file: 'packages/ui/src/ui-business.ts',
          specifier: '@emme/domain/orders',
        },
        {
          rule: 'retired-feature-package-import',
          file: 'packages/core/src/feature-private-path.ts',
          specifier: '@emme/features/billing/internal',
        },
      ]),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

async function writeFixtureFile(root, path, content) {
  const destination = join(root, path);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, content);
}
