import sql, { type SQLStatement } from "sql-template-strings";
import { SQLocal } from "sqlocal";
import { getMigrations, getResetMigrations } from "../migrations";
import { useState, useEffect } from "react";
import { mutation, query } from "../queries";
import type { PullResponse } from "../pages/api/pull";

const db = new SQLocal("database.sqlite3");
const optimisticDb = new SQLocal("optimistic-database.sqlite3");

// Store refetch functions to invalidate all whenever we pull
const queryRefetchFns = new Set<() => void>();

export async function pull() {
  const clientId = getClientId();
  const res = await fetch(`/api/pull?clientId=${clientId}`);
  if (res.status === 409) {
    await reset();
    return;
  }
  if (!res.ok) {
    console.error("Failed to pull");
    return;
  }
  const { mutations, flushCount }: PullResponse = await res.json();
  for (const entry of mutations) {
    const stmt = mutation[entry.mutator](entry.args);
    await run(db, stmt);
  }
  await flushMutationLog(flushCount);

  const file = await db.getDatabaseFile();
  await optimisticDb.overwriteDatabaseFile(await file.arrayBuffer());

  for (const entry of await getMutationLog()) {
    const stmt = mutation[entry.mutator](entry.args);
    await run(optimisticDb, stmt);
  }
  invalidateAll();
}

async function push(mutator: keyof typeof mutation, args: any) {
  const clientId = getClientId();
  await addMutationLogEntry({ clientId, mutator, args });
  fetch(`/api/push`, {
    method: "POST",
    body: JSON.stringify({ clientId, mutator, args }),
  }).then((res) => console.log("pushed mutation", mutator, res.status));
}

export async function mutate<T extends keyof typeof mutation>(
  mutator: T,
  args: Parameters<(typeof mutation)[T]>[0]
) {
  const res = await run(optimisticDb, mutation[mutator](args as any));
  await push(mutator, args);
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

async function reset() {
  const res = await fetch("/api/reset");
  if (!res.ok) {
    console.error("Failed to reset");
    return;
  }
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

async function runMigrations() {
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
  clientId: string;
  mutator: keyof typeof mutation;
  args: any;
}) {
  const stmt = sql`INSERT INTO mutation_log (clientId, mutator, args) VALUES (${
    entry.clientId
  }, ${entry.mutator}, ${JSON.stringify(entry.args)})`;
  await run(db, stmt);
}

async function flushMutationLog(count: number) {
  await run(
    db,
    sql`DELETE FROM mutation_log WHERE id IN (SELECT id FROM mutation_log ORDER BY id ASC LIMIT ${count})`
  );
}
