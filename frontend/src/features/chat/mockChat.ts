/**
 * Mock chat backend. Returns canned responses based on simple keyword matching.
 * Same shape the real /chat endpoint will return once T-128 lands.
 */

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ChatResponse {
  message: ChatMessage;
  /** How long the assistant "thought" — drives the loading state. */
  thinkingMs: number;
}

/**
 * Fake an assistant reply for the given user prompt.
 * Resolves after a delay so the UI can show a "Thinking..." state.
 */
export async function mockChatReply(userPrompt: string): Promise<ChatResponse> {
  const thinkingMs = 1200 + Math.random() * 800;
  await delay(thinkingMs);

  return {
    message: {
      id: randomId(),
      role: "assistant",
      content: pickResponse(userPrompt),
      timestamp: Date.now(),
    },
    thinkingMs,
  };
}

/**
 * Crude keyword-based response picker. Real LLM swaps this out.
 */
function pickResponse(prompt: string): string {
  const p = prompt.toLowerCase();

  if (p.includes("growth") || p.includes("summari")) {
    return "Revenue grew 18.2% month-over-month, driven primarily by subscription renewals in the NA region. Q3 shows the strongest acceleration with a +23% MoM peak in May. APAC has been volatile — flagged in the anomaly panel.";
  }

  if (p.includes("region") || p.includes("top")) {
    return "North America leads with $2.48M in revenue this quarter, contributing 65% of overall enterprise share. EMEA is steady at $1.34M. APAC underperformed expectations by 12% — likely tied to the churn spike flagged in the dataset.";
  }

  if (p.includes("compare") || p.includes("mom") || p.includes("month")) {
    return "Month-over-month comparison shows consistent growth from Jan ($1.9M) through May ($4.4M peak), with a slight dip in June ($3.6M) before recovering in July. The 23% MoM growth rate is above the 15% target.";
  }

  if (p.includes("churn") || p.includes("anomal")) {
    return "Anomaly detected: churn rate rose 1.7% against the cycle baseline, concentrated in APAC enterprise segment. Marketing DB sync latency is also above threshold — possibly correlated. Recommend reviewing retention campaigns for that segment.";
  }

  // Default fallback.
  return `I analyzed your question about "${prompt}". Based on the current dataset, I can help you explore growth trends, regional breakdowns, MoM comparisons, or anomaly patterns. What would you like to dig into?`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 12);
}
