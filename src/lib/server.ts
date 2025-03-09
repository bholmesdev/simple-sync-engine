import Database from "better-sqlite3";
import sql, { SQLStatement } from "sql-template-strings";
import type { MutationLogEntry } from "../types";

export const dbPath = process.env.DB_PATH ?? "database.sqlite3";

const db = new Database(dbPath);

export function query(query: SQLStatement): any[] {
  return db.prepare(query.sql).all(query.values);
}

export function run(query: SQLStatement) {
  return db.prepare(query.sql).run(query.values);
}

export function isLogIdValid(id: number): boolean {
  const latestLogId: number =
    query(sql`SELECT MAX(id) as latestLogId FROM mutation_log`)[0]
      ?.latestLogId ?? 0;
  return id >= 0 && id <= latestLogId;
}

export function getMutationLog(afterId?: number): MutationLogEntry[] {
  const entries = query(
    sql`SELECT * FROM mutation_log WHERE id > ${afterId ?? 0}`
  ) as MutationLogEntry[];
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
  return run(
    sql`INSERT INTO mutation_log (clientId, mutator, args) VALUES (${
      entry.clientId
    }, ${entry.mutator}, ${JSON.stringify(entry.args)})`
  );
}
