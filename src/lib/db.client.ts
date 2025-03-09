import sql, { type SQLStatement } from "sql-template-strings";
import { SQLocal } from "sqlocal";
import { getMigrations, getResetMigrations } from "./migrations";
import { useState, useEffect } from "react";
import { mutation, query } from "../queries";
import {
  addMutationLogEntry,
  flushMutationLog,
  getMutationLog,
} from "./log.client";
import type { PullResponse } from "../pages/api/pull";

export const db = new SQLocal("database.sqlite3");
export const optimisticDb = new SQLocal("optimistic-database.sqlite3");

const clientId = createClientId();

// Store refetch functions to invalidate all whenever we pull
const queryRefetchFns = new Set<() => void>();

export function run(db: SQLocal, query: SQLStatement) {
  return db.sql(query.sql, ...query.values);
}

export async function pull() {
  const res = await fetch(`/api/pull?clientId=${clientId}`);
  if (!res.ok) {
    console.error("Failed to pull");
    return;
  }
  const { commands, flushCount } = await res.json();
  for (const command of commands) {
    const stmt = mutation[command.mutator as keyof typeof mutation](
      command.args
    );
    await run(db, stmt);
  }
  await flushMutationLog(flushCount);

  const file = await db.getDatabaseFile();
  await optimisticDb.overwriteDatabaseFile(await file.arrayBuffer());

  for (const command of await getMutationLog()) {
    const stmt = mutation[command.mutator as keyof typeof mutation](
      command.args as any
    );
    await run(optimisticDb, stmt);
  }
  invalidateAll();
}

export async function mutate<T extends keyof typeof mutation>(
  mutator: T,
  args: Parameters<(typeof mutation)[T]>[0]
) {
  const res = await run(optimisticDb, mutation[mutator](args as any));
  await addMutationLogEntry({ clientId, mutator, args });
  fetch(`/api/push`, {
    method: "POST",
    body: JSON.stringify({ clientId, mutator, args }),
  }).then((res) => console.log("pushed mutation", mutator, res.status));
  return res;
}

export function useQuery(
  name: keyof typeof query,
  args: Parameters<(typeof query)[keyof typeof query]>[0]
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
  const res = await fetch("/api/reset");
  if (!res.ok) {
    console.error("Failed to reset");
    return;
  }
  for (const migration of getResetMigrations()) {
    await run(db, migration);
    await run(optimisticDb, migration);
  }
  window.location.reload();
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
function createClientId() {
  let clientId = localStorage.getItem("clientId");
  if (!clientId) {
    clientId = crypto.randomUUID();
    localStorage.setItem("clientId", clientId);
  }
  return clientId;
}
