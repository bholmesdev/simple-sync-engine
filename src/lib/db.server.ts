import Database from "better-sqlite3";
import sql, { SQLStatement } from "sql-template-strings";
import { getMigrations } from "./migrations";

// Set the database path based on environment
// In development, use local path; in production use the /data directory for Railway persistence
const dbPath = import.meta.env.DEV ? "database.sqlite3" : "/data/database.sqlite3";
console.log(`Using database at: ${dbPath}`);

export const db = new Database(dbPath);

export { sql };

export function mutate(query: SQLStatement) {
  return db.prepare(query.sql).all(query.values);
}

export function run(query: SQLStatement) {
  return db.prepare(query.sql).run(query.values);
}

export function runMigrations() {
  const migrations = getMigrations();
  for (const migration of migrations) {
    run(migration);
  }
}
