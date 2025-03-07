import sql, { SQLStatement } from "sql-template-strings";

export function getMigrations(): SQLStatement[] {
  return [
    sql`CREATE TABLE IF NOT EXISTS issue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    owner TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'not started',

    createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  )`,
  ];
}

export function getResetMigrations(): SQLStatement[] {
  return [sql`DROP TABLE IF EXISTS issue`];
}
