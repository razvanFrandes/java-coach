/** Server settings, read once from environment variables (see .env.example). */
export interface ServerConfig {
  port: number;
  databasePath: string;
  codexTimeoutMs: number;
  codexModel: string | undefined;
}

export function readConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  return {
    port: Number(env.PORT ?? 3001),
    databasePath: env.DATABASE_PATH ?? 'data/java-coach.db',
    codexTimeoutMs: Number(env.CODEX_TIMEOUT_MS ?? 180_000),
    codexModel: env.CODEX_MODEL || undefined,
  };
}
