import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import ChatMessage from "./ChatMessage";
import ModelPicker, { type ModelId } from "./ModelPicker";
import { mockChatReply, type ChatMessage as ChatMessageType } from "./mockChat";

interface ChatPanelProps {
  initialPrompt?: string;
  onInitialPromptConsumed?: () => void;
}

export default function ChatPanel({
  initialPrompt,
  onInitialPromptConsumed,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [model, setModel] = useState<ModelId>("groq");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt);
      textareaRef.current?.focus();
      onInitialPromptConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;

    const userMessage: ChatMessageType = {
      id: randomId(),
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);

    try {
      const response = await mockChatReply(trimmed);
      setMessages((prev) => [...prev, response.message]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: randomId(),
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const hasMessages = messages.length > 0;

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <header className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          Chat
        </h2>
        <div className="flex items-center gap-3">
          <ModelPicker value={model} onChange={setModel} />
          {hasMessages && (
            <button
              type="button"
              onClick={() => setMessages([])}
              className="text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
            >
              Clear conversation
            </button>
          )}
        </div>
      </header>

      <div className="flex max-h-96 min-h-[12rem] flex-col gap-3 overflow-y-auto">
        {!hasMessages && !isThinking && <EmptyState />}
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}
        {isThinking && <ThinkingBubble />}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-end gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your data…"
          rows={1}
          className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-[var(--color-text-muted)]"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim() || isThinking}
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition sm:h-9 sm:w-9",
            input.trim() && !isThinking
              ? "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
              : "cursor-not-allowed bg-[var(--color-border)] text-[var(--color-text-muted)]",
          ].join(" ")}
        >
          <SendIcon />
        </button>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--color-accent)_15%,transparent)]">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 text-[var(--color-accent)]"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <p className="text-sm font-medium">Ask anything about your data</p>
      <p className="max-w-sm text-xs text-[var(--color-text-muted)]">
        Try "Summarise growth" or "Compare MoM" to get started.
      </p>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex w-full justify-start">
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
        <div className="mb-1.5 flex items-center gap-1.5">
          <PulsingSpark />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-accent)]">
            Analysing your data
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Dot delay="0s" />
          <Dot delay="0.15s" />
          <Dot delay="0.3s" />
        </div>
      </div>
    </div>
  );
}

function PulsingSpark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3 animate-pulse text-[var(--color-accent)]"
    >
      <path d="M12 3l2.3 5.2L20 10l-4.5 3.2L17 19l-5-3-5 3 1.5-5.8L4 10l5.7-1.8L12 3z" />
    </svg>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--color-text-muted)]"
      style={{ animationDelay: delay }}
    />
  );
}

function SendIcon() {
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
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 12);
}
