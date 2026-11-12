// P22-E69: expect משלך — toBe, toEqual, toMatchObject, toThrow
type Ctor = new (...args: any[]) => Error;

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const keys = (o: Record<string, unknown>) => Object.keys(o).filter((k) => o[k] !== undefined);

function equal(a: unknown, b: unknown, partial: boolean): boolean {
  if (!isObj(a) || !isObj(b)) return Object.is(a, b);
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((x, i) => equal(x, b[i], partial));
  }
  if (a instanceof Date || b instanceof Date) {
    return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
  }
  if (partial) return Object.keys(b).every((k) => k in a && equal(a[k], b[k], true));
  const kb = keys(b);
  return keys(a).length === kb.length && kb.every((k) => equal(a[k], b[k], false));
}

export function expect(actual: unknown) {
  const fail = (what: string) => {
    throw new Error(`expect(${JSON.stringify(actual)}) ${what}`);
  };
  return {
    toBe(expected: unknown) {
      if (!Object.is(actual, expected)) fail(`toBe(${JSON.stringify(expected)})`);
    },
    toEqual(expected: unknown) {
      if (!equal(actual, expected, false)) fail(`toEqual(${JSON.stringify(expected)})`);
    },
    toMatchObject(expected: object) {
      if (!equal(actual, expected, true)) fail(`toMatchObject(${JSON.stringify(expected)})`);
    },
    toThrow(expected?: string | RegExp | Ctor) {
      if (typeof actual !== "function") return fail("toThrow — צריך פונקציה");
      let thrown: unknown;
      let didThrow = false;
      try {
        (actual as () => unknown)();
      } catch (err) {
        didThrow = true;
        thrown = err;
      }
      if (!didThrow) return fail("toThrow — לא נזרקה שגיאה");
      const message = thrown instanceof Error ? thrown.message : String(thrown);
      if (typeof expected === "string" && !message.includes(expected)) fail(`toThrow("${expected}")`);
      if (expected instanceof RegExp && !expected.test(message)) fail(`toThrow(${expected})`);
      if (typeof expected === "function" && !(thrown instanceof expected)) fail(`toThrow(${expected.name})`);
    },
  };
}
