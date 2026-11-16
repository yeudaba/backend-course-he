// P30-E74: ציון עצמי לתשובה
export function scoreAnswer(answer: string, rubric: { id: string; any: string[] }[]) {
  const a = answer.toLowerCase();
  const missing = rubric.filter((r) => !r.any.some((k) => a.includes(k.toLowerCase()))).map((r) => r.id);
  return { score: rubric.length - missing.length, max: rubric.length, missing };
}
