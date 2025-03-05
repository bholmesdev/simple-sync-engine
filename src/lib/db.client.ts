import type { SQLStatement } from "sql-template-strings";
import { SQLocal } from "sqlocal";
import { getMigrations } from "./db";
import { useState, useEffect } from "react";
import { mutation, query } from "../queries";

const db = new SQLocal("database.sqlite3");

function run(query: SQLStatement) {
  return db.sql(query.sql, ...query.values);
}

export async function mutate(
  mutator: keyof typeof mutation,
  args: Parameters<(typeof mutation)[keyof typeof mutation]>[0]
) {
  const res = await run(mutation[mutator](args));
  fetch(`/api/push`, {
    method: "POST",
    body: JSON.stringify({ mutator, args }),
  }).then((res) => console.log("pushed mutation", mutator, res.json()));
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
  return [data, refetch];
}

export function useMigrations() {
  const [isComplete, setIsComplete] = useState(false);
  useEffect(() => {
    runMigrations().then(() => setIsComplete(true));
  }, []);
  return isComplete;
}

export async function runMigrations() {
  const migrations = getMigrations();
  for (const migration of migrations) {
    await run(migration);
  }
}
