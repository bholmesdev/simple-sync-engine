import sql from "sql-template-strings";

export const query = {
  getTasks(args: {}) {
    return sql`SELECT * FROM task`;
  },
};

export const mutation = {
  createTask({ title }: { title: string }) {
    return sql`INSERT INTO task (title) VALUES (${title})`;
  },
};
