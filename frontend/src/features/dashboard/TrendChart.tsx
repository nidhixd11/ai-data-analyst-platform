import { useState } from "react";

type ChartView = "bar" | "line" | "area";

/**
 * Placeholder chart card with a Bar / Line / Area toggle.
 * Real chart (recharts) lands in T-133 Part 2B.
 *
 * For now we render a simple SVG bar visual so the layout feels
 * complete; the toggle state doesn't change the visual yet.
 */
export default function TrendChart() {
  const [view, setView] = useState<ChartView>("bar");

  // Mock data — replaced by the auto-insights pipeline in T-133 Part 2B.
  const bars = [38, 52, 47, 61, 88, 72, 79];
  const max = Math.max(...bars);

  return (
    <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold tracking-tight">
              Revenue Trend Analysis
            </h3>
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                color: "#10B981",
                backgroundColor:
                  "color-mix(in oklab, #10B981 14%, transparent)",
              }}
            >
              +23% MoM
            </span>
          </div>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Aggregated monthly performance across all regions
          </p>
        </div>
        <ViewToggle value={view} onChange={setView} />
      </header>

      <div className="mt-6 flex h-44 items-end gap-3">
        {bars.map((value, i) => {
          const isPeak = i === bars.indexOf(max);
          return (
            <div
              key={i}
              className="flex flex-1 flex-col items-center justify-end"
            >
              {isPeak && (
                <span className="mb-1 rounded-md bg-[var(--color-accent)] px-2 py-0.5 text-xs font-medium text-white">
                  ${(value * 0.05).toFixed(1)}M
                </span>
              )}
              <div
                className="w-full rounded-md transition-all"
                style={{
                  height: `${(value / max) * 100}%`,
                  backgroundColor: isPeak
                    ? "var(--color-accent)"
                    : "color-mix(in oklab, var(--color-text-muted) 30%, transparent)",
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex justify-between text-xs text-[var(--color-text-muted)]">
        <span>Jan</span>
        <span>Feb</span>
        <span>Mar</span>
        <span>Apr</span>
        <span>May</span>
        <span>Jun</span>
        <span>Jul</span>
      </div>
    </article>
  );
}

function ViewToggle({
  value,
  onChange,
}: {
  value: ChartView;
  onChange: (v: ChartView) => void;
}) {
  const options: ChartView[] = ["bar", "line", "area"];
  return (
    <div className="flex items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={[
            "rounded-md px-3 py-1 text-xs font-medium capitalize transition",
            value === opt
              ? "bg-[color-mix(in_oklab,var(--color-accent)_12%,transparent)] text-[var(--color-accent)]"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
          ].join(" ")}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
