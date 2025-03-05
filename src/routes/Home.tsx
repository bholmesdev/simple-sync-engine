import { mutation, query } from "../queries";
import { run, useQuery } from "../lib/db.client";

export function Home() {
  const [tasks, refetchTasks] = useQuery(query.getTasks());

  return (
    <div>
      <h1>Hello World</h1>
      <button
        onClick={async () => {
          await run(mutation.createTask({ title: "test" }));
          refetchTasks();
        }}
      >
        Add Count
      </button>
      <pre>{JSON.stringify(tasks, null, 2)}</pre>
    </div>
  );
}
