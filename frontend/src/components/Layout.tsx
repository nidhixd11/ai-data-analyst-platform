import { type ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

/**
 * App shell. Renders a top bar with the product name on the left
 * and a theme toggle / avatar slot on the right, plus a full-height
 * main content area.
 *
 * Right now `children` is the only slot. We'll add a sidebar slot
 * in a later task once the chat history UI lands (T-136).
 */
export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-full flex-col">
      <Header />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-md bg-[var(--color-accent)]" />
        <span className="text-sm font-semibold tracking-tight">
          Data Insights Chatbot
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          onClick={() => {
            document.documentElement.classList.toggle("dark");
          }}
        >
          Toggle theme
        </button>
        <div className="h-7 w-7 rounded-full bg-[var(--color-border)]" />
      </div>
    </header>
  );
}
