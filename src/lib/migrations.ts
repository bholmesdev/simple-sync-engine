import sql, { SQLStatement } from "sql-template-strings";

export function getMigrations(): SQLStatement[] {
  return [
    sql`CREATE TABLE IF NOT EXISTS task (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'not started'
  )`,
  ];
}
