// P30-E17: pipelineStats — מעקב אחרי מועמדויות
export type Stage = "applied" | "screen" | "interview" | "offer" | "rejected";
export interface Application {
  company: string;
  stage: Stage;
  appliedAt: string;
  lastUpdate: string;
}

export function pipelineStats(apps: readonly Application[], now: Date, options: { followUpDays?: number } = {}): {
  total: number;
  byStage: Record<Stage, number>;
  responseRate: number;
  interviewRate: number;
  followUps: string[];
} {
  throw new Error("עוד לא כתבת את הפתרון");
}
