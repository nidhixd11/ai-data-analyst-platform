import { type ReactNode, useEffect, useState } from "react";

interface LayoutProps {
  children: ReactNode;
  leftSidebar?: ReactNode;
  rightRail?: ReactNode;
  rightRailOpen?: boolean;
  onToggleRightRail?: () => void;
}

const THEME_KEY = "data-analyst-platform:theme";

function getInitialTheme(): "light" | "dark" {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* ignore storage errors */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function Layout({
  children,
  leftSidebar,
  rightRail,
  rightRailOpen = true,
  onToggleRightRail,
}: LayoutProps) {
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore storage errors */
    }
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  return (
    <div className="flex h-full flex-col">
      {/* Mobile-only top bar — hidden entirely on lg+, where the sidebar takes over */}
      <header className="flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 sm:px-6 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-[var(--color-accent)]" />
          <span className="text-sm font-semibold tracking-tight">
            Data Analyst Platform
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggleButton theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {leftSidebar}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Desktop-only slim control bar for panel/theme toggles */}
          <div className="hidden h-12 shrink-0 items-center justify-end gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 lg:flex">
            {onToggleRightRail && (
              <button
                type="button"
                onClick={onToggleRightRail}
                title={rightRailOpen ? "Hide right panel" : "Show right panel"}
                className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-text-muted)] transition hover:bg-[color-mix(in_oklab,var(--color-accent)_12%,transparent)] hover:text-[var(--color-accent)]"
              >
                <PanelIcon open={rightRailOpen ?? true} />
              </button>
            )}
            <ThemeToggleButton theme={theme} onToggle={toggleTheme} />
          </div>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
        {rightRailOpen && rightRail}
      </div>
    </div>
  );
}

function ThemeToggleButton({
  theme,
  onToggle,
}: {
  theme: "light" | "dark";
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title="Toggle theme"
      className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-text-muted)] transition hover:bg-[color-mix(in_oklab,var(--color-accent)_12%,transparent)] hover:text-[var(--color-accent)]"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function PanelIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="15" y1="4" x2="15" y2="20" opacity={open ? 1 : 0.35} />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
      <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}