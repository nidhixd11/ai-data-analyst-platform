import type { UploadResponse } from "../upload/mockApi";

interface InsightSummaryProps {
  result: UploadResponse;
}

export default function InsightSummary({ result }: InsightSummaryProps) {
  const numericColumns = result.schema.columns_detail.filter(
    (c) => c.dtype === "int" || c.dtype === "float"
  ).length;

  const categoricalColumns =
    result.schema.columns_detail.length - numericColumns;

  return (
    <article className="overflow-hidden rounded-2xl border-l-4 border-l-[var(--color-accent)] bg-[var(--color-surface)] shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
        <h3 className="text-base font-semibold tracking-tight">
          AI Dataset Summary
        </h3>

        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
          {result.detected_format.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 px-5 py-5 md:grid-cols-4">
        <Metric
          label="Rows"
          value={result.schema.rows.toLocaleString()}
        />

        <Metric
          label="Columns"
          value={result.schema.columns.toString()}
        />

        <Metric
          label="Detected Format"
          value={result.detected_format.toUpperCase()}
        />

        <Metric
          label="Preview Records"
          value={result.preview.length.toString()}
        />
      </div>

      <div className="border-t border-[var(--color-border)] px-5 py-4">
        <h4 className="mb-3 font-medium">Schema Overview</h4>

        <div className="mb-4 flex gap-6 text-sm">
          <span>
            <strong>Numeric:</strong> {numericColumns}
          </span>

          <span>
            <strong>Categorical:</strong> {categoricalColumns}
          </span>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="border-b border-[var(--color-border)]">
            <tr>
              <th className="py-2">Column</th>
              <th>Type</th>
              <th>Null %</th>
            </tr>
          </thead>

          <tbody>
            {result.schema.columns_detail.map((column) => (
              <tr
                key={column.name}
                className="border-b border-[var(--color-border)]"
              >
                <td className="py-2">{column.name}</td>
                <td>{column.dtype}</td>
                <td>{column.null_pct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-[var(--color-border)] px-5 py-4">
        <h4 className="mb-3 font-medium">Numeric Column Statistics</h4>

        {/*Object.keys(result.column_statistics).length > 0 ? (
          Object.entries(result.column_statistics).map(([name, stats]) => (
            <div
              key={name}
              className="mb-4 rounded-lg border border-[var(--color-border)] p-3"
            >
              <h5 className="mb-2 font-medium">{name}</h5>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <span>Mean: {stats.mean?.toFixed(2)}</span>
                <span>Median: {stats.median}</span>
                <span>Minimum: {stats.minimum}</span>
                <span>Maximum: {stats.maximum}</span>
                <span>Std Dev: {stats.std?.toFixed(2)}</span>
                <span>Count: {stats.count}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-[var(--color-text-muted)]">
            No numeric columns found.
          </p>
        )*/}
      </div>

      <div className="border-t border-[var(--color-border)] px-5 py-4">
        <h4 className="mb-2 font-medium">AI Analyst Insights</h4>

        {result.insights.length > 0 ? (
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {result.insights.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--color-text-muted)]">
            No AI insights generated yet. Upload analysis completed successfully.
          </p>
        )}
      </div>
    </article>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] p-4">
      <p className="text-xs text-[var(--color-text-muted)]">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold">
        {value}
      </p>
    </div>
  );
}