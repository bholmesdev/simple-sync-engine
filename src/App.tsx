import { useEffect, useRef, useState } from "react";
import { RiAddFill, RiCheckFill, RiCloseFill } from "@remixicon/react";
import type { Issue, IssueStatus } from "./types";
import { pull, useMigrations, useQuery, mutate } from "./lib/client";

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
    pull();
    const interval = setInterval(pull, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-4">
      <nav className="flex gap-4 items-center mb-4 px-5">
        <h1 className="text-lg">Issues</h1>
        <button
          className="ml-auto"
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
        {issues.map((issue: Issue, index: number) => (
          <IssueRow
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
            refetchIssues={refetchIssues}
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

function IssueRow({
  issue,
  isSelected,
  onClick,
  onFocus,
  onArrowUp,
  onArrowDown,
  refetchIssues,
}: {
  issue: Issue;
  isSelected: boolean;
  onClick: () => void;
  onFocus: () => void;
  onArrowUp: () => void;
  onArrowDown: () => void;
  refetchIssues: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (isSelected) {
      ref.current?.focus();
    }
  }, [isSelected]);

  return (
    <li className="flex items-center text-sm gap-4 w-full outline-none focus-within:dark:bg-zinc-900 focus-within:bg-zinc-100 px-3 pr-6">
      <StatusToggle
        issueId={issue.id}
        status={issue.status}
        refetchIssues={refetchIssues}
        showLabel={false}
      />
      <button
        ref={ref}
        className="flex-1 flex items-center gap-2 outline-none py-3 justify-between"
        type="button"
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
        <h2 className="font-medium">{issue.title}</h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          {new Date(issue.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </p>
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
        createdAt: Date.now(),
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
            required
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
          className="px-2 sm:h-[20rem] h-[10rem] resize-none outline-none"
          name="description"
          placeholder="Add description..."
          defaultValue={issue?.description}
        />
        <div className="flex items-center gap-2 text-sm">
          {issue && (
            <StatusToggle
              issueId={issue.id}
              status={issue.status}
              refetchIssues={refetchIssues}
            />
          )}
          <div
            className="flex items-center gap-2 ml-auto"
            aria-labelledby="save-button save-shortcut"
          >
            <kbd className="text-xs  px-2 py-px rounded" id="save-shortcut">
              ⌘ + Enter
            </kbd>
            <button
              id="save-button"
              type="submit"
              className="px-3 py-1 bg-indigo-500 hover:bg-indigo-400 dark:bg-indigo-800 hover:dark:bg-indigo-700 transition-colors rounded flex items-center gap-2 text-white"
            >
              {issue ? "Save" : "Create"}
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}

const statusOrder: IssueStatus[] = ["not started", "in progress", "done"];

function StatusToggle({
  issueId,
  status,
  refetchIssues,
  showLabel = true,
}: {
  issueId: number;
  status: IssueStatus;
  refetchIssues: () => void;
  showLabel?: boolean;
}) {
  return (
    <button
      type="button"
      className="flex items-center p-2 gap-2"
      onClick={async () => {
        const index = statusOrder.indexOf(status);
        const nextIndex = (index + 1) % statusOrder.length;
        await mutate("updateIssueStatus", {
          id: issueId,
          status: statusOrder[nextIndex],
        });
        refetchIssues();
      }}
    >
      <div className="flex items-center justify-center gap-2 w-5 h-5">
        <StatusBadge status={status} />
      </div>
      {showLabel && (
        <span className="dark:text-zinc-200 text-zinc-800">
          {getStatusLabel(status)}
        </span>
      )}
    </button>
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

function StatusBadge({ status }: { status: IssueStatus }) {
  switch (status) {
    case "not started":
      return (
        <div className="rounded-full border-2 border-zinc-300 dark:border-zinc-600 w-4 h-4">
          <span className="sr-only">{getStatusLabel(status)}</span>
        </div>
      );
    case "in progress":
      return (
        <div className="rounded-full outline-2 outline-yellow-400 w-2 h-2 bg-gradient-to-l from-yellow-400 from-50% to-transparent to-50% outline-offset-2">
          <span className="sr-only">{getStatusLabel(status)}</span>
        </div>
      );
    case "done":
      return (
        <div className="rounded-full bg-indigo-500 dark:text-zinc-950 text-white w-4 h-4 flex items-center justify-center">
          <RiCheckFill className="w-3 h-3" />
          <span className="sr-only">{getStatusLabel(status)}</span>
        </div>
      );
  }
}

function getStatusLabel(status: IssueStatus) {
  switch (status) {
    case "not started":
      return "Not started";
    case "in progress":
      return "In progress";
    case "done":
      return "Done";
  }
}
