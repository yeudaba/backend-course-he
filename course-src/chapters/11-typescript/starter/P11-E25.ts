// P11-E25: mini validation library
export type Result<T> = { ok: true; value: T } | { ok: false; error: string };
export type Validator<T> = (value: unknown, path?: string) => Result<T>;
// הודעות (עם נתיב בהתחלה, למשל "items[1].qty: ..."; בלי נתיב — רק ההודעה):
//   "חייב להיות מחרוזת" | `לפחות ${min} תווים` | `לכל היותר ${max} תווים`
//   "חייב להיות מספר" | "חייב להיות מספר שלם" | `לפחות ${min}` | `לכל היותר ${max}`
//   "חייב להיות true או false" | "חייב להיות מערך" | "חייב להיות אובייקט"

export function string(opts: { min?: number; max?: number } = {}): Validator<string> {
  // כתוב כאן
}

export function number(opts: { min?: number; max?: number; integer?: boolean } = {}): Validator<number> {
  // כתוב כאן
}

export function boolean(): Validator<boolean> {
  // כתוב כאן
}

export function optional<T>(v: Validator<T>): Validator<T | undefined> {
  // כתוב כאן
}

export function array<T>(v: Validator<T>): Validator<T[]> {
  // כתוב כאן
}

// מחזיר אובייקט חדש רק עם השדות שב־shape (שדה optional חסר — לא נכלל)
export function object(shape: Record<string, Validator<unknown>>): Validator<Record<string, unknown>> {
  // כתוב כאן
}
