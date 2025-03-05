import { mutate, useQuery, pull, reset, invalidateAll } from "../lib/db.client";

export function Home() {
  const [tasks, refetchTasks] = useQuery("getTasks", {});

  return (
    <div>
      <h1>Hello World</h1>
      <div className="flex gap-2">
        <button
          onClick={async () => {
            await mutate("createTask", { title: "test" });
            refetchTasks();
          }}
        >
          Add test task
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
