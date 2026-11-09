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
  const failures: string[] = [];
  const names = t.toolCalls.map((c) => c.name);
  for (const n of e.mustCall ?? []) if (!names.includes(n)) failures.push(`לא קרא ל־${n}`);
  for (const n of e.mustNotCall ?? []) if (names.includes(n)) failures.push(`קרא ל־${n}, שאסור`);
  for (const [a, b] of e.order ?? []) {
    const ia = names.indexOf(a);
    const ib = names.indexOf(b);
    if (ib !== -1 && (ia === -1 || ia > ib)) failures.push(`קרא ל־${b} לפני ${a}`);
  }
  if (e.maxSteps !== undefined && t.steps > e.maxSteps) failures.push(`${t.steps} צעדים (מותר ${e.maxSteps})`);
  if (e.maxToolCalls !== undefined && names.length > e.maxToolCalls) failures.push(`${names.length} קריאות לכלים (מותר ${e.maxToolCalls})`);
  const text = t.finalText.toLowerCase();
  for (const s of e.finalIncludes ?? []) if (!text.includes(s.toLowerCase())) failures.push(`התשובה לא כוללת "${s}"`);
  for (const s of e.finalExcludes ?? []) if (text.includes(s.toLowerCase())) failures.push(`התשובה כוללת "${s}"`);
  return { pass: failures.length === 0, failures };
}
