// P30-E13: latencyReport — סימולציית ראיון, שאלת קוד
export interface EndpointStats {
  endpoint: string;
  count: number;
  p95: number;
  errorRate: number;
}

export function latencyReport(lines: readonly string[]): { endpoints: EndpointStats[]; skipped: number } {
  throw new Error("עוד לא כתבת את הפתרון");
}
