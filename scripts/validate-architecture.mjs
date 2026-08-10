import { access, readdir, readFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const sourceFilePattern = /\.(?:[cm]?[jt]sx?)$/;
const importPatterns = [
  /(?:import|export)\s+(?:[^'";]*?\s+from\s+)?['"]([^'"]+)['"]/g,
  /import\(\s*['"]([^'"]+)['"]\s*\)/g,
  /require\(\s*['"]([^'"]+)['"]\s*\)/g,
];
const uiBusinessImportPattern = /^@emme\/(?:api|application|domain|features|business|infrastructure)(?:\/|$)/;
const retiredFeaturesImportPattern = /^@emme\/features(?:\/|$)/;

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function resolveWorkspaceRoot(root) {
  if (root && (await exists(join(root, 'packages')))) {
    return root;
  }

  return resolve(dirname(fileURLToPath(import.meta.url)), '..');
}

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await sourceFiles(entryPath)));
    } else if (
      entry.isFile() &&
      sourceFilePattern.test(entry.name) &&
      !/\.(?:test|spec)\.[cm]?[jt]sx?$/.test(entry.name)
    ) {
      files.push(entryPath);
    }
  }

  return files;
}

function importSpecifiers(source) {
  const specifiers = new Set();

  for (const pattern of importPatterns) {
    for (const match of source.matchAll(pattern)) {
      specifiers.add(match[1]);
    }
  }

  return specifiers;
}

async function applicationPackageNames(workspaceRoot) {
  const appsRoot = join(workspaceRoot, 'apps');
  if (!(await exists(appsRoot))) return new Set();

  const apps = await readdir(appsRoot, { withFileTypes: true });
  const names = await Promise.all(
    apps
      .filter((app) => app.isDirectory())
      .map(async (app) => {
        const manifestPath = join(appsRoot, app.name, 'package.json');
        if (!(await exists(manifestPath))) return null;

        return JSON.parse(await readFile(manifestPath, 'utf8')).name;
      }),
  );

  return new Set(names.filter(Boolean));
}

function isApplicationImport(specifier, applicationPackages) {
  return (
    [...applicationPackages].some(
      (applicationPackage) =>
        specifier === applicationPackage || specifier.startsWith(`${applicationPackage}/`),
    ) ||
    specifier.startsWith('apps/') ||
    (specifier.startsWith('../') && specifier.includes('/apps/'))
  );
}

function addViolation(violations, rule, workspaceRoot, file, specifier) {
  violations.push({
    rule,
    file: relative(workspaceRoot, file),
    specifier,
  });
}

export async function validateWorkspaceArchitecture({ root } = {}) {
  const workspaceRoot = await resolveWorkspaceRoot(root);
  const packagesRoot = join(workspaceRoot, 'packages');
  const violations = [];

  if (!(await exists(packagesRoot))) {
    return { violations };
  }

  const applicationPackages = await applicationPackageNames(workspaceRoot);
  const packages = await readdir(packagesRoot, { withFileTypes: true });
  for (const packageEntry of packages) {
    if (!packageEntry.isDirectory()) continue;

    const packageSourceRoot = join(packagesRoot, packageEntry.name, 'src');
    if (!(await exists(packageSourceRoot))) continue;

    for (const file of await sourceFiles(packageSourceRoot)) {
      const source = await readFile(file, 'utf8');
      for (const specifier of importSpecifiers(source)) {
        if (isApplicationImport(specifier, applicationPackages)) {
          addViolation(violations, 'package-cannot-import-app', workspaceRoot, file, specifier);
        }

        if (specifier.startsWith('@/')) {
          addViolation(violations, 'package-cannot-use-app-alias', workspaceRoot, file, specifier);
        }

        if (packageEntry.name === 'ui' && uiBusinessImportPattern.test(specifier)) {
          addViolation(violations, 'ui-cannot-import-business', workspaceRoot, file, specifier);
        }

        if (retiredFeaturesImportPattern.test(specifier)) {
          addViolation(violations, 'retired-feature-package-import', workspaceRoot, file, specifier);
        }
      }
    }
  }

  return { violations };
}

async function run() {
  const { violations } = await validateWorkspaceArchitecture({ root: process.cwd() });

  if (violations.length > 0) {
    for (const violation of violations) {
      console.error(`❌ ${violation.rule}: ${violation.file} imports ${violation.specifier}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log('✅ Workspace architecture validation passed.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await run();
}
