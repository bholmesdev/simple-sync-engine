import { useState } from "react";
import { mutation, store } from "./store";

export const useCount = () => {
  const [count, setCount] = useState(store.count);

  function addCount(count: number) {
    mutation.addCount({ count });
    setCount(store.count);
    fetch("/api/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mutator: "addCount", args: { count } }),
    });
  }
  return [count, addCount] as const;
};
