import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { createApp } from './app';
import { readConfig } from './config';
import { initDb } from './db';

// Entry point: read settings, open the database, start listening.
if (existsSync('.env')) process.loadEnvFile('.env');
const config = readConfig();

mkdirSync(dirname(config.databasePath), { recursive: true });
initDb(config.databasePath);

createApp().listen(config.port, () => {
  console.info(
    `Java Coach server on http://localhost:${config.port} (database: ${config.databasePath})`,
  );
});
