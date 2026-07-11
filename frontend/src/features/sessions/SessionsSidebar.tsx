import type { Session } from "./sessionStorage";

interface SessionsSidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onNewSession: () => void;
}

/**
 * Left sidebar: brand header, new-chat action, nav rail, recent chats,
 * and a user footer. Nav items beyond "Chat" are placeholders until
 * those views exist as separate routes. Uploaded files list lives in
 * the right rail instead of here (see RightRail.tsx).
 * On mobile this collapses behind a toggle (handled in Layout).
 */
export default function SessionsSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onNewSession,
}: SessionsSidebarProps) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] lg:flex">
      {/* Brand */}
      <button
        type="button"
        onClick={onNewSession}
        className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-3.5 w-full hover:opacity-80 transition"
      >
        <div className="h-6 w-6 rounded-md bg-[var(--color-accent)]" />
        <span className="text-sm font-semibold tracking-tight">
          Data Analyst Platform
        </span>
      </button>

      {/* New chat */}
      <div className="px-3 pt-3">
        <button
          type="button"
          onClick={onNewSession}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm font-medium text-[var(--color-text)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          <PlusIcon />
          New Chat
        </button>
      </div>

      {/* Nav rail */}
      <nav className="flex flex-col gap-0.5 px-3 py-3">
        <NavItem icon={<ChatIcon />} label="Chat" active />
        <NavItem icon={<FolderIcon />} label="Files" />
        <NavItem icon={<ChartIcon />} label="Charts" />
        <NavItem icon={<HistoryIcon />} label="History" />
      </nav>

      <div className="flex-1 overflow-y-auto px-1 pb-3">
        {/* Recent chats */}
        <SectionLabel>Recent Chats</SectionLabel>
        {sessions.length === 0 ? (
          <EmptyState text="Your chats will appear here." />
        ) : (
          <ul className="flex flex-col gap-1 px-2">
            {sessions.map((session) => (
              <li key={session.id}>
                <SessionRow
                  session={session}
                  isActive={session.id === activeSessionId}
                  onSelect={() => onSelectSession(session.id)}
                  onDelete={() => onDeleteSession(session.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* User footer */}
      <div className="flex items-center gap-2 border-t border-[var(--color-border)] px-4 py-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-border)] text-[var(--color-text-muted)]">
          <UserIcon />
        </div>
        <span className="text-sm font-medium text-[var(--color-text)]">User</span>
      </div>
    </aside>
  );
}

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={!active}
      className={[
        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition",
        active
          ? "bg-[color-mix(in_oklab,var(--color-accent)_12%,transparent)] text-[var(--color-accent)]"
          : "cursor-default text-[var(--color-text-muted)] opacity-50",
      ].join(" ")}
    >
      {icon}
      {label}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="px-3 pb-1.5 pt-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] first:pt-0">
      {children}
    </h2>
  );
}

function SessionRow({
  session,
  isActive,
  onSelect,
  onDelete,
}: {
  session: Session;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const messageCount = session.messages.length;

  return (
    <div
      className={[
        "group flex items-start gap-2 rounded-lg p-2.5 transition",
        isActive
          ? "bg-[color-mix(in_oklab,var(--color-accent)_12%,transparent)]"
          : "hover:bg-[color-mix(in_oklab,var(--color-text-muted)_6%,transparent)]",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex flex-1 flex-col items-start gap-0.5 text-left"
      >
        <div className="flex w-full items-center gap-1.5">
          <FileIcon active={isActive} />
          <span
            className={[
              "truncate text-sm font-medium",
              isActive
                ? "text-[var(--color-accent)]"
                : "text-[var(--color-text)]",
            ].join(" ")}
            title={session.filename}
          >
            {session.filename}
          </span>
        </div>
        <span className="ml-5 text-xs text-[var(--color-text-muted)]">
          {formatRelativeTime(session.updatedAt)}
          {messageCount > 0 && ` · ${messageCount} msg`}
        </span>
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title="Delete session"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[var(--color-text-muted)] opacity-0 transition hover:bg-[color-mix(in_oklab,#EF4444_14%,transparent)] hover:text-[#EF4444] group-hover:opacity-100"
      >
        <TrashIcon />
      </button>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-6 text-center">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color-mix(in_oklab,var(--color-text-muted)_12%,transparent)]">
        <ClockIcon />
      </div>
      <p className="text-xs text-[var(--color-text-muted)]">{text}</p>
    </div>
  );
}

/** Returns a short relative time string like "just now", "3m ago", "2h ago". */
function formatRelativeTime(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString();
}

function FileIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={[
        "h-3.5 w-3.5 shrink-0",
        active
          ? "text-[var(--color-accent)]"
          : "text-[var(--color-text-muted)]",
      ].join(" ")}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function PlusIcon() {
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
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1.5 14a2 2 0 0 1-2 2H8.5a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-[var(--color-text-muted)]"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M3 12a9 9 0 1 0 2.6-6.3" />
      <path d="M3 5v5h5" />
      <polyline points="12 7 12 12 15 14" />
    </svg>
  );
}