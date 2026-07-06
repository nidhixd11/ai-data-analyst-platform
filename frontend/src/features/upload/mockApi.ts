/**
 * Real /upload and /chat endpoints.
 * Calls http://localhost:8000 backend instead of mocking.
 */

export interface ColumnDetail {
  name: string;
  dtype: "int" | "float" | "string" | "datetime" | "bool";
  null_pct: number;
}

export interface ColumnStatistics {
  dtype: string;

  count: number;
  null_count: number;

  mean: number | null;
  median: number | null;
  minimum: number | null;
  maximum: number | null;
  std: number | null;
}

export interface UploadResponse {
  session_id: string;
  detected_format: "csv" | "xlsx" | "xls";

  memory_mb: number;
  null_percentage: number;
  duplicate_rows: number;
  numeric_columns: number;

  schema: {
    rows: number;
    columns: number;
    columns_detail: ColumnDetail[];
  };

  preview: Record<string, unknown>[];

  insights: string[];

  column_statistics: Record<string, ColumnStatistics>;
}

export interface ChatRequest {
  session_id: string;
  model_id: string;
  question: string;
}

export interface ChatResponse {
  answer: string;
  context_used: string[];
  suggested_chart: string | null;
}

/**
 * Upload a file to the real backend.
 */
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function mockUpload(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Send a chat message to the real backend.
 */
export async function mockChat(req: ChatRequest): Promise<ChatResponse> {
  const response = await fetch("http://localhost:8000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  if (!response.ok) {
    throw new Error(`Chat failed: ${response.statusText}`);
  }

  return response.json();
}
