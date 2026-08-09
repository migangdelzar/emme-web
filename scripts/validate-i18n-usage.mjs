import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const sourceRoot = join(process.cwd(), 'apps/salon-app/src');
const violations = [];

async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await visit(path);
      continue;
    }

    if (!/\.(ts|tsx)$/.test(entry.name) || /\.test\.(ts|tsx)$/.test(entry.name)) {
      continue;
    }

    const source = await readFile(path, 'utf8');
    const location = relative(process.cwd(), path);

    if (path.endsWith('/app/translation.ts') || path.endsWith('/src/i18n.ts')) {
      continue;
    }

    if (source.includes("from 'react-i18next'") || source.includes('from "react-i18next"')) {
      violations.push(
        `${location}: use the application translation adapter instead of importing react-i18next directly`
      );
    }

    const legacyKeyPattern = /\bt\(\s*['"][^'"]+:[^'"]+['"]/g;
    for (const match of source.matchAll(legacyKeyPattern)) {
      violations.push(`${location}: legacy namespace translation key ${match[0]}`);
    }
  }
}

await visit(sourceRoot);

if (violations.length > 0) {
  console.error(violations.map((violation) => `❌ ${violation}`).join('\n'));
  process.exit(1);
}

console.log('✅ Application i18n usage follows the typed translation boundary');
