/**
 * Mock citation data for the context drawer.
 * Same shape the real /chat endpoint will return once T-129 (citations) lands.
 */

export interface CitationSource {
  type: "schema" | "row" | "aggregate";
  label: string;
  /** Brief description of how this source contributed to the answer. */
  excerpt: string;
  /** 0–1; drives the confidence visual. */
  confidence: number;
}

export interface MessageContext {
  /** Original user question this context applies to. */
  query: string;
  sources: CitationSource[];
  /** Total confidence the model has in this answer (0–1). */
  overallConfidence: number;
  /** Which model produced the answer. */
  modelUsed: string;
}

/**
 * Returns mock context for a given user prompt.
 * Picks sources based on keyword matching — real RAG layer replaces this.
 */
export function getMockContext(prompt: string, model: string): MessageContext {
  const p = prompt.toLowerCase();

  if (p.includes("growth") || p.includes("summari")) {
    return {
      query: prompt,
      modelUsed: model,
      overallConfidence: 0.92,
      sources: [
        {
          type: "aggregate",
          label: "Monthly revenue aggregate",
          excerpt: "Jan: $1.9M → May: $4.4M (peak) → Jul: $3.6M",
          confidence: 0.95,
        },
        {
          type: "schema",
          label: "revenue, order_date columns",
          excerpt: "float, datetime — 0% null values",
          confidence: 0.98,
        },
        {
          type: "row",
          label: "Top 50 subscription renewals (NA region)",
          excerpt:
            "Rows 1004–1054 filtered by region='NA' AND is_returning=true",
          confidence: 0.88,
        },
      ],
    };
  }

  if (p.includes("region") || p.includes("top")) {
    return {
      query: prompt,
      modelUsed: model,
      overallConfidence: 0.89,
      sources: [
        {
          type: "aggregate",
          label: "Revenue by region (group by)",
          excerpt: "NA: $2.48M (65%), EMEA: $1.34M (28%), APAC: $0.27M (7%)",
          confidence: 0.94,
        },
        {
          type: "schema",
          label: "region, revenue columns",
          excerpt: "string with 1.2% nulls, float with 0% nulls",
          confidence: 0.96,
        },
      ],
    };
  }

  if (p.includes("compare") || p.includes("mom") || p.includes("month")) {
    return {
      query: prompt,
      modelUsed: model,
      overallConfidence: 0.94,
      sources: [
        {
          type: "aggregate",
          label: "MoM revenue deltas",
          excerpt: "+18.2% average, +23% peak (May), -18% dip (June)",
          confidence: 0.96,
        },
        {
          type: "row",
          label: "All 12,438 rows ordered by date",
          excerpt: "Time-series scan across full dataset",
          confidence: 0.91,
        },
      ],
    };
  }

  if (p.includes("churn") || p.includes("anomal")) {
    return {
      query: prompt,
      modelUsed: model,
      overallConfidence: 0.81,
      sources: [
        {
          type: "aggregate",
          label: "Anomaly detection scan",
          excerpt: "APAC enterprise churn rate spike: +1.7% above baseline",
          confidence: 0.85,
        },
        {
          type: "row",
          label: "127 flagged rows (APAC, enterprise)",
          excerpt: "Rows filtered by region='APAC' AND is_returning=false",
          confidence: 0.79,
        },
        {
          type: "schema",
          label: "is_returning column",
          excerpt: "bool — 4.5% null values may affect accuracy",
          confidence: 0.74,
        },
      ],
    };
  }

  // Default fallback.
  return {
    query: prompt,
    modelUsed: model,
    overallConfidence: 0.75,
    sources: [
      {
        type: "schema",
        label: "Full dataset schema",
        excerpt: "12,438 rows × 14 columns — all column types inferred",
        confidence: 0.85,
      },
    ],
  };
}
