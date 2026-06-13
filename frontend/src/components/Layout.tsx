import { type ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  leftSidebar?: ReactNode;
  rightRail?: ReactNode;
}

export default function Layout({
  children,
  leftSidebar,
  rightRail,
}: LayoutProps) {
  return (
    <div className="flex h-full flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {leftSidebar}
        <main className="flex-1 overflow-auto">{children}</main>
        {rightRail}
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-md bg-[var(--color-accent)]" />
        <span className="text-sm font-semibold tracking-tight">
          <span className="hidden sm:inline">Data Insights Chatbot</span>
          <span className="sm:hidden">Insights</span>
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
