export interface ChartConfig {
  chart_type: "bar" | "line" | "scatter" | "histogram";
  title: string;
  x_axis: string;
  y_axis: string;
  data: Record<string, unknown>[];
}