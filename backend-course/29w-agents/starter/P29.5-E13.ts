// P29.5-E13: eval על המסלול — לא רק "מה ענה", אלא "איך הגיע לשם"
export interface Trajectory {
  toolCalls: { name: string; input: unknown }[];
  finalText: string;
  steps: number;
}

export interface Expectations {
  mustCall?: string[];
  mustNotCall?: string[];
  order?: [string, string][]; // [a, b]: הקריאה הראשונה ל־a לפני הקריאה הראשונה ל־b
  maxSteps?: number;
  maxToolCalls?: number;
  finalIncludes?: string[];
  finalExcludes?: string[];
}

export function evaluateTrajectory(t: Trajectory, e: Expectations): { pass: boolean; failures: string[] } {
  throw new Error("עוד לא כתבת את הפתרון");
}
