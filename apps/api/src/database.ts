// Module responsible for initializing the local SQLite persistence layer.

import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

export function openDatabase(databasePath: string): DatabaseSync {
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  const database = new DatabaseSync(databasePath);
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS runs (
      id TEXT PRIMARY KEY,
      intent_id TEXT NOT NULL,
      intent_name TEXT NOT NULL,
      status TEXT NOT NULL,
      requires_approval INTEGER NOT NULL,
      approved_at TEXT,
      summary TEXT,
      steps_json TEXT NOT NULL,
      snapshot_json TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS audit_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_id TEXT,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      detail TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(run_id) REFERENCES runs(id) ON DELETE CASCADE
    );
  `);
  return database;
}

export function clearDatabase(database: DatabaseSync): void {
  database.exec('DELETE FROM audit_events; DELETE FROM runs;');
}
