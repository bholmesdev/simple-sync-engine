import sql, { type SQLStatement } from "sql-template-strings";
import { SQLocal } from "sqlocal";
import { getMigrations, getResetMigrations } from "../migrations";
import { useState, useEffect } from "react";
import { mutation, query } from "../queries";
import type { PullResponse } from "../pages/api/pull";

export const db = new SQLocal("database.sqlite3");
export const optimisticDb = new SQLocal("optimistic-database.sqlite3");

// Store refetch functions to invalidate all whenever we pull
const queryRefetchFns = new Set<() => void>();

export async function pull() {}

export async function mutate<T extends keyof typeof mutation>(
  mutator: T,
  args: Parameters<(typeof mutation)[T]>[0]
) {
  const res = await run(optimisticDb, mutation[mutator](args as any));
  return res;
}

export function useQuery<T extends keyof typeof query>(
  name: T,
  args: Parameters<(typeof query)[T]>[0]
): [data: any[], refetch: () => void] {
  const [data, setData] = useState<any[]>([]);
  function refetch() {
    run(optimisticDb, query[name](args)).then(setData);
  }
  useEffect(() => {
    refetch();
  }, [query]);

  useEffect(() => {
    queryRefetchFns.add(refetch);

    return () => {
      queryRefetchFns.delete(refetch);
    };
  }, [refetch]);

  return [data, refetch];
}

export async function reset() {
  await fetch("/api/reset");
  for (const migration of getResetMigrations()) {
    await run(db, migration);
    await run(optimisticDb, migration);
  }
  await runMigrations();
  localStorage.removeItem("clientId");
  invalidateAll();
}

function run(db: SQLocal, query: SQLStatement): Promise<any[]> {
  return db.sql(query.sql, ...query.values);
}

export function useMigrations() {
  const [isComplete, setIsComplete] = useState(false);
  useEffect(() => {
    runMigrations().then(() => {
      setIsComplete(true);
    });
  }, []);
  return isComplete;
}

export async function runMigrations() {
  for (const migration of getMigrations()) {
    await run(db, migration);
    await run(optimisticDb, migration);
  }
}

function invalidateAll() {
  queryRefetchFns.forEach((refetch) => refetch());
}

// Unique ID used to check whether optimistic updates
// were applied to the server.
function getClientId() {
  let clientId = localStorage.getItem("clientId");
  if (!clientId) {
    clientId = crypto.randomUUID();
    localStorage.setItem("clientId", clientId);
  }
  return clientId;
}

async function getMutationLog(): Promise<
  {
    id: number;
    clientId: string;
    mutator: keyof typeof mutation;
    args: any;
  }[]
> {
  const entries = await run(
    db,
    sql`SELECT * FROM mutation_log ORDER BY id ASC`
  );
  return entries.map((entry) => ({ ...entry, args: JSON.parse(entry.args) }));
}

async function addMutationLogEntry(entry: {
  mutator: keyof typeof mutation;
  args: any;
}) {
  const stmt = sql`INSERT INTO mutation_log (clientId, mutator, args) VALUES (${getClientId()}, ${
    entry.mutator
  }, ${JSON.stringify(entry.args)})`;
  await run(db, stmt);
}

async function flushMutationLog(count: number) {
  await run(
    db,
    sql`DELETE FROM mutation_log WHERE id IN (SELECT id FROM mutation_log ORDER BY id ASC LIMIT ${count})`
  );
}
