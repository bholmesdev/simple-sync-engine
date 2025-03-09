import sql from "sql-template-strings";
import type { MutationLogEntry } from "../types";
import { query, run } from "./db.server";

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
