/**
 * Three suggested prompts shown below the upload zone.
 * They're disabled until a file is uploaded — at which point
 * clicking one will pre-fill the chat composer (T-134).
 */

interface SuggestionPillsProps {
  disabled: boolean;
  onPick?: (prompt: string) => void;
}

const SUGGESTIONS = ["Summarise growth", "Top regions", "Compare MoM"] as const;

export default function SuggestionPills({
  disabled,
  onPick,
}: SuggestionPillsProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
        Try asking
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {SUGGESTIONS.map((label) => (
          <button
            key={label}
            type="button"
            disabled={disabled}
            onClick={() => onPick?.(label)}
            className={[
              "rounded-full border px-4 py-1.5 text-sm font-medium transition",
              disabled
                ? "cursor-not-allowed border-[var(--color-border)] text-[var(--color-text-muted)] opacity-60"
                : "cursor-pointer border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
