import type { UploadResponse } from "../upload/mockApi";
import InsightSummary from "./InsightSummary";
import SchemaTable from "./SchemaTable";
import TrendChart from "./TrendChart";

interface DashboardProps {
  result: UploadResponse;
  filename: string;
  onReset: () => void;
}

/**
 * Post-upload view. Renders:
 *  - Header strip (filename + reset)
 *  - Three stat tiles (rows / columns / detected format)
 *  - Live Insight Summary card (T-133 Part 2A)
 *  - Revenue Trend chart placeholder (T-133 Part 2A)
 *  - Schema table
 */
export default function Dashboard({
  result,
  filename,
  onReset,
}: DashboardProps) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <HeaderStrip
        filename={filename}
        detectedFormat={result.detected_format}
        onReset={onReset}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Rows" value={result.schema.rows.toLocaleString()} />
        <StatTile label="Columns" value={result.schema.columns.toString()} />
        <StatTile
          label="Detected format"
          value={result.detected_format.toUpperCase()}
        />
      </div>

      <InsightSummary result={result} />
      <TrendChart />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          Schema
        </h2>
        <SchemaTable columns={result.schema.columns_detail} />
      </section>
    </div>
  );
}

function HeaderStrip({
  filename,
  detectedFormat,
  onReset,
}: {
  filename: string;
  detectedFormat: string;
  onReset: () => void;
}) {
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <FileIcon />
        <div className="flex flex-col">
          <span className="text-base font-semibold tracking-tight">
            {filename}
          </span>
          <span className="text-xs text-[var(--color-text-muted)]">
            Parsed as {detectedFormat.toUpperCase()} · ready for analysis
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="rounded-full border border-[var(--color-border)] px-4 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
      >
        Upload a different file
      </button>
    </header>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
    </div>
  );
}

function FileIcon() {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[color-mix(in_oklab,var(--color-accent)_18%,transparent)]">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 text-[var(--color-accent)]"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="14" x2="15" y2="14" />
        <line x1="9" y1="18" x2="13" y2="18" />
      </svg>
    </div>
  );
}
