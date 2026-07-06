
import type { UploadResponse } from "../features/upload/mockApi.ts";

interface RightRailProps {
  hasActiveData: boolean;
  result?: UploadResponse;
}

/**
 * Right-hand rail. Shows an empty state until a file is uploaded;
 * after upload it shows insight summary cards (T-133 Part 2B).
 */
export default function RightRail({
  hasActiveData,
  result,
}: RightRailProps) {
  if (hasActiveData && result) {
    return <ActiveRail result={result} />;
  };
  return <EmptyRail />;
}

function EmptyRail() {
  return (
    <aside className="hidden w-72 shrink-0 flex-col items-center justify-center border-l border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center lg:flex">
      <EmptyIcon />
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        No active data
      </p>
      <p className="mt-2 max-w-[14rem] text-sm text-[var(--color-text-muted)]">
        Insights will appear here once a file is processed.
      </p>
    </aside>
  );
}

function ActiveRail({
  result,
}: {
  result: UploadResponse;
}) {
  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-4 overflow-auto border-l border-[var(--color-border)] bg-[var(--color-surface)] p-5 lg:flex">
      <Card label="Dataset Overview">
        <div className="space-y-3 text-sm">

          <div className="flex justify-between">
            <span>Rows</span>
            <span>{result.schema.rows}</span>
          </div>

          <div className="flex justify-between">
            <span>Columns</span>
            <span>{result.schema.columns}</span>
          </div>

          <div className="flex justify-between">
            <span>Memory Usage</span>
            <span>{result.memory_mb.toFixed(2)} MB</span>
          </div>

          <div className="flex justify-between">
            <span>Missing Values</span>
            <span>{result.null_percentage.toFixed(1)}%</span>
          </div>

          <div className="flex justify-between">
            <span>Duplicate Rows</span>
            <span>{result.duplicate_rows}</span>
          </div>

          <div className="flex justify-between">
            <span>Numeric Columns</span>
            <span>{result.numeric_columns}</span>
          </div>

        </div>
      </Card>

      <Card label="Dataset Health">

        <div className="space-y-3">

          <HealthRow
            label="Missing Values"
            ok={result.null_percentage < 5}
            value={
              result.null_percentage === 0
                ? "None detected"
                : `${result.null_percentage.toFixed(1)}%`
            }
          />

          <HealthRow
            label="Duplicate Rows"
            ok={result.duplicate_rows === 0}
            value={
              result.duplicate_rows === 0
                ? "None detected"
                : result.duplicate_rows.toString()
            }
          />

          <HealthRow
            label="Memory Usage"
            ok={result.memory_mb < 100}
            value={`${result.memory_mb.toFixed(2)} MB`}
          />

        </div>

      </Card>
    </aside>
  );
}


function HealthRow({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div className="flex justify-between items-center">

      <span className="text-sm">{label}</span>

      <span
        className={`font-medium ${ok ? "text-green-600" : "text-yellow-600"
          }`}
      >
        {ok ? "✓" : "⚠"} {value}
      </span>

    </div>
  );
}
function Card({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        {label}
      </p>
      {children}
    </section>
  );
}

function EmptyIcon() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--color-text-muted)_15%,transparent)]">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 text-[var(--color-text-muted)]"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 10h18" />
        <path d="M9 4v16" />
      </svg>
    </div>
  );
}

