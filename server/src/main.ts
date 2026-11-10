import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { Codex } from '@openai/codex-sdk';
import { AnalyzeCv } from './application/analyze-cv';
import { readConfig } from './config';
import { createApp } from './http/app';
import { CodexCoachEngine } from './infrastructure/codex-coach-engine';
import {
  openDatabase,
  SqliteAnalysisRepository,
} from './infrastructure/sqlite-analysis-repository';

// Composition root of the server: the only file that knows every concrete class.
if (existsSync('.env')) process.loadEnvFile('.env');
const config = readConfig();

mkdirSync(dirname(config.databasePath), { recursive: true });
const repository = new SqliteAnalysisRepository(openDatabase(config.databasePath));
const engine = new CodexCoachEngine({
  codex: new Codex(),
  timeoutMs: config.codexTimeoutMs,
  model: config.codexModel,
});
const app = createApp({ analyzeCv: new AnalyzeCv(engine, repository) });

app.listen(config.port, () => {
  console.info(
    `Java Coach server on http://localhost:${config.port} (database: ${config.databasePath})`,
  );
});
