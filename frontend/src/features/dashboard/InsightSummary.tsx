import type { UploadResponse } from "../upload/mockApi";

interface InsightSummaryProps {
  result: UploadResponse;
}

const REVENUE_KEYWORDS = ["revenue", "sales", "profit", "amount", "price", "income", "earnings", "turnover", "salary", "cost", "spend", "budget"];

export default function InsightSummary({ result }: InsightSummaryProps) {
  const healthScore =
    result.null_percentage === 0 && result.duplicate_rows === 0
      ? "Excellent"
      : result.null_percentage < 10 && result.duplicate_rows < 5
        ? "Good"
        : "Needs Review";

  const healthColor =
    healthScore === "Excellent"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100"
      : healthScore === "Good"
        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-100"
        : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100";

  const formatColor =
    result.detected_format === "csv"
      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100"
      : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100";

  const revenueColumnName = result.schema.columns_detail.find(
    (c) =>
      (c.dtype === "int" || c.dtype === "float") &&
      REVENUE_KEYWORDS.some((k) => c.name.toLowerCase().includes(k))
  )?.name;

  const revenueStats = revenueColumnName
    ? result.column_statistics[revenueColumnName]
    : undefined;

  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="text-[var(--color-accent)]">✦</span>
          <h3 className="text-base font-semibold tracking-tight">
            Live Insight Summary
          </h3>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-600 font-medium">Live</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${formatColor}`}>
            {result.detected_format.toUpperCase()}
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${healthColor}`}>
            {healthScore}
          </span>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-3">
        {revenueColumnName && revenueStats ? (
          <RevenueKpis columnName={revenueColumnName} stats={revenueStats} rows={result.schema.rows} />
        ) : (
          <GenericKpis result={result} />
        )}
      </div>

      {/* AI Summary paragraph */}
      <div className="border-t border-[var(--color-border)] px-5 py-4">
        <p className="text-sm leading-relaxed text-[var(--color-text)]">
          {result.ai_summary}
        </p>
      </div>

    </article>
  );
}

function RevenueKpis({
  columnName,
  stats,
  rows,
}: {
  columnName: string;
  stats: { mean: number | null; std: number | null; minimum: number | null; maximum: number | null };
  rows: number;
}) {
  const total = stats.mean !== null ? stats.mean * rows : null;
  const volatility =
    stats.std !== null && stats.mean !== null && stats.mean !== 0
      ? (stats.std / Math.abs(stats.mean)) * 100
      : null;

  return (
    <>
      <KpiCard
        label={`Total ${columnName}`}
        value={total !== null ? formatCompactNumber(total) : "—"}
        tag={{ label: "Est. total", color: "text-[var(--color-text-muted)]" }}
      />
      <KpiCard
        label="Average"
        value={stats.mean !== null ? formatCompactNumber(stats.mean) : "—"}
        tag={{ label: "Per row", color: "text-[var(--color-text-muted)]" }}
      />
      <KpiCard
        label="Volatility"
        value={volatility !== null ? `${volatility.toFixed(1)}%` : "—"}
        tag={
          volatility !== null && volatility > 30
            ? { label: "High", color: "text-amber-600 dark:text-amber-400" }
            : { label: "Stable", color: "text-emerald-600 dark:text-emerald-400" }
        }
      />
    </>
  );
}

function GenericKpis({ result }: { result: UploadResponse }) {
  const completeness = 100 - result.null_percentage;
  const uniqueness =
    result.schema.rows > 0
      ? ((result.schema.rows - result.duplicate_rows) / result.schema.rows) * 100
      : 100;

  return (
    <>
      <KpiCard
        label="Dataset Size"
        value={result.schema.rows.toLocaleString()}
        tag={{ label: `${result.schema.columns} columns`, color: "text-[var(--color-text-muted)]" }}
      />
      <KpiCard
        label="Completeness"
        value={`${completeness.toFixed(1)}%`}
        tag={
          completeness === 100
            ? { label: "No gaps", color: "text-emerald-600 dark:text-emerald-400" }
            : { label: "Has gaps", color: "text-amber-600 dark:text-amber-400" }
        }
      />
      <KpiCard
        label="Uniqueness"
        value={`${uniqueness.toFixed(1)}%`}
        tag={
          result.duplicate_rows === 0
            ? { label: "No duplicates", color: "text-emerald-600 dark:text-emerald-400" }
            : { label: `${result.duplicate_rows} dupes`, color: "text-amber-600 dark:text-amber-400" }
        }
      />
    </>
  );
}

function KpiCard({
  label,
  value,
  tag,
}: {
  label: string;
  value: string;
  tag: { label: string; color: string };
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
      <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      <p className={`mt-1 text-xs font-medium ${tag.color}`}>{tag.label}</p>
    </div>
  );
}

function formatCompactNumber(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}