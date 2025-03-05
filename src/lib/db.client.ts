import sql, { type SQLStatement } from "sql-template-strings";
import { SQLocal } from "sqlocal";
import { getMigrations } from "./db";
import { useState, useEffect } from "react";
import { mutation, query } from "../queries";

const referenceDb = new SQLocal("reference-database.sqlite3");
const db = new SQLocal("database.sqlite3");

const commandLog: Array<{
  mutator: keyof typeof mutation;
  args: Parameters<(typeof mutation)[keyof typeof mutation]>[0];
}> = [];

function run(query: SQLStatement, selectedDb: SQLocal = db) {
  return selectedDb.sql(query.sql, ...query.values);
}

export async function pull() {
  const res = await fetch(`/api/pull`);
  const payload = await res.json();
  for (const command of payload.run) {
    const stmt = mutation[command.mutator as keyof typeof mutation](
      command.args
    );
    await run(stmt, referenceDb);
  }
  const file = await referenceDb.getDatabaseFile();
  await db.overwriteDatabaseFile(await file.arrayBuffer());
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
    body: JSON.stringify({ mutator, args }),
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
    // Add refetch function when component mounts
    queryRefetchFns.add(refetch);

    // Remove it when component unmounts
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
  await run(sql`DROP TABLE IF EXISTS task`, referenceDb);
  await run(sql`DROP TABLE IF EXISTS task`, db);
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
