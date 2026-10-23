// Module responsible for preparing deterministic browser-test build artifacts.

import { execFileSync } from 'node:child_process';

export default function globalSetup() {
  execFileSync('pnpm', ['build'], { stdio: 'inherit' });
}
