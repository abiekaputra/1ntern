// Module responsible for running and stopping the local 1ntern API and web processes.

import { spawn } from 'node:child_process';

const processes = [
  spawn('pnpm', ['dev:api'], { stdio: 'inherit', shell: false }),
  spawn('pnpm', ['dev:web'], { stdio: 'inherit', shell: false }),
];

let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  processes.forEach((process) => process.kill('SIGTERM'));
  setTimeout(() => process.exit(code), 250);
}

processes.forEach((child) => {
  child.on('exit', (code) => {
    if (!stopping && code !== 0) stop(code ?? 1);
  });
});
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
