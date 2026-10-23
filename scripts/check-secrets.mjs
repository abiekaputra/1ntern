// Module responsible for rejecting common credential patterns from tracked project text.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const ROOT = process.cwd();
const SKIPPED = new Set(['node_modules', 'dist', 'runtime', 'docs', 'test-results']);
const TEXT_EXTENSIONS = new Set(['.ts', '.tsx', '.mjs', '.json', '.md', '.yml', '.yaml']);
const PATTERNS = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
  /\bsk-[A-Za-z0-9]{20,}\b/,
  /(?:password|secret|api[_-]?key)\s*[:=]\s*['"][^'"\s]{8,}['"]/i,
];
const failures = [];

function visit(path) {
  for (const entry of readdirSync(path)) {
    if (SKIPPED.has(entry) || entry === 'pnpm-lock.yaml' || entry.startsWith('.git'))
      continue;
    const absolute = join(path, entry);
    if (statSync(absolute).isDirectory()) {
      visit(absolute);
      continue;
    }
    if (!TEXT_EXTENSIONS.has(extname(entry))) continue;
    const content = readFileSync(absolute, 'utf8');
    if (PATTERNS.some((pattern) => pattern.test(content)))
      failures.push(relative(ROOT, absolute));
  }
}

visit(ROOT);
if (failures.length > 0) {
  console.error(`Potential credentials found:\n${failures.join('\n')}`);
  process.exit(1);
}
console.log('Credential scan passed.');
