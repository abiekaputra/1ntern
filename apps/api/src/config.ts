// Module responsible for loading validated local runtime configuration.

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);

export interface AppConfig {
  databasePath: string;
  workspaceRoot: string;
  port: number;
  resetOnStart: boolean;
  logLevel: string;
}

export function loadConfig(): AppConfig {
  return {
    databasePath: path.resolve(
      projectRoot,
      process.env.ONEINTERN_DATABASE_PATH ?? 'runtime/1ntern.db',
    ),
    workspaceRoot: path.resolve(
      projectRoot,
      process.env.ONEINTERN_WORKSPACE_ROOT ?? 'runtime/workspaces/demo-repo',
    ),
    port: Number(process.env.ONEINTERN_API_PORT ?? 4501),
    resetOnStart: process.env.ONEINTERN_RESET_ON_START === 'true',
    logLevel: process.env.ONEINTERN_LOG_LEVEL ?? 'info',
  };
}

export const paths = {
  projectRoot,
  fixtureRoot: path.join(projectRoot, 'fixtures/demo-repo'),
};
