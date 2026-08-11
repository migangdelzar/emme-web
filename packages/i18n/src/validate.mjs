import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const enUS = JSON.parse(readFileSync(resolve(__dirname, 'data/translations/en-US.json'), 'utf8'));
const esMX = JSON.parse(readFileSync(resolve(__dirname, 'data/translations/es-MX.json'), 'utf8'));
const elements = JSON.parse(readFileSync(resolve(__dirname, 'data/elements.json'), 'utf8'));

let exitCode = 0;

// ── Translation key parity ──
function checkKeys(enObj, esObj, path = '') {
  for (const key of Object.keys(enObj)) {
    const fullPath = path ? `${path}.${key}` : key;
    if (!(key in esObj)) {
      console.error(`MISSING: es-MX.${fullPath}`);
      exitCode = 1;
    } else if (typeof enObj[key] === 'object' && enObj[key] !== null && !Array.isArray(enObj[key])) {
      if (typeof esObj[key] !== 'object' || esObj[key] === null || Array.isArray(esObj[key])) {
        console.error(`TYPE: es-MX.${fullPath} expected object, got ${typeof esObj[key]}`);
        exitCode = 1;
      } else {
        checkKeys(enObj[key], esObj[key], fullPath);
      }
    } else if (typeof enObj[key] !== typeof esObj[key]) {
      console.error(`TYPE: es-MX.${fullPath} expected ${typeof enObj[key]}, got ${typeof esObj[key]}`);
      exitCode = 1;
    }
  }

  for (const key of Object.keys(esObj)) {
    const fullPath = path ? `${path}.${key}` : key;
    if (!(key in enObj)) {
      console.error(`EXTRA: es-MX.${fullPath} (not in en-US)`);
      exitCode = 1;
    }
  }
}

// ── Element catalog validation ──
const allTestIds = new Set();
function checkElements(obj, path = '') {
  for (const key of Object.keys(obj)) {
    const fullPath = path ? `${path}.${key}` : key;
    const value = obj[key];

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        if ('testId' in value) {
          const testId = value.testId;
          if (!/^[a-z0-9-]+$/.test(testId)) {
            console.error(`INVALID: elements.${fullPath}.testId = "${testId}" — must be [a-z0-9-]+`);
            exitCode = 1;
          }
          if (allTestIds.has(testId)) {
            console.error(`DUPLICATE: testId "${testId}" at elements.${fullPath} (already used)`);
            exitCode = 1;
          }
          allTestIds.add(testId);
          if (value.i18nKey) {
            const translationValue = resolvePath(enUS, value.i18nKey);
            if (translationValue === undefined) {
              console.error(`INVALID: elements.${fullPath}.i18nKey "${value.i18nKey}" not found in en-US`);
              exitCode = 1;
            }
          }
          continue; // ElementReference leaf — don't recurse into testId/i18nKey
        }
        checkElements(value, fullPath);
    } else if (typeof value === 'string') {
      // Plain string testId
      if (!/^[a-z0-9-]+$/.test(value)) {
        console.error(`INVALID: elements.${fullPath} = "${value}" — must be [a-z0-9-]+`);
        exitCode = 1;
      }
      if (allTestIds.has(value)) {
        console.error(`DUPLICATE: testId "${value}" at elements.${fullPath} (already used)`);
        exitCode = 1;
      }
      allTestIds.add(value);
    }
  }
}

function resolvePath(root, path) {
  return path.split('.').reduce((obj, key) => {
    if (typeof obj !== 'object' || obj === null) return undefined;
    return obj[key];
  }, root);
}

checkKeys(enUS, esMX);
checkElements(elements);

if (exitCode === 0) {
  console.log(`✅ Translation key parity: en-US ↔ es-MX (${Object.keys(enUS).length} root namespaces)`);
  console.log(`✅ Element catalog: ${allTestIds.size} testIds — all valid format, no duplicates`);
}

process.exit(exitCode);
