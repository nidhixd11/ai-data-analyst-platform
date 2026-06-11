import type { ColumnDetail } from "../upload/mockApi";

/**
 * Renders the per-column breakdown of the uploaded dataset:
 * name, dtype, and null percentage. Read-only for now;
 * sorting / filtering can come in a later pass.
 */

interface SchemaTableProps {
  columns: ColumnDetail[];
}

export default function SchemaTable({ columns }: SchemaTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <table className="w-full text-sm">
        <thead className="border-b border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-text-muted)_8%,transparent)]">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Column
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Type
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Null %
            </th>
          </tr>
        </thead>
        <tbody>
          {columns.map((col, idx) => (
            <tr
              key={col.name}
              className={
                idx !== columns.length - 1
                  ? "border-b border-[var(--color-border)]"
                  : ""
              }
            >
              <td className="px-4 py-3 font-medium">{col.name}</td>
              <td className="px-4 py-3">
                <DtypeBadge dtype={col.dtype} />
              </td>
              <td className="px-4 py-3 text-right tabular-nums">
                {col.null_pct.toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DtypeBadge({ dtype }: { dtype: ColumnDetail["dtype"] }) {
  // Pick a tint per dtype so the table is scannable at a glance.
  const tint: Record<ColumnDetail["dtype"], string> = {
    int: "#3B82F6",
    float: "#8B5CF6",
    string: "#10B981",
    datetime: "#F59E0B",
    bool: "#EC4899",
  };
  const color = tint[dtype];
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
      style={{
        color,
        backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)`,
      }}
    >
      {dtype}
    </span>
  );
}
