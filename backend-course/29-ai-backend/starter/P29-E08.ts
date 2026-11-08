// P29-E08: costUsd — כמה עלתה בקשה, מתוך usage
export interface Prices {
  input: number; // $ למיליון טוקנים
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

// מלא לפי הטבלה בשיעור 1 (input, output, cache write ≈ ×1.25 מהקלט, cache read)
export const PRICES: Record<string, Prices> = {};

export function costUsd(model: string, usage: Usage): number {
  throw new Error("עוד לא כתבת את הפתרון");
}
