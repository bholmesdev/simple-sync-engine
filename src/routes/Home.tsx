import { mutate, useQuery, pull, reset, invalidateAll } from "../lib/db.client";

export function Home() {
  const [tasks, refetchTasks] = useQuery("getTasks", {});

  return (
    <div>
      <title>Home</title>
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
