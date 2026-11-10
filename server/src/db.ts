import Database from 'better-sqlite3';

let db: Database.Database | undefined;

/** Opens (or creates) the SQLite file and makes sure the tables exist. Use ':memory:' in tests. */
export function initDb(path: string): Database.Database {
  db?.close();
  db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS analyses (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      cv_hash     TEXT NOT NULL UNIQUE,
      report_json TEXT NOT NULL,
      created_at  TEXT NOT NULL
    )
  `);
  return db;
}

/** The open database. Models call this; server.ts (or a test) calls initDb first. */
export function getDb(): Database.Database {
  if (!db) throw new Error('The database is not open. Call initDb() first.');
  return db;
}

export function closeDb(): void {
  db?.close();
  db = undefined;
}
