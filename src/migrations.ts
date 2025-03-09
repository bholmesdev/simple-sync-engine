import sql, { SQLStatement } from "sql-template-strings";

export function getMigrations(): SQLStatement[] {
  return [
    sql`CREATE TABLE IF NOT EXISTS issue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    owner TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'not started',
    createdAt INTEGER NOT NULL
  )`,
    sql`CREATE TABLE IF NOT EXISTS mutation_log (
    id INTEGER PRIMARY KEY,
    clientId TEXT NOT NULL,
    mutator TEXT NOT NULL,
    args TEXT NOT NULL
  )`,
  ];
}

export function getResetMigrations(): SQLStatement[] {
  return [
    sql`DROP TABLE IF EXISTS issue`,
    sql`DROP TABLE IF EXISTS mutation_log`,
  ];
}
