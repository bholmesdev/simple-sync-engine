export let store = {
  count: 0,
};

export const mutation = {
  addCount: ({ count }: { count: number }) => {
    store.count += count;
  },
};
