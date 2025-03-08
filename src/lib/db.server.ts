import Database from "better-sqlite3";
import sql, { SQLStatement } from "sql-template-strings";

export const dbPath = process.env.DB_PATH ?? "database.sqlite3";

const db = new Database(dbPath);

export { sql };

export function mutate(query: SQLStatement) {
  return db.prepare(query.sql).all(query.values);
}

export function run(query: SQLStatement) {
  return db.prepare(query.sql).run(query.values);
}
