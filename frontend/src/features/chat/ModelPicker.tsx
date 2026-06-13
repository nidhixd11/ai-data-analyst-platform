import { useState, useRef, useEffect } from "react";

export type ModelId = "groq" | "gemini" | "chatgpt" | "ollama";

export interface ModelOption {
  id: ModelId;
  label: string;
  description: string;
  /** Hint about where this runs / costs (shown as a small badge). */
  badge: "free" | "cloud" | "local";
}

export const MODELS: ModelOption[] = [
  {
    id: "groq",
    label: "Groq (Mixtral)",
    description: "Fast inference, free tier",
    badge: "free",
  },
  {
    id: "gemini",
    label: "Gemini",
    description: "Google's multimodal model",
    badge: "cloud",
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    description: "OpenAI GPT-4",
    badge: "cloud",
  },
  {
    id: "ollama",
    label: "Ollama (local)",
    description: "Runs locally, private",
    badge: "local",
  },
];

interface ModelPickerProps {
  value: ModelId;
  onChange: (id: ModelId) => void;
}

/**
 * Dropdown to pick which LLM provider answers chat queries.
 * Selection is visual-only for now — wiring to the real model
 * gateway lands when T-122 / T-127 ship.
 */
export default function ModelPicker({ value, onChange }: ModelPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const selected = MODELS.find((m) => m.id === value) ?? MODELS[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1.5 text-xs font-medium transition hover:border-[var(--color-accent)]"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
        {selected.label}
        <ChevronIcon open={open} />
      </button>

      {open && (
        <ul className="absolute right-0 top-full z-10 mt-2 w-64 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
          {MODELS.map((m) => {
            const isSelected = m.id === value;
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(m.id);
                    setOpen(false);
                  }}
                  className={[
                    "flex w-full items-start gap-2 px-3 py-2.5 text-left transition",
                    isSelected
                      ? "bg-[color-mix(in_oklab,var(--color-accent)_10%,transparent)]"
                      : "hover:bg-[color-mix(in_oklab,var(--color-text-muted)_6%,transparent)]",
                  ].join(" ")}
                >
                  <div className="flex flex-1 flex-col">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      {m.label}
                      <BadgeTag tone={m.badge} />
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {m.description}
                    </span>
                  </div>
                  {isSelected && <CheckIcon />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function BadgeTag({ tone }: { tone: "free" | "cloud" | "local" }) {
  const palette = {
    free: { fg: "#10B981", label: "free" },
    cloud: { fg: "#3B82F6", label: "cloud" },
    local: { fg: "#8B5CF6", label: "local" },
  }[tone];

  return (
    <span
      className="inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
      style={{
        color: palette.fg,
        backgroundColor: `color-mix(in oklab, ${palette.fg} 14%, transparent)`,
      }}
    >
      {palette.label}
    </span>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={[
        "h-3 w-3 transition-transform",
        open ? "rotate-180" : "",
      ].join(" ")}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 h-4 w-4 text-[var(--color-accent)]"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
