/**
 * Mock /upload endpoint.
 *
 * Returns the same shape the real backend will return once T-111 ships.
 * Lets us build the dashboard / chat screens before the real API exists.
 */

export interface UploadResponse {
  session_id: string;
  detected_format: "csv" | "xlsx" | "xls";
  schema: {
    rows: number;
    columns: number;
    columns_detail: ColumnDetail[];
  };
  preview: Record<string, unknown>[];
}

export interface ColumnDetail {
  name: string;
  dtype: "int" | "float" | "string" | "datetime" | "bool";
  null_pct: number;
}

/**
 * Fake the /upload call.
 * Resolves after a short delay with a believable response based on the file.
 */
export async function mockUpload(file: File): Promise<UploadResponse> {
  // Pretend the server is doing work.
  await delay(1200);

  const ext = file.name.toLowerCase().split(".").pop() ?? "csv";
  const detected_format =
    ext === "xlsx" ? "xlsx" : ext === "xls" ? "xls" : "csv";

  return {
    session_id: cryptoRandomId(),
    detected_format,
    schema: {
      rows: 12_438,
      columns: 14,
      columns_detail: [
        { name: "order_id", dtype: "int", null_pct: 0 },
        { name: "customer_name", dtype: "string", null_pct: 0.3 },
        { name: "order_date", dtype: "datetime", null_pct: 0 },
        { name: "region", dtype: "string", null_pct: 1.2 },
        { name: "revenue", dtype: "float", null_pct: 0 },
        { name: "is_returning", dtype: "bool", null_pct: 4.5 },
      ],
    },
    preview: [
      { order_id: 1001, customer_name: "Aanya Sharma", revenue: 1240.5 },
      { order_id: 1002, customer_name: "Rohit Kapoor", revenue: 890.0 },
      { order_id: 1003, customer_name: "Lina Park", revenue: 2150.75 },
    ],
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cryptoRandomId(): string {
  // Browsers have crypto.randomUUID; fallback for older environments.
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 12);
}
