// P29-E08
// עלות של בקשה מתוך usage. מחירים בדולר למיליון טוקנים — מהטבלה בשיעור 1 (לבדוק בדף התמחור לפני שמסתמכים)
export interface Prices {
  input: number;
  output: number;
  cacheWrite: number;
  cacheRead: number;
}

export interface Usage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
}

export const PRICES: Record<string, Prices> = {
  "claude-opus-5-5": { input: 4, output: 20, cacheWrite: 5, cacheRead: 0.2 },
  "claude-sonnet-5-5": { input: 2, output: 10, cacheWrite: 2.5, cacheRead: 0.2 },
  "claude-haiku-5-5": { input: 0.1, output: 0.5, cacheWrite: 0.125, cacheRead: 0.01 },
};

export function costUsd(model: string, usage: Usage): number {
  const p = PRICES[model];
  if (!p) throw new Error(`אין מחיר למודל ${model}`);
  // input_tokens לא כולל את מה שנכתב ל־cache או נקרא ממנו — שלושה מונים נפרדים
  const usd =
    (usage.input_tokens * p.input +
      usage.output_tokens * p.output +
      (usage.cache_creation_input_tokens ?? 0) * p.cacheWrite +
      (usage.cache_read_input_tokens ?? 0) * p.cacheRead) /
    1_000_000;
  return Math.round(usd * 1_000_000) / 1_000_000; // דיוק של מיליונית דולר — בלי זנבות של 0.1+0.2
}
