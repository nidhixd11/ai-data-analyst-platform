import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import type { ChartConfig } from "../../types";

interface Props {
  chart?: ChartConfig;
  currency: "USD" | "INR";
  onCurrencyChange: (c: "USD" | "INR") => void;
}

type RenderableType = "bar" | "line" | "scatter";

const ACCENT = "var(--color-accent)";
const USD_TO_INR = 84;

const BUSINESS_KEYWORDS = [
  "revenue", "sales", "profit", "amount", "price",
  "income", "earnings", "salary", "cost", "spend", "budget",
];

function isBusinessColumn(name: string): boolean {
  return BUSINESS_KEYWORDS.some((k) => name.toLowerCase().includes(k));
}

function convertValue(val: unknown, currency: "USD" | "INR"): number {
  const n = Number(val);
  return currency === "INR" ? n * USD_TO_INR : n;
}

export default function TrendChart({ chart, currency, onCurrencyChange }: Props) {
  const canToggle = chart && chart.chart_type !== "histogram";
  const xAxisIsCategorical = chart?.chart_type === "bar";

  const [selectedType, setSelectedType] = useState<RenderableType>(
    canToggle ? (chart!.chart_type as RenderableType) : "bar"
  );

  if (!chart) {
    return (
      <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <p className="text-sm text-[var(--color-text-muted)]">
          Upload a dataset to generate charts.
        </p>
      </article>
    );
  }

  const activeType = canToggle ? selectedType : chart.chart_type;

  const wasReordered =
    chart.chart_type === "scatter" && (activeType === "bar" || activeType === "line");

  const sortedData =
    activeType === "bar" || activeType === "line"
      ? [...chart.data].sort((a, b) => {
        const av = Number(a[chart.x_axis]);
        const bv = Number(b[chart.x_axis]);
        return av - bv;
      })
      : chart.data;

  const shouldConvert = isBusinessColumn(chart.y_axis) || isBusinessColumn(chart.x_axis);

  const convertedData = shouldConvert
    ? sortedData.map((row) => ({
      ...row,
      [chart.y_axis]: convertValue(row[chart.y_axis], currency),
    }))
    : sortedData;

  const incompatible = xAxisIsCategorical && activeType !== "bar";

  return (
    <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      {/* Title row + chart type toggle */}
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-base font-semibold">{chart.title}</h3>
        {canToggle && (
          <div className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] p-0.5">
            <TypeButton
              label="Bar"
              active={selectedType === "bar"}
              recommended={chart.chart_type === "bar"}
              onClick={() => setSelectedType("bar")}
            />
            <TypeButton
              label="Line"
              active={selectedType === "line"}
              recommended={chart.chart_type === "line"}
              disabled={xAxisIsCategorical}
              onClick={() => setSelectedType("line")}
            />
            <TypeButton
              label="Scatter"
              active={selectedType === "scatter"}
              recommended={chart.chart_type === "scatter"}
              disabled={xAxisIsCategorical}
              onClick={() => setSelectedType("scatter")}
            />
          </div>
        )}
      </div>

      {/* Subtitle row + currency toggle */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-[var(--color-text-muted)]">
          Automatically generated from uploaded dataset
        </p>
        {shouldConvert && (
          <div className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] p-0.5">
            <CurrencyButton
              label="USD"
              active={currency === "USD"}
              onClick={() => onCurrencyChange("USD")}
            />
            <CurrencyButton
              label="INR"
              active={currency === "INR"}
              onClick={() => onCurrencyChange("INR")}
            />
          </div>
        )}
      </div>

      {wasReordered && (
        <p className="mb-4 text-xs italic text-amber-600 dark:text-amber-400">
          Note: x-axis sorted by value for display — this data doesn't have a natural sequence, so treat this as a re-view of the same points rather than a real trend over an ordered axis.
        </p>
      )}

      {incompatible ? (
        <div className="flex h-80 flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm font-medium text-[var(--color-text)]">
            {activeType === "scatter" ? "Scatter" : "Line"} view isn't available for this data
          </p>
          <p className="max-w-xs text-xs text-[var(--color-text-muted)]">
            "{chart.x_axis}" is a category, not a number, so it can't be plotted on a numeric axis. Try the Bar view instead.
          </p>
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {activeType === "bar" ? (
              <BarChart data={convertedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey={chart.x_axis} stroke="var(--color-text-muted)" />
                <YAxis stroke="var(--color-text-muted)" />
                <Tooltip cursor={false} />
                <Bar dataKey={chart.y_axis} fill={ACCENT} radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : activeType === "line" ? (
              <LineChart data={convertedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey={chart.x_axis} stroke="var(--color-text-muted)" />
                <YAxis stroke="var(--color-text-muted)" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey={chart.y_axis}
                  stroke={ACCENT}
                  strokeWidth={2}
                  dot={{ fill: ACCENT, r: 3 }}
                />
              </LineChart>
            ) : activeType === "scatter" ? (
              <ScatterChart margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  type="number"
                  dataKey={chart.x_axis}
                  name={chart.x_axis}
                  stroke="var(--color-text-muted)"
                  label={{ value: chart.x_axis, position: "insideBottom", offset: -5, fill: "var(--color-text-muted)" }}
                />
                <YAxis
                  type="number"
                  dataKey={chart.y_axis}
                  name={chart.y_axis}
                  stroke="var(--color-text-muted)"
                  label={{ value: chart.y_axis, angle: -90, position: "insideLeft", fill: "var(--color-text-muted)" }}
                />
                <Tooltip />
                <Scatter data={convertedData} fill={ACCENT} />
              </ScatterChart>
            ) : (
              <BarChart data={convertedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey={chart.x_axis} stroke="var(--color-text-muted)" />
                <YAxis stroke="var(--color-text-muted)" />
                <Tooltip cursor={false} />
                <Bar dataKey={chart.x_axis} fill={ACCENT} radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </article>
  );
}

function TypeButton({
  label, active, recommended, disabled, onClick,
}: {
  label: string;
  active: boolean;
  recommended?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={
        disabled
          ? "Not available — this data has a categorical axis"
          : recommended
            ? "Recommended for this data"
            : undefined
      }
      className={[
        "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition",
        disabled
          ? "cursor-not-allowed text-[var(--color-text-muted)] opacity-40"
          : active
            ? "bg-[var(--color-accent)] text-white"
            : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
      ].join(" ")}
    >
      {label}
      {recommended && <span className="text-[10px]">★</span>}
    </button>
  );
}

function CurrencyButton({
  label, active, onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-md px-2.5 py-1 text-xs font-medium transition",
        active
          ? "bg-[var(--color-accent)] text-white"
          : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
