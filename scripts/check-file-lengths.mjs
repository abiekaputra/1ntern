// Module responsible for enforcing 1ntern production and test file length limits.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const ROOT = process.cwd();
const INCLUDED = new Set(['.ts', '.tsx', '.css', '.mjs']);
const SKIPPED = new Set([
  'node_modules',
  'dist',
  'runtime',
  'playwright-report',
  'test-results',
]);
const failures = [];

function visit(path) {
  for (const entry of readdirSync(path)) {
    if (SKIPPED.has(entry) || entry.startsWith('.')) continue;
    const absolute = join(path, entry);
    if (statSync(absolute).isDirectory()) {
      visit(absolute);
      continue;
    }
    if (!INCLUDED.has(extname(entry))) continue;
    const file = relative(ROOT, absolute);
    const lines = readFileSync(absolute, 'utf8').split('\n').length;
    const isTest = /(?:\.test\.|\.spec\.|tests\/)/.test(file);
    const limit = isTest ? 1000 : 300;
    if (lines > limit) failures.push(`${file}: ${lines} lines exceeds ${limit}`);
  }
}

visit(ROOT);
if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('File length limits passed.');
