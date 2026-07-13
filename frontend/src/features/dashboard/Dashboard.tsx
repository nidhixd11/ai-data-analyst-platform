import type { UploadResponse } from "../upload/mockApi";
import InsightSummary from "./InsightSummary";
import SchemaTable from "./SchemaTable";
import TrendChart from "./TrendChart";

interface DashboardProps {
  result: UploadResponse;
  filename: string;
  onReset: () => void;
  currency: "USD" | "INR";
  onCurrencyChange: (c: "USD" | "INR") => void;
}

/**
 * Post-upload view. Renders:
 *  - Header strip (filename + reset)
 *  - Three stat tiles (rows / columns / detected format)
 *  - AI Dataset Summary (InsightSummary)
 *  - Auto-generated chart (TrendChart)
 *  - Schema table
 */
export default function Dashboard({
  result,
  filename,
  onReset,
  currency,
  onCurrencyChange,
}: DashboardProps) {
  return (
    <div className="flex flex-col gap-6">
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
      <TrendChart
        chart={result.charts?.[0]}
        currency={currency}
        onCurrencyChange={onCurrencyChange}
      />

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
  const formatLabel = detectedFormat.toUpperCase();
  const formatColor =
    detectedFormat === "csv"
      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100"
      : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100";

  return (
    <header className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <FileIcon />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold tracking-tight">
              {filename}
            </span>
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${formatColor}`}
            >
              {formatLabel}
            </span>
          </div>
          <span className="text-xs text-[var(--color-text-muted)]">
            Ready for analysis
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