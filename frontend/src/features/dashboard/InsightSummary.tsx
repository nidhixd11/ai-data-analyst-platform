import type { UploadResponse } from "../upload/mockApi";

interface InsightSummaryProps {
  result: UploadResponse;
}

/**
 * "Live Insight Summary" card — AI-generated analysis preview.
 * Status tags on the right indicate freshness and any flagged areas.
 *
 * For now the body text is mocked; real insights come from the LLM
 * once T-121 (auto-insight generator) is wired in.
 */
export default function InsightSummary({ result }: InsightSummaryProps) {
  // Mock primary stat from the response — the LLM will replace this later.
  const mockStats = {
    totalRevenue: "$4.28M",
    momGrowth: "18.2%",
    forecastDeviation: "-1.4%",
    liftPct: "4.2%",
  };

  return (
    <article className="overflow-hidden rounded-2xl border-l-4 border-l-[var(--color-accent)] bg-[var(--color-surface)] shadow-sm">
      <div className="flex flex-col items-start gap-3 border-b border-[var(--color-border)] px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex items-center gap-2">
          <SparkIcon />
          <h3 className="text-base font-semibold tracking-tight">
            Live Insight Summary
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusTag tone="success" label="Live" dot />
          <StatusTag tone="warning" label="APAC Volatility" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-3">
        <Metric
          label="Total Revenue"
          value={mockStats.totalRevenue}
          delta="+12.4% vs prev."
          deltaTone="success"
        />
        <Metric
          label="MoM Growth"
          value={mockStats.momGrowth}
          delta="Above target"
          deltaTone="accent"
        />
        <Metric
          label="Forecast Deviation"
          value={mockStats.forecastDeviation}
          delta="High Precision"
          deltaTone="muted"
        />
      </div>

      <p className="border-t border-[var(--color-border)] px-5 py-4 text-sm leading-relaxed text-[var(--color-text)]">
        Based on the latest data ingested from{" "}
        <span className="font-medium text-[var(--color-accent)]">
          {result.detected_format.toUpperCase()} file
        </span>
        , we observe a significant uptick in subscription renewals across the NA
        sector, while the APAC region shows anomalous volatility in early Q3.
        Predictive modelling suggests a{" "}
        <span className="font-semibold">{mockStats.liftPct} lift</span> if the
        current trend maintains.
      </p>

      <div className="flex items-center gap-2 border-t border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-text-muted)_4%,transparent)] px-5 py-3">
        <ActionButton label="Default Insight" icon={<DotIcon />} />
        <ActionButton label="Next Action" icon={<ArrowIcon />} />
      </div>
    </article>
  );
}

function Metric({
  label,
  value,
  delta,
  deltaTone,
}: {
  label: string;
  value: string;
  delta: string;
  deltaTone: "success" | "accent" | "muted";
}) {
  const toneColor = {
    success: "#10B981",
    accent: "var(--color-accent)",
    muted: "var(--color-text-muted)",
  }[deltaTone];

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-text-muted)_4%,transparent)] px-4 py-3">
      <p className="text-xs font-medium text-[var(--color-text-muted)]">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-xs font-medium" style={{ color: toneColor }}>
        {delta}
      </p>
    </div>
  );
}

function StatusTag({
  tone,
  label,
  dot = false,
}: {
  tone: "success" | "warning";
  label: string;
  dot?: boolean;
}) {
  const palette = {
    success: {
      fg: "#10B981",
      bg: "color-mix(in oklab, #10B981 14%, transparent)",
    },
    warning: {
      fg: "#F59E0B",
      bg: "color-mix(in oklab, #F59E0B 14%, transparent)",
    },
  }[tone];

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ color: palette.fg, backgroundColor: palette.bg }}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: palette.fg }}
        />
      )}
      {label}
    </span>
  );
}

function ActionButton({
  label,
  icon,
}: {
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
    >
      {icon}
      {label}
    </button>
  );
}

function SparkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-[var(--color-accent)]"
    >
      <path d="M12 3l2.3 5.2L20 10l-4.5 3.2L17 19l-5-3-5 3 1.5-5.8L4 10l5.7-1.8L12 3z" />
    </svg>
  );
}

function DotIcon() {
  return <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />;
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}
