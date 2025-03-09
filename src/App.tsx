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
  const issueDialog = useDialog();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedIssue: Issue | undefined = issues[selectedIndex];

  useEffect(() => {
    const interval = setInterval(pull, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4">
      <nav className="flex gap-4 justify-between items-center mb-4">
        <h1 className="text-lg">Issues</h1>
        <button
          onClick={() => {
            issueDialog.open();
            setSelectedIndex(issues.length);
          }}
        >
          <span className="sr-only">Add</span>
          <RiAddFill />
        </button>
      </nav>
      <ul>
        {issues.map((issue, index) => (
          <Issue
            key={issue.id}
            issue={issue}
            isSelected={selectedIssue?.id === issue.id}
            onClick={() => {
              setSelectedIndex(index);
              issueDialog.open();
            }}
            onFocus={() => {
              setSelectedIndex(index);
            }}
            onArrowUp={() => {
              if (index <= 0) return;
              setSelectedIndex(index - 1);
            }}
            onArrowDown={() => {
              if (index >= issues.length - 1) return;
              setSelectedIndex(index + 1);
            }}
          />
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

function Issue({
  issue,
  isSelected,
  onClick,
  onFocus,
  onArrowUp,
  onArrowDown,
}: {
  issue: Issue;
  isSelected: boolean;
  onClick: () => void;
  onFocus: () => void;
  onArrowUp: () => void;
  onArrowDown: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (isSelected) {
      ref.current?.focus();
    }
  }, [isSelected]);

  return (
    <li>
      <button
        ref={ref}
        type="button"
        className="flex items-center gap-4 w-full outline-none focus-visible:dark:bg-zinc-900 focus-visible:bg-zinc-100 p-3"
        onClick={onClick}
        onFocus={onFocus}
        onMouseEnter={onFocus}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") {
            e.preventDefault();
            e.stopPropagation();
            onArrowUp();
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            e.stopPropagation();
            onArrowDown();
          }
        }}
      >
        <StatusBadge status={issue.status} />
        <h2 className="font-medium">{issue.title}</h2>
      </button>
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
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
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
  }
  return (
    <dialog
      ref={dialog.ref}
      className="p-4 w-full top-8 bg-white dark:bg-zinc-900 dark:text-white max-w-2xl mx-auto shadow-lg rounded-md"
    >
      <form
        className="flex flex-col gap-2"
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.metaKey) {
            e.preventDefault();
            e.stopPropagation();
            onSubmit(e);
          }
        }}
        onSubmit={onSubmit}
      >
        <div className="flex justify-between gap-2">
          <input
            className="text-lg font-medium flex-1 p-2 outline-none"
            type="text"
            name="title"
            defaultValue={issue?.title}
            placeholder="Issue title"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                descriptionRef.current?.focus();
              }
            }}
          />
          <button
            type="button"
            className="p-2 rounded"
            tabIndex={1}
            onClick={dialog.close}
          >
            <span className="sr-only">Close</span>
            <RiCloseFill />
          </button>
        </div>
        <textarea
          ref={descriptionRef}
          className="px-2 text-sm h-[20rem] resize-none outline-none"
          name="description"
          placeholder="Add description..."
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

function StatusBadge({ status }: { status: Issue["status"] }) {
  switch (status) {
    case "not started":
    default:
      return (
        <span className="rounded-full border-2 border-zinc-300 dark:border-zinc-600 w-4 h-4">
          <span className="sr-only">Not started</span>
        </span>
      );
  }
}
