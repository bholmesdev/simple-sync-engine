import type { SQLStatement } from "sql-template-strings";
import { SQLocal } from "sqlocal";
import { getMigrations } from "./db";
import { useState, useEffect } from "react";

const db = new SQLocal("database.sqlite3");

export function run(query: SQLStatement) {
  return db.sql(query.sql, ...query.values);
}

export function useQuery(
  query: SQLStatement
): [data: any[], refetch: () => void] {
  const [data, setData] = useState<any[]>([]);
  function refetch() {
    run(query).then(setData);
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
