import sql from "sql-template-strings";
import type { MutationLogEntry } from "../types";
import { referenceDb, run } from "./db.client";

export async function getMutationLog(): Promise<MutationLogEntry[]> {
  const entries = (await run(
    sql`SELECT * FROM mutation_log ORDER BY id ASC`,
    referenceDb
  )) as MutationLogEntry[];
  return entries.map((entry) => ({
    ...entry,
    args: JSON.parse(entry.args),
  }));
}

export async function addMutationLogEntry(entry: {
  clientId: string;
  mutator: string;
  args: any;
}) {
  const stmt = sql`INSERT INTO mutation_log (clientId, mutator, args) VALUES (${
    entry.clientId
  }, ${entry.mutator}, ${JSON.stringify(entry.args)})`;
  await run(stmt, referenceDb);
}

export async function flushMutationLog(count: number) {
  await run(
    sql`DELETE FROM mutation_log WHERE id IN (SELECT id FROM mutation_log ORDER BY id ASC LIMIT ${count})`,
    referenceDb
  );
}
