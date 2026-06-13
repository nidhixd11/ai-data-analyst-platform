import type { MessageContext, CitationSource } from "./mockContext";

interface ContextDrawerProps {
  context: MessageContext | null;
  onClose: () => void;
}

/**
 * Slide-in drawer that shows the citation sources behind an assistant message.
 * Real citations will come from the RAG layer (T-129) once backend is wired.
 */
export default function ContextDrawer({
  context,
  onClose,
}: ContextDrawerProps) {
  const isOpen = context !== null;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 transition-opacity"
        />
      )}

      {/* Drawer panel */}
      <aside
        className={[
          "fixed right-0 top-0 z-50 h-full w-full overflow-y-auto border-l border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl transition-transform sm:w-96",
          isOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        {context && (
          <>
            <header className="sticky top-0 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4">
              <div className="flex items-center gap-2">
                <ContextIcon />
                <h3 className="text-sm font-semibold tracking-tight">
                  Context used
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1 text-[var(--color-text-muted)] transition hover:bg-[color-mix(in_oklab,var(--color-text-muted)_10%,transparent)] hover:text-[var(--color-text)]"
              >
                <CloseIcon />
              </button>
            </header>

            <div className="flex flex-col gap-5 px-5 py-5">
              <QuerySection
                query={context.query}
                model={context.modelUsed}
                confidence={context.overallConfidence}
              />

              <section className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  Sources ({context.sources.length})
                </p>
                <ul className="flex flex-col gap-3">
                  {context.sources.map((source, idx) => (
                    <SourceCard key={idx} source={source} />
                  ))}
                </ul>
              </section>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

function QuerySection({
  query,
  model,
  confidence,
}: {
  query: string;
  model: string;
  confidence: number;
}) {
  const pct = Math.round(confidence * 100);
  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        Query
      </p>
      <p className="mb-3 text-sm">{query}</p>

      <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3">
        <span className="text-xs text-[var(--color-text-muted)]">
          Model:{" "}
          <span className="font-medium capitalize text-[var(--color-text)]">
            {model}
          </span>
        </span>
        <ConfidenceBadge pct={pct} />
      </div>
    </section>
  );
}

function ConfidenceBadge({ pct }: { pct: number }) {
  const tone = pct >= 90 ? "#10B981" : pct >= 75 ? "#F59E0B" : "#EF4444";

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums"
      style={{
        color: tone,
        backgroundColor: `color-mix(in oklab, ${tone} 14%, transparent)`,
      }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: tone }}
      />
      {pct}% confidence
    </span>
  );
}

function SourceCard({ source }: { source: CitationSource }) {
  const palette = {
    schema: { fg: "#3B82F6", label: "Schema" },
    row: { fg: "#10B981", label: "Rows" },
    aggregate: { fg: "#8B5CF6", label: "Aggregate" },
  }[source.type];

  return (
    <li className="rounded-xl border border-[var(--color-border)] p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span
          className="inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{
            color: palette.fg,
            backgroundColor: `color-mix(in oklab, ${palette.fg} 14%, transparent)`,
          }}
        >
          {palette.label}
        </span>
        <span className="text-xs tabular-nums text-[var(--color-text-muted)]">
          {Math.round(source.confidence * 100)}%
        </span>
      </div>
      <p className="text-sm font-medium">{source.label}</p>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
        {source.excerpt}
      </p>
    </li>
  );
}

function ContextIcon() {
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
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function CloseIcon() {
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
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
