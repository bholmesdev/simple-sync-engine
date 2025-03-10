import sql from "sql-template-strings";
import type { IssueStatus } from "./types";

export const query = {
  getIssues(args: {}) {
    return sql`SELECT * FROM issue ORDER BY createdAt DESC`;
  },
};

export const mutation = {
  createIssue({
    title,
    description,
    owner,
    createdAt,
  }: {
    title: string;
    description: string;
    owner: string;
    createdAt: number;
  }) {
    return sql`INSERT INTO issue (title, description, owner, createdAt) VALUES (${title}, ${description}, ${owner}, ${createdAt})`;
  },
  updateIssue({
    id,
    title,
    description,
    owner,
  }: {
    id: number;
    title: string;
    description: string;
    owner: string;
  }) {
    return sql`UPDATE issue SET title = ${title}, description = ${description}, owner = ${owner} WHERE id = ${id}`;
  },
  updateIssueStatus({ id, status }: { id: number; status: IssueStatus }) {
    return sql`UPDATE issue SET status = ${status} WHERE id = ${id}`;
  },
};
