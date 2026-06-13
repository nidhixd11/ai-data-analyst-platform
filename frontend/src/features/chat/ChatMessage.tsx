import type { ChatMessage as ChatMessageType } from "./mockChat";

interface ChatMessageProps {
  message: ChatMessageType;
}

/**
 * Single chat bubble. User messages align right (accent),
 * assistant messages align left (surface).
 */
export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

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
