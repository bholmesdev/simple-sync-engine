import { run } from "../src/lib/db.server";
import { getMigrations, getResetMigrations } from "../src/lib/migrations";

if (process.env.DB_RESET) {
  for (const migration of getResetMigrations()) {
    run(migration);
  }
}

for (const migration of getMigrations()) {
  run(migration);
}
