// Module responsible for resetting the local demonstration workspace and database.

import { createApp } from './app.js';
import { loadConfig } from './config.js';

const config = { ...loadConfig(), resetOnStart: true };
const context = await createApp(config);
await context.close();
console.log('1ntern demo workspace reset.');
