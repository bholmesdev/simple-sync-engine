import Database from "better-sqlite3";
import sql, { SQLStatement } from "sql-template-strings";
import { getMigrations } from "./db";

export const db = new Database("database.sqlite3");

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
