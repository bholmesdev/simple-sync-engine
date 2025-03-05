import { mutation } from "./store";
import { useCount } from "./store.client";

export function App() {
  const [count, addCount] = useCount();

  return (
    <div>
      <h1>Hello World</h1>
      <button onClick={() => addCount(1)}>Add Count</button>
      <p>Count: {count}</p>
    </div>
  );
}
