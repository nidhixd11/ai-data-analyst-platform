import type {
  UploadResponse,
  ColumnStatistics,
} from "../features/upload/mockApi.ts";
import type { Session } from "../features/sessions/sessionStorage";

interface RightRailProps {
  hasActiveData: boolean;
  result?: UploadResponse;
  sessions: Session[];
  onSelectSession: (id: string) => void;
  currency: "USD" | "INR";
  onCurrencyChange: (c: "USD" | "INR") => void;
}

const USD_TO_INR = 84;

const REVENUE_KEYWORDS = [
  "revenue", "sales", "profit", "amount", "price",
  "income", "earnings", "turnover", "salary", "cost", "spend", "budget",
];
const CATEGORY_KEYWORDS = [
  "region", "category", "department", "product", "segment",
  "type", "country", "city", "team", "channel", "brand",
];

function detectColumns(result: UploadResponse) {
  const columns = result.schema.columns_detail;

  const revenueColumns = columns.filter(
    (c) =>
      (c.dtype === "int" || c.dtype === "float") &&
      REVENUE_KEYWORDS.some((k) => c.name.toLowerCase().includes(k)),
  );

  const categoryColumns = columns.filter(
    (c) =>
      c.dtype === "string" &&
      CATEGORY_KEYWORDS.some((k) => c.name.toLowerCase().includes(k)),
  );

  const isBusinessDataset = revenueColumns.length > 0;

  return { revenueColumns, categoryColumns, isBusinessDataset };
}

export default function RightRail({
  hasActiveData,
  result,
  sessions,
  onSelectSession,
  currency,
  onCurrencyChange,
}: RightRailProps) {
  if (hasActiveData && result) {
    return (
      <ActiveRail
        result={result}
        sessions={sessions}
        onSelectSession={onSelectSession}
        currency={currency}
        onCurrencyChange={onCurrencyChange}
      />
    );
  }
  return <EmptyRail />;
}

function ActiveRail({
  result,
  sessions,
  onSelectSession,
  currency,
  onCurrencyChange,
}: {
  result: UploadResponse;
  sessions: Session[];
  onSelectSession: (id: string) => void;
  currency: "USD" | "INR";
  onCurrencyChange: (c: "USD" | "INR") => void;
}) {
  const { revenueColumns, categoryColumns, isBusinessDataset } = detectColumns(result);
  const uniqueFiles = dedupeByFilename(sessions);

  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-4 overflow-auto border-l border-[var(--color-border)] bg-[var(--color-surface)] p-5 lg:flex">
      {isBusinessDataset ? (
        <BusinessRail
          result={result}
          revenueColumns={revenueColumns.map((c) => c.name)}
          categoryColumns={categoryColumns.map((c) => c.name)}
          currency={currency}
          onCurrencyChange={onCurrencyChange}
        />
      ) : (
        <GenericRail result={result} />
      )}

      {/* Dataset Health — always shown */}
      <Card label="Dataset Health">
        <div className="space-y-2.5">
          <HealthRow
            label="Missing Values"
            ok={result.null_percentage === 0}
            warn={result.null_percentage > 0 && result.null_percentage < 10}
            value={
              result.null_percentage === 0
                ? "None detected"
                : `${result.null_percentage?.toFixed(1) ?? "N/A"}%`
            }
          />
          <HealthRow
            label="Duplicate Rows"
            ok={result.duplicate_rows === 0}
            warn={false}
            value={
              result.duplicate_rows === 0
                ? "None detected"
                : (result.duplicate_rows?.toString() ?? "N/A")
            }
          />
          <HealthRow
            label="Memory Usage"
            ok={result.memory_mb < 50}
            warn={result.memory_mb >= 50 && result.memory_mb < 100}
            value={`${result.memory_mb?.toFixed(2) ?? "N/A"} MB`}
          />
        </div>
      </Card>

      {/* Uploaded Files */}
      <Card label="Uploaded Files">
        {uniqueFiles.length === 0 ? (
          <p className="text-xs text-[var(--color-text-muted)]">
            Your uploaded files will appear here.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {uniqueFiles.map((session) => (
              <li key={session.id}>
                <button
                  type="button"
                  onClick={() => onSelectSession(session.id)}
                  className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs text-[var(--color-text-muted)] transition hover:bg-[color-mix(in_oklab,var(--color-text-muted)_6%,transparent)] hover:text-[var(--color-text)]"
                >
                  <FileIcon />
                  <span className="truncate" title={session.filename}>
                    {session.filename}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </aside>
  );
}

/* ─── Business Dataset Rail ─── */

function BusinessRail({
  result,
  revenueColumns,
  categoryColumns,
  currency,
  onCurrencyChange,
}: {
  result: UploadResponse;
  revenueColumns: string[];
  categoryColumns: string[];
  currency: "USD" | "INR";
  onCurrencyChange: (c: "USD" | "INR") => void;
}) {
  const rows = result.schema.rows;
  const rate = currency === "INR" ? USD_TO_INR : 1;

  return (
    <>
      <Card label="Key Metrics">
        {/* Currency toggle */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs text-[var(--color-text-muted)]">Values in</span>
          <div className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] p-0.5">
            {(["USD", "INR"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onCurrencyChange(c)}
                className={[
                  "rounded-md px-2 py-0.5 text-xs font-medium transition",
                  currency === c
                    ? "bg-[var(--color-accent)] text-white"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
                ].join(" ")}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {revenueColumns.slice(0, 3).map((colName) => {
            const stats = result.column_statistics[colName];
            if (!stats) return null;
            const total = stats.mean !== null ? stats.mean * rows * rate : null;
            return (
              <KpiBlock
                key={colName}
                label={colName}
                total={total}
                mean={stats.mean !== null ? stats.mean * rate : null}
                min={stats.minimum !== null ? stats.minimum * rate : null}
                max={stats.maximum !== null ? stats.maximum * rate : null}
                rows={rows}
                currency={currency}
              />
            );
          })}
        </div>
      </Card>

      {categoryColumns.length > 0 && result.preview.length > 0 && (
        <Card label="Top Categories">
          <CategoryDistribution
            preview={result.preview}
            categoryCol={categoryColumns[0]}
            valueCol={revenueColumns[0]}
          />
        </Card>
      )}
    </>
  );
}

function KpiBlock({
  label, total, mean, min, max, rows, currency,
}: {
  label: string;
  total: number | null;
  mean: number | null;
  min: number | null;
  max: number | null;
  rows: number;
  currency: "USD" | "INR";
}) {
  const symbol = currency === "INR" ? "₹" : "$";

  const fmt = (v: number | null) => {
    if (v === null) return "—";
    if (Math.abs(v) >= 10_000_000) return `${symbol}${(v / 10_000_000).toFixed(1)}Cr`;
    if (Math.abs(v) >= 100_000) return `${symbol}${(v / 100_000).toFixed(1)}L`;
    if (Math.abs(v) >= 1_000) return `${symbol}${(v / 1_000).toFixed(1)}K`;
    return `${symbol}${v.toFixed(2)}`;
  };

  const range = max !== null && min !== null ? max - min : null;
  const meanPosition =
    range && mean !== null && min !== null && range > 0
      ? ((mean - min) / range) * 100
      : null;

  return (
    <div className="rounded-lg border border-[var(--color-border)] p-3">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        {label}
      </p>

      {total !== null && (
        <p className="text-xl font-bold tabular-nums">
          {fmt(total)}
          <span className="ml-1 text-xs font-normal text-[var(--color-text-muted)]">
            est. total
          </span>
        </p>
      )}

      <div className="mt-2 grid grid-cols-3 gap-1 text-center text-xs text-[var(--color-text-muted)]">
        <div>
          <p className="font-medium text-[var(--color-text)]">{fmt(min)}</p>
          <p>Min</p>
        </div>
        <div>
          <p className="font-medium text-[var(--color-accent)]">{fmt(mean)}</p>
          <p>Avg</p>
        </div>
        <div>
          <p className="font-medium text-[var(--color-text)]">{fmt(max)}</p>
          <p>Max</p>
        </div>
      </div>

      {meanPosition !== null && (
        <div className="relative mt-2 h-1.5 w-full rounded-full bg-[var(--color-border)]">
          <div
            className="absolute top-0 h-1.5 rounded-full bg-[var(--color-accent)] opacity-30"
            style={{ width: `${meanPosition}%` }}
          />
          <div
            className="absolute top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[var(--color-accent)]"
            style={{ left: `${meanPosition}%` }}
          />
        </div>
      )}

      <p className="mt-1.5 text-right text-xs text-[var(--color-text-muted)]">
        across {rows.toLocaleString()} rows
      </p>
    </div>
  );
}

function CategoryDistribution({
  preview, categoryCol, valueCol,
}: {
  preview: Record<string, unknown>[];
  categoryCol: string;
  valueCol: string;
}) {
  const totals: Record<string, number> = {};
  for (const row of preview) {
    const cat = String(row[categoryCol] ?? "Unknown");
    const val = Number(row[valueCol] ?? 0);
    totals[cat] = (totals[cat] ?? 0) + val;
  }

  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const grandTotal = entries.reduce((s, [, v]) => s + v, 0);

  if (entries.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="mb-2 text-xs text-[var(--color-text-muted)]">
        Based on {preview.length} preview rows
      </p>
      {entries.slice(0, 5).map(([cat, val]) => {
        const pct = grandTotal > 0 ? (val / grandTotal) * 100 : 0;
        return (
          <div key={cat}>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium truncate max-w-[120px]">{cat}</span>
              <span className="tabular-nums text-[var(--color-text-muted)]">
                {pct.toFixed(1)}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[var(--color-border)]">
              <div
                className="h-1.5 rounded-full bg-[var(--color-accent)]"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Generic Dataset Rail ─── */

function GenericRail({ result }: { result: UploadResponse }) {
  const hasStats = Object.keys(result.column_statistics || {}).length > 0;

  return (
    <>
      <Card label="Dataset Overview">
        <div className="space-y-2.5 text-sm">
          <OverviewRow label="Rows" value={result.schema.rows.toLocaleString()} />
          <OverviewRow label="Columns" value={result.schema.columns.toString()} />
          <OverviewRow label="Memory" value={`${result.memory_mb?.toFixed(2) ?? "N/A"} MB`} />
          <OverviewRow label="Numeric Columns" value={result.numeric_columns?.toString() ?? "N/A"} />
        </div>
      </Card>

      {hasStats && (
        <Card label="Column Statistics">
          <div className="space-y-4">
            {Object.entries(result.column_statistics).map(([name, stats]) => (
              <StatBlock key={name} name={name} stats={stats} />
            ))}
          </div>
        </Card>
      )}
    </>
  );
}

function StatBlock({ name, stats }: { name: string; stats: ColumnStatistics }) {
  const range =
    stats.maximum !== null && stats.minimum !== null
      ? stats.maximum - stats.minimum
      : null;

  const meanPosition =
    range && stats.mean !== null && stats.minimum !== null && range > 0
      ? ((stats.mean - stats.minimum) / range) * 100
      : null;

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold">{name}</p>
      <div className="grid grid-cols-3 gap-1 text-center text-xs text-[var(--color-text-muted)]">
        <div>
          <p className="font-medium text-[var(--color-text)]">
            {stats.minimum?.toFixed(1) ?? "—"}
          </p>
          <p>Min</p>
        </div>
        <div>
          <p className="font-medium text-[var(--color-accent)]">
            {stats.mean?.toFixed(1) ?? "—"}
          </p>
          <p>Mean</p>
        </div>
        <div>
          <p className="font-medium text-[var(--color-text)]">
            {stats.maximum?.toFixed(1) ?? "—"}
          </p>
          <p>Max</p>
        </div>
      </div>
      {meanPosition !== null && (
        <div className="relative mt-2 h-1.5 w-full rounded-full bg-[var(--color-border)]">
          <div
            className="absolute top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[var(--color-accent)]"
            style={{ left: `${meanPosition}%` }}
          />
        </div>
      )}
    </div>
  );
}

/* ─── Shared components ─── */

function OverviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[var(--color-text-muted)]">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}

function HealthRow({
  label, value, ok, warn,
}: {
  label: string;
  value: string;
  ok: boolean;
  warn: boolean;
}) {
  const color = ok ? "text-green-600" : warn ? "text-yellow-600" : "text-red-500";
  const icon = ok ? "✓" : warn ? "⚠" : "✗";

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[var(--color-text-muted)]">{label}</span>
      <span className={`text-sm font-medium ${color}`}>
        {icon} {value}
      </span>
    </div>
  );
}

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        {label}
      </p>
      {children}
    </section>
  );
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

function FileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 shrink-0 text-[var(--color-text-muted)]"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function dedupeByFilename(sessions: Session[]): Session[] {
  const seen = new Set<string>();
  const result: Session[] = [];
  for (const s of sessions) {
    if (!seen.has(s.filename)) {
      seen.add(s.filename);
      result.push(s);
    }
  }
  return result;
}
