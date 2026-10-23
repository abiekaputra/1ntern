// Module responsible for exposing the guarded automation HTTP API.

import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import Fastify, { type FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { AppConfig } from './config.js';
import { paths } from './config.js';
import { clearDatabase, openDatabase } from './database.js';
import { RunRepository } from './repository.js';
import { AutomationService } from './service.js';
import { createTools } from './tools.js';
import { ScopedWorkspace } from './workspace.js';

const intentSchema = z.object({ intentId: z.string().min(1).max(64) }).strict();
const runParams = z.object({ runId: z.string().uuid() });

export interface AppContext {
  app: FastifyInstance;
  close: () => Promise<void>;
  service: AutomationService;
}

export async function createApp(config: AppConfig): Promise<AppContext> {
  const database = openDatabase(config.databasePath);
  const workspace = new ScopedWorkspace(config.workspaceRoot, paths.fixtureRoot);
  if (config.resetOnStart) {
    clearDatabase(database);
    workspace.reset();
  }
  if (!workspace.listFiles().length) workspace.reset();

  const repository = new RunRepository(database);
  const service = new AutomationService(repository, workspace, createTools());
  const app = Fastify({ logger: { level: config.logLevel } });
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, { origin: /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/ });

  app.get('/health', async () => ({ status: 'ok', boundary: 'local-only' }));
  app.get('/api/dashboard', async () => service.dashboard());
  app.get('/api/runs/:runId', async (request) => serviceRun(request.params, service));
  app.post('/api/runs', async (request, reply) => {
    const body = intentSchema.parse(request.body);
    return reply.code(201).send(service.plan(body.intentId));
  });
  app.post('/api/runs/:runId/approve', async (request) =>
    service.approve(runParams.parse(request.params).runId),
  );
  app.post('/api/runs/:runId/execute', async (request) =>
    service.execute(runParams.parse(request.params).runId),
  );
  app.post('/api/runs/:runId/cancel', async (request) =>
    service.cancel(runParams.parse(request.params).runId),
  );
  app.post('/api/runs/:runId/rollback', async (request) =>
    service.rollback(runParams.parse(request.params).runId),
  );

  app.setErrorHandler((error, _request, reply) => {
    const statusCode = error instanceof z.ZodError ? 400 : 409;
    const message = error instanceof Error ? error.message : 'Request failed.';
    reply.code(statusCode).send({ error: message });
  });

  return {
    app,
    service,
    close: async () => {
      await app.close();
      database.close();
    },
  };
}

function serviceRun(params: unknown, service: AutomationService) {
  const runId = runParams.parse(params).runId;
  return service.dashboard().recentRuns.find((run) => run.id === runId) ?? null;
}
