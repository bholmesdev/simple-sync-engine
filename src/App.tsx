import { useEffect, useRef, useState } from "react";
import { RiAddFill, RiCloseFill } from "@remixicon/react";
import type { Issue } from "./types";
import { pull, useMigrations, useQuery, mutate } from "./lib/db.client";

export function App() {
  const isMigrationsLoaded = useMigrations();
  if (!isMigrationsLoaded) return <div>Initializing DB...</div>;

  return <Home />;
}

function Home() {
  const [issues, refetchIssues] = useQuery("getIssues", {});
  const [selectedIssue, setSelectedIssue] = useState<Issue | undefined>(
    undefined
  );
  const issueDialog = useDialog();
  useEffect(() => {
    const interval = setInterval(pull, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4">
      <nav className="flex gap-4 justify-between">
        <h1 className="text-lg">Issues</h1>
        <button onClick={issueDialog.open}>
          <span className="sr-only">Add</span>
          <RiAddFill />
        </button>
      </nav>
      <ul className="flex flex-col gap-4">
        {issues.map((issue) => (
          <Issue key={issue.id} issue={issue} />
        ))}
      </ul>
      <IssueDialog
        issue={selectedIssue}
        refetchIssues={refetchIssues}
        dialog={issueDialog}
      />
    </div>
  );
}

function Issue({ issue }: { issue: Issue }) {
  return (
    <li className="p-4 rounded-md bg-zinc-200 dark:bg-zinc-800">
      <h2 className="text-lg font-bold">{issue.title}</h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {issue.description}
      </p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{issue.owner}</p>
    </li>
  );
}

function IssueDialog({
  issue,
  refetchIssues,
  dialog,
}: {
  issue?: Issue;
  refetchIssues: () => void;
  dialog: Dialog;
}) {
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  return (
    <dialog
      ref={dialog.ref}
      className="p-4 w-full top-8 bg-white dark:bg-zinc-900 dark:text-white max-w-2xl mx-auto shadow-lg rounded-md"
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const formData = new FormData(form);
          const title = formData.get("title") as string;
          const description = formData.get("description") as string;
          if (issue) {
            await mutate("updateIssue", {
              id: issue.id,
              title,
              description,
              // TODO: user table
              owner: "Anonymous Buffalo",
            });
          } else {
            await mutate("createIssue", {
              title,
              description,
              owner: "Anonymous Buffalo",
            });
          }
          refetchIssues();
          form.reset();
          dialog.close();
        }}
      >
        <div className="flex justify-between gap-2">
          <input
            className="text-2xl flex-1 outline-none"
            type="text"
            name="title"
            defaultValue={issue?.title}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                descriptionRef.current?.focus();
              }
            }}
          />
          <button
            type="button"
            className="px-2 py-1 rounded"
            tabIndex={1}
            onClick={dialog.close}
          >
            <span className="sr-only">Close</span>
            <RiCloseFill />
          </button>
        </div>
        <textarea
          ref={descriptionRef}
          className="text-sm h-[20rem] resize-none outline-none"
          name="description"
          defaultValue={issue?.description}
        />
        <div className="flex justify-end gap-2 text-sm">
          <button
            type="submit"
            className="px-3 py-1 bg-indigo-500 hover:bg-indigo-400 dark:bg-indigo-800 hover:dark:bg-indigo-700 transition-colors rounded"
          >
            {issue ? "Save" : "Create"}
          </button>
        </div>
      </form>
    </dialog>
  );
}

type Dialog = {
  ref: React.RefObject<HTMLDialogElement | null>;
  open: () => void;
  close: () => void;
};

function useDialog(): Dialog {
  const dialogRef = useRef<HTMLDialogElement>(null);
  return {
    ref: dialogRef,
    open: () => dialogRef.current?.showModal(),
    close: () => dialogRef.current?.close(),
  };
}
