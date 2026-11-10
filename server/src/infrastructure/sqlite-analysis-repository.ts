import Database from 'better-sqlite3';
import type { AnalysisRepository, StoredAnalysis } from '../application/ports';

/** Opens (or creates) the SQLite file and makes sure the table exists. ':memory:' is fine in tests. */
export function openDatabase(path: string): Database.Database {
  const db = new Database(path);
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

interface AnalysisRow {
  cv_hash: string;
  report_json: string;
  created_at: string;
}

export class SqliteAnalysisRepository implements AnalysisRepository {
  private readonly db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  findByCvHash(cvHash: string): StoredAnalysis | undefined {
    const row = this.db
      .prepare<[string], AnalysisRow>(
        'SELECT cv_hash, report_json, created_at FROM analyses WHERE cv_hash = ?',
      )
      .get(cvHash);
    if (!row) return undefined;
    return {
      cvHash: row.cv_hash,
      report: JSON.parse(row.report_json) as StoredAnalysis['report'],
      createdAt: row.created_at,
    };
  }

  save(analysis: StoredAnalysis): void {
    // Two requests for the same new CV can race; the second insert is simply ignored.
    this.db
      .prepare(
        'INSERT INTO analyses (cv_hash, report_json, created_at) VALUES (?, ?, ?) ON CONFLICT(cv_hash) DO NOTHING',
      )
      .run(analysis.cvHash, JSON.stringify(analysis.report), analysis.createdAt);
  }
}
