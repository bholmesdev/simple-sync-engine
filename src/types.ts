export type Issue = {
  id: number;
  title: string;
  description: string;
  status: "not started" | "in progress" | "done";
  owner: string;
};
