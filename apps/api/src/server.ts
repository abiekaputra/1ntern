// Module responsible for starting the local 1ntern API process.

import { createApp } from './app.js';
import { loadConfig } from './config.js';

const config = loadConfig();
const context = await createApp(config);

const shutdown = async () => {
  await context.close();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

await context.app.listen({ host: '127.0.0.1', port: config.port });
