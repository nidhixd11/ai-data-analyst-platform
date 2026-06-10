/**
 * Right-hand rail. Shows an empty state until a file is uploaded;
 * after upload it'll show insight summary cards, anomalies, etc. (T-133).
 *
 * Width is fixed; on small screens it collapses (handled in Layout).
 */

interface RightRailProps {
  hasActiveData: boolean;
}

export default function RightRail({ hasActiveData }: RightRailProps) {
  if (hasActiveData) {
    // Real insight cards land in T-133. For now, just a placeholder.
    return (
      <aside className="hidden w-72 shrink-0 border-l border-[var(--color-border)] bg-[var(--color-surface)] p-6 lg:block">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          Live insights
        </p>
        <p className="mt-3 text-sm text-[var(--color-text-muted)]">
          Dashboard cards will render here once T-133 lands.
        </p>
      </aside>
    );
  }

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
