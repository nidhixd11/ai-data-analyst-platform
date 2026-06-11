import {
  getMockRailInsights,
  type AnomalyFlag,
  type KPIRow,
  type MarketShareSlice,
} from "../features/dashboard/mockInsights";

interface RightRailProps {
  hasActiveData: boolean;
}

/**
 * Right-hand rail. Shows an empty state until a file is uploaded;
 * after upload it shows insight summary cards (T-133 Part 2B).
 */
export default function RightRail({ hasActiveData }: RightRailProps) {
  if (hasActiveData) return <ActiveRail />;
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

function ActiveRail() {
  const insights = getMockRailInsights();
  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-4 overflow-auto border-l border-[var(--color-border)] bg-[var(--color-surface)] p-5 lg:flex">
      <MarketShareCard
        headline={insights.marketShare.headline}
        headlinePct={insights.marketShare.headlinePct}
        slices={insights.marketShare.slices}
      />
      <TopRegionCard
        name={insights.topRegion.name}
        revenue={insights.topRegion.revenue}
        note={insights.topRegion.note}
      />
      <LiveKpisCard rows={insights.liveKpis} />
      <AnomalyFlagsCard flags={insights.anomalies} />
    </aside>
  );
}

function MarketShareCard({
  headline,
  headlinePct,
  slices,
}: {
  headline: string;
  headlinePct: number;
  slices: MarketShareSlice[];
}) {
  return (
    <Card label="Market Share">
      <div className="flex flex-col items-center gap-3">
        <DonutChart headline={headline} percentage={headlinePct} />
        <ul className="flex w-full flex-col gap-1.5 text-xs">
          {slices.map((slice) => (
            <li key={slice.label} className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[var(--color-text-muted)]">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: slice.color }}
                />
                {slice.label}
              </span>
              <span className="font-medium tabular-nums">
                {slice.percentage}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function TopRegionCard({
  name,
  revenue,
  note,
}: {
  name: string;
  revenue: string;
  note: string;
}) {
  return (
    <Card label="Top Region">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold tracking-tight">{name}</p>
        <p className="text-sm font-medium tabular-nums text-[var(--color-accent)]">
          {revenue}
        </p>
      </div>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">{note}</p>
    </Card>
  );
}

function LiveKpisCard({ rows }: { rows: KPIRow[] }) {
  return (
    <Card label="Live KPIs">
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-[var(--color-text-muted)]">
                {row.label}
              </span>
              <span className="text-xs font-semibold tabular-nums">
                {row.value}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--color-border)]">
              <div
                className="h-full rounded-full bg-[var(--color-accent)]"
                style={{ width: `${row.fillPct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AnomalyFlagsCard({ flags }: { flags: AnomalyFlag[] }) {
  return (
    <Card label="Anomaly Flags">
      <div className="flex flex-col gap-2">
        {flags.map((flag) => (
          <AnomalyRow key={flag.title} flag={flag} />
        ))}
      </div>
    </Card>
  );
}

function AnomalyRow({ flag }: { flag: AnomalyFlag }) {
  const palette =
    flag.severity === "critical"
      ? { fg: "#EF4444", icon: <AlertIcon /> }
      : { fg: "#F59E0B", icon: <ClockIcon /> };

  return (
    <div
      className="flex items-start gap-2.5 rounded-lg p-2.5"
      style={{
        backgroundColor: `color-mix(in oklab, ${palette.fg} 10%, transparent)`,
      }}
    >
      <div style={{ color: palette.fg }}>{palette.icon}</div>
      <div className="flex flex-col">
        <p className="text-xs font-semibold" style={{ color: palette.fg }}>
          {flag.title}
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">{flag.detail}</p>
      </div>
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

function DonutChart({
  headline,
  percentage,
}: {
  headline: string;
  percentage: number;
}) {
  const filled = `var(--color-accent) 0deg ${(percentage / 100) * 360}deg`;
  const rest = `color-mix(in oklab, var(--color-accent) 18%, transparent) ${(percentage / 100) * 360}deg 360deg`;
  return (
    <div
      className="relative flex h-28 w-28 items-center justify-center rounded-full"
      style={{ background: `conic-gradient(${filled}, ${rest})` }}
    >
      <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-[var(--color-bg)]">
        <span className="text-xl font-semibold tabular-nums">{headline}</span>
        <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
          Overall
        </span>
      </div>
    </div>
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

function AlertIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
