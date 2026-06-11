import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { ALLOWED_EXTENSIONS, formatFileSize, validateFile } from "./validation";
import { mockUpload, type UploadResponse } from "./mockApi";

type UploadState =
  | { kind: "idle" }
  | { kind: "hover" }
  | { kind: "validating"; file: File }
  | { kind: "uploading"; file: File }
  | { kind: "ready"; file: File; result: UploadResponse }
  | { kind: "error"; file?: File; message: string };

interface UploadZoneProps {
  onUploadComplete?: (result: UploadResponse, file: File) => void;
}

export default function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [state, setState] = useState<UploadState>({ kind: "idle" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setState({ kind: "validating", file });
    const result = validateFile(file);
    if (!result.ok) {
      setState({
        kind: "error",
        file,
        message: result.message ?? "Invalid file.",
      });
      return;
    }

    setState({ kind: "uploading", file });
    try {
      const response = await mockUpload(file);
      setState({ kind: "ready", file, result: response });
      onUploadComplete?.(response, file);
    } catch {
      setState({
        kind: "error",
        file,
        message: "Upload failed. Please try again.",
      });
    }
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
    event.target.value = "";
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function onDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (state.kind === "idle" || state.kind === "hover") {
      setState({ kind: "hover" });
    }
  }

  function onDragLeave() {
    if (state.kind === "hover") setState({ kind: "idle" });
  }

  function resetToIdle() {
    setState({ kind: "idle" });
  }

  const isInteractive =
    state.kind === "idle" || state.kind === "hover" || state.kind === "error";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 px-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => isInteractive && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (isInteractive && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={[
          "w-full rounded-2xl border-2 border-dashed px-8 py-14 text-center transition",
          state.kind === "hover"
            ? "border-[var(--color-accent)] bg-[var(--color-surface)]"
            : "border-[var(--color-border)] bg-[var(--color-surface)]",
          isInteractive
            ? "cursor-pointer hover:border-[var(--color-accent)]"
            : "cursor-default opacity-90",
        ].join(" ")}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_EXTENSIONS.join(",")}
          onChange={onInputChange}
          className="hidden"
        />
        <UploadContent state={state} onReset={resetToIdle} />
      </div>
      <p className="text-xs text-[var(--color-text-muted)]">
        .csv · .xlsx · .xls · Max 50 MB · UTF-8 recommended
      </p>
    </div>
  );
}

function UploadContent({
  state,
  onReset,
}: {
  state: UploadState;
  onReset: () => void;
}) {
  if (state.kind === "uploading") {
    return (
      <div className="flex flex-col items-center gap-3">
        <CloudIcon />
        <p className="text-sm font-medium">Processing {state.file.name}…</p>
        <Spinner />
        <p className="text-xs text-[var(--color-text-muted)]">
          Parsing schema and computing stats
        </p>
      </div>
    );
  }

  if (state.kind === "ready") {
    return (
      <div className="flex flex-col items-center gap-3">
        <CheckIcon />
        <p className="text-base font-semibold">Ready to analyse</p>
        <p className="text-sm text-[var(--color-text-muted)]">
          {state.file.name} · {formatFileSize(state.file.size)} ·{" "}
          {state.result.schema.rows.toLocaleString()} rows ·{" "}
          {state.result.schema.columns} columns
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onReset();
          }}
          className="mt-2 text-xs font-medium text-[var(--color-accent)] hover:underline"
        >
          Upload a different file
        </button>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="flex flex-col items-center gap-3">
        <AlertIcon />
        <p className="text-base font-semibold">Couldn't use that file</p>
        <p className="max-w-sm text-sm text-[var(--color-text-muted)]">
          {state.message}
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onReset();
          }}
          className="mt-2 text-xs font-medium text-[var(--color-accent)] hover:underline"
        >
          Try another file
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <CloudIcon />
      <p className="text-base font-semibold tracking-tight">
        Drop your CSV or Excel file to get started
      </p>
      <p className="max-w-sm text-sm text-[var(--color-text-muted)]">
        Data Insights Chatbot will analyse, clean, and visualise your data in
        seconds.
      </p>
      <button
        type="button"
        className="mt-2 rounded-full bg-[var(--color-accent)] px-5 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-accent-hover)]"
      >
        Browse files
      </button>
    </div>
  );
}

function CloudIcon() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--color-accent)_18%,transparent)]">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 text-[var(--color-accent)]"
      >
        <path d="M16 16l-4-4-4 4" />
        <path d="M12 12v9" />
        <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
      </svg>
    </div>
  );
}

function CheckIcon() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--color-accent)_18%,transparent)]">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 text-[var(--color-accent)]"
      >
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </div>
  );
}

function AlertIcon() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_oklab,#EF4444_18%,transparent)]">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 text-[#EF4444]"
      >
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    </div>
  );
}

function Spinner() {
  return (
    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]" />
  );
}
