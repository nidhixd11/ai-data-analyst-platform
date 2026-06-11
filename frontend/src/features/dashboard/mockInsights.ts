/**
 * Mock right-rail insights. Same shape the real /insights endpoint
 * will return once T-121 (auto-insight generator) is wired in.
 */

export interface MarketShareSlice {
  label: string;
  percentage: number;
  /** CSS color for the donut segment. */
  color: string;
}

export interface KPIRow {
  label: string;
  value: string;
  /** 0–100; drives the progress bar fill. */
  fillPct: number;
}

export interface AnomalyFlag {
  severity: "critical" | "warning";
  title: string;
  detail: string;
}

export interface RailInsights {
  marketShare: {
    headline: string;
    headlinePct: number;
    slices: MarketShareSlice[];
  };
  topRegion: {
    name: string;
    revenue: string;
    note: string;
  };
  liveKpis: KPIRow[];
  anomalies: AnomalyFlag[];
}

/**
 * Returns mock insights to drive the right rail.
 * Doesn't take any input yet; real version will use schema/profile context.
 */
export function getMockRailInsights(): RailInsights {
  return {
    marketShare: {
      headline: "65%",
      headlinePct: 65,
      slices: [
        { label: "Enterprise", percentage: 65, color: "var(--color-accent)" },
        {
          label: "SMB",
          percentage: 35,
          color: "color-mix(in oklab, var(--color-accent) 40%, transparent)",
        },
      ],
    },
    topRegion: {
      name: "North America",
      revenue: "$2.48M",
      note: "Stronger quarterly performance driving results",
    },
    liveKpis: [
      { label: "Retention Rate", value: "92.4%", fillPct: 92 },
      { label: "LTV Ratio", value: "3.6x", fillPct: 72 },
    ],
    anomalies: [
      {
        severity: "critical",
        title: "Unusual Churn",
        detail: "1.7% rise against cycle baseline",
      },
      {
        severity: "warning",
        title: "Delayed Sync",
        detail: "Marketing DB latency high",
      },
    ],
  };
}
