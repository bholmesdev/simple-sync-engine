import { useEffect } from "react";
import { pull, useMigrations, useQuery, mutate, reset } from "./lib/db.client";

export function App() {
  const isMigrationsLoaded = useMigrations();
  if (!isMigrationsLoaded) return <div>Initializing DB...</div>;

  return <Home />;
}

function Home() {
  const [tasks, refetchTasks] = useQuery("getTasks", {});
  useEffect(() => {
    const interval = setInterval(pull, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>Simple Sync Engine</h1>
      <div className="flex gap-4">
        <button
          onClick={async () => {
            await mutate("createTask", { title: "test" });
            refetchTasks();
          }}
        >
          Add
        </button>
        <button
          onClick={async () => {
            await pull();
          }}
        >
          Pull
        </button>
        <button onClick={reset}>Reset</button>
      </div>
      <pre>{JSON.stringify(tasks, null, 2)}</pre>
    </div>
  );
}
