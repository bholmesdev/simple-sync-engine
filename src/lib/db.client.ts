import sql, { type SQLStatement } from "sql-template-strings";
import { SQLocal } from "sqlocal";
import { getMigrations, getResetMigrations } from "./migrations";
import { useState, useEffect } from "react";
import { mutation, query } from "../queries";

const referenceDb = new SQLocal("reference-database.sqlite3");
const db = new SQLocal("database.sqlite3");
const clientId = crypto.randomUUID();

const commandLog: Array<{
  mutator: keyof typeof mutation;
  args: Parameters<(typeof mutation)[keyof typeof mutation]>[0];
}> = [];

// Store refetch functions to invalidate all whenever we pull
const queryRefetchFns = new Set<() => void>();

function run(query: SQLStatement, selectedDb: SQLocal = db) {
  return selectedDb.sql(query.sql, ...query.values);
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
    await run(stmt, referenceDb);
  }
  const file = await referenceDb.getDatabaseFile();
  await db.overwriteDatabaseFile(await file.arrayBuffer());
  commandLog.splice(0, flushCount);
  for (const command of commandLog) {
    const stmt = mutation[command.mutator as keyof typeof mutation](
      command.args
    );
    await run(stmt, db);
  }
  invalidateAll();
  console.log("pulled");
}

export async function mutate(
  mutator: keyof typeof mutation,
  args: Parameters<(typeof mutation)[keyof typeof mutation]>[0]
) {
  const res = await run(mutation[mutator](args));
  commandLog.push({ mutator, args });
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
    run(query[name](args)).then(setData);
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
    await run(migration, referenceDb);
    await run(migration, db);
  }
  window.location.reload();
}

export function useMigrations() {
  const [isComplete, setIsComplete] = useState(false);
  useEffect(() => {
    runMigrations().then(() => {
      console.log("migrations complete");
      setIsComplete(true);
    });
  }, []);
  return isComplete;
}

export async function runMigrations() {
  const migrations = getMigrations();
  for (const migration of migrations) {
    await run(migration, referenceDb);
    await run(migration, db);
  }
}

export function invalidateAll() {
  queryRefetchFns.forEach((refetch) => refetch());
}
