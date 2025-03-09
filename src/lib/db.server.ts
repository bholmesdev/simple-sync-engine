import Database from "better-sqlite3";
import sql, { SQLStatement } from "sql-template-strings";
import type { MutationLogEntry } from "../types";

export const dbPath = process.env.DB_PATH ?? "database.sqlite3";

const db = new Database(dbPath);

export { sql };

export function mutate(query: SQLStatement) {
  return db.prepare(query.sql).all(query.values);
}

export function run(query: SQLStatement) {
  return db.prepare(query.sql).run(query.values);
}

export function getMutationLog(afterId?: number): MutationLogEntry[] {
  const entries = db
    .prepare("SELECT * FROM mutation_log WHERE id > ?")
    .all(afterId ?? 0) as MutationLogEntry[];
  return entries.map((entry) => ({
    ...entry,
    args: JSON.parse(entry.args),
  }));
}

export function addMutationLogEntry(entry: {
  clientId: string;
  mutator: string;
  args: any;
}) {
  return db
    .prepare(
      "INSERT INTO mutation_log (clientId, mutator, args) VALUES (?, ?, ?)"
    )
    .run(entry.clientId, entry.mutator, JSON.stringify(entry.args));
}
