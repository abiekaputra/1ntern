// Module responsible for enforcing navigable source directory size and depth.

import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SOURCE_ROOTS = ['apps/api/src', 'apps/web/src', 'packages/domain/src'];
const SKIPPED = new Set(['node_modules', 'dist']);
const failures = [];

function visit(root, path) {
  const entries = readdirSync(path).filter(
    (entry) => !entry.startsWith('.') && !SKIPPED.has(entry),
  );
  const relativePath = relative(root, path) || '.';
  if (entries.length > 20) failures.push(`${path}: ${entries.length} entries exceeds 20`);
  const depth = relativePath === '.' ? 0 : relativePath.split('/').length;
  if (depth > 4) failures.push(`${path}: depth ${depth} exceeds 4`);
  for (const entry of entries) {
    const absolute = join(path, entry);
    if (statSync(absolute).isDirectory()) visit(root, absolute);
  }
}

SOURCE_ROOTS.forEach((path) => visit(join(ROOT, path), join(ROOT, path)));
if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('Directory limits passed.');
