import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const enUS = JSON.parse(readFileSync(resolve(__dirname, 'data/translations/en-US.json'), 'utf8'));
const esMX = JSON.parse(readFileSync(resolve(__dirname, 'data/translations/es-MX.json'), 'utf8'));

let exitCode = 0;

function checkKeys(enObj, esObj, path = '') {
  for (const key of Object.keys(enObj)) {
    const fullPath = path ? `${path}.${key}` : key;
    if (!(key in esObj)) {
      console.error(`MISSING: es-MX.${fullPath}`);
      exitCode = 1;
    } else if (typeof enObj[key] === 'object' && enObj[key] !== null) {
      checkKeys(enObj[key], esObj[key], fullPath);
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

checkKeys(enUS, esMX);

if (exitCode === 0) {
  console.log('✅ All translation keys match between en-US and es-MX');
}

process.exit(exitCode);
