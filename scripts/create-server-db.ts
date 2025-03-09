import { run } from "../src/lib/server";
import { getMigrations, getResetMigrations } from "../src/migrations";

if (process.env.DB_RESET) {
  for (const migration of getResetMigrations()) {
    run(migration);
  }
}

for (const migration of getMigrations()) {
  run(migration);
}
