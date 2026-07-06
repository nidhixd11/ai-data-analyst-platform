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

import type { ChartConfig } from "../../types"; // <-- adjust this import path if needed

interface Props {
  chart?: ChartConfig;
}

export default function TrendChart({ chart }: Props) {
  if (!chart) {
    return (
      <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <p className="text-sm text-[var(--color-text-muted)]">
          Upload a dataset to generate charts.
        </p>
      </article>
    );
  }

  return (
    <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h3 className="mb-1 text-base font-semibold">
        {chart.title}
      </h3>

      <p className="mb-5 text-xs text-[var(--color-text-muted)]">
        Automatically generated from uploaded dataset
      </p>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">

          {chart.chart_type === "bar" ? (
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.x_axis} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={chart.y_axis} />
            </BarChart>
          ) : chart.chart_type === "line" ? (
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.x_axis} />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey={chart.y_axis}
              />
            </LineChart>
          ) : chart.chart_type === "scatter" ? (
            <ScatterChart
              margin={{
                top: 20,
                right: 20,
                left: 10,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                type="number"
                dataKey={chart.x_axis}
                name={chart.x_axis}
                label={{
                  value: chart.x_axis,
                  position: "insideBottom",
                  offset: -5,
                }}
              />

              <YAxis
                type="number"
                dataKey={chart.y_axis}
                name={chart.y_axis}
                label={{
                  value: chart.y_axis,
                  angle: -90,
                  position: "insideLeft",
                }}
              />

              <Tooltip />

              <Scatter
                data={chart.data}
                fill="#6366f1"
              />
            </ScatterChart>
          ) : (
            <BarChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={chart.x_axis} />
              <YAxis />
              <Tooltip />
              <Bar dataKey={chart.x_axis} />
            </BarChart>
          )}

        </ResponsiveContainer>
      </div>
    </article>
  );
}