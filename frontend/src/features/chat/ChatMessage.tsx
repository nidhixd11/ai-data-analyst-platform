import type { ChatMessage as ChatMessageType } from "./mockChat";

interface ChatMessageProps {
  message: ChatMessageType;
  onViewContext?: () => void;
}

/**
 * Single chat bubble. User messages align right (accent),
 * assistant messages align left (surface). Assistant messages
 * show a "View context" link if citation data is attached.
 */
export default function ChatMessage({
  message,
  onViewContext,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const hasContext = !isUser && message.context !== undefined;

  return (
    <div
      className={["flex w-full", isUser ? "justify-end" : "justify-start"].join(
        " ",
      )}
    >
      <div
        className={[
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-[var(--color-accent)] text-white"
            : "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]",
        ].join(" ")}
      >
        {!isUser && (
          <div className="mb-1 flex items-center gap-1.5">
            <SparkIcon />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-accent)]">
              Assistant
            </span>
          </div>
        )}
        <p className="whitespace-pre-wrap">{message.content}</p>
        {hasContext && onViewContext && (
          <button
            type="button"
            onClick={onViewContext}
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-accent)] transition hover:underline"
          >
            <InfoIcon />
            View context
          </button>
        )}
      </div>
    </div>
  );
}

function SparkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3 text-[var(--color-accent)]"
    >
      <path d="M12 3l2.3 5.2L20 10l-4.5 3.2L17 19l-5-3-5 3 1.5-5.8L4 10l5.7-1.8L12 3z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
