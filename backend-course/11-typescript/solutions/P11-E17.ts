// P11-E17
export type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function fail<T = never>(error: string): Result<T> {
  return { ok: false, error };
}

export function parseAge(input: string): Result<number> {
  const n = Number(input);
  if (input.trim() === "" || !Number.isInteger(n)) {
    return fail("לא מספר");
  }
  if (n < 0 || n > 120) {
    return fail("מחוץ לטווח");
  }
  return ok(n);
}

export function sumResults(results: Result<number>[]): Result<number> {
  let total = 0;
  for (const r of results) {
    if (!r.ok) {
      return r;
    }
    total += r.value;
  }
  return ok(total);
}

console.log(parseAge("30"), sumResults([parseAge("30"), parseAge("abc"), parseAge("500")]));
