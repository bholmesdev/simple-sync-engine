export type IssueStatus = "not started" | "in progress" | "done";

export type Issue = {
  id: number;
  title: string;
  description: string;
  status: IssueStatus;
  owner: string;
  createdAt: string;
};
