export type ModelId = "groq" | "gemini" | "ollama";

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
    id: "ollama",
    label: "Ollama (local)",
    description: "Runs locally, private",
    badge: "local",
  },
];