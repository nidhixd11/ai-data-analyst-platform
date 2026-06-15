import { getMockContext, type MessageContext } from "./mockContext";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  context?: MessageContext;
}

export interface ChatResponse {
  message: ChatMessage;
  thinkingMs: number;
}

/**
 * Call the real /chat backend endpoint.
 */
export async function mockChatReply(
  sessionId: string,
  userPrompt: string,
  model: string,
): Promise<ChatResponse> {
  const startTime = Date.now();

  const response = await fetch("http://localhost:8000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      question: userPrompt,
      model_id: model,
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat failed: ${response.statusText}`);
  }

  const data = await response.json();
  const thinkingMs = Date.now() - startTime;

  return {
    message: {
      id: randomId(),
      role: "assistant",
      content: data.answer,
      timestamp: Date.now(),
      context: getMockContext(userPrompt, model),
    },
    thinkingMs,
  };
}

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 12);
}
