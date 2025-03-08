import { run } from "../src/lib/db.server";
import { getMigrations, getResetMigrations } from "../src/lib/migrations";

if (process.env.DB_RESET) {
  const migrations = getResetMigrations();
  for (const migration of migrations) {
    run(migration);
  }
}

const migrations = getMigrations();
for (const migration of migrations) {
  run(migration);
}
