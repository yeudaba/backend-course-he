// P11-E17
export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export function ok<T>(value: T): Result<T> {
  // כתוב כאן
}

export function fail<T = never>(error: string): Result<T> {
  // כתוב כאן
}

// שלם 0–120. "לא מספר" | "מחוץ לטווח"
export function parseAge(input: string): Result<number> {
  // כתוב כאן
}

// Result של הסכום, או הכישלון הראשון
export function sumResults(results: Result<number>[]): Result<number> {
  // כתוב כאן
}
