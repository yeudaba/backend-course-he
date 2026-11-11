// P29.5-E26 — שומר לולאה לסוכן: צעדים, חזרות ועלות
export function stableKey(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableKey).join(",")}]`;
  if (value !== null && typeof value === "object") {
    const entries = Object.keys(value)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stableKey((value as Record<string, unknown>)[k])}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value) ?? "null";
}

type Limits = { maxSteps: number; maxRepeats: number; maxCostUsd: number };
export type Verdict = { ok: true } | { ok: false; reason: "steps" | "repeat" | "cost"; message: string };

export class LoopGuard {
  #limits: Limits;
  #steps = 0;
  #cost = 0;
  #calls = new Map<string, number>();

  constructor(limits: Limits) {
    this.#limits = limits;
  }

  check(tool: string, input: unknown, costUsd: number): Verdict {
    this.#steps++;
    this.#cost += costUsd;
    const key = `${tool}:${stableKey(input)}`;
    const times = (this.#calls.get(key) ?? 0) + 1;
    this.#calls.set(key, times);

    if (this.#steps > this.#limits.maxSteps) return { ok: false, reason: "steps", message: `יותר מ־${this.#limits.maxSteps} צעדים` };
    if (this.#cost > this.#limits.maxCostUsd) return { ok: false, reason: "cost", message: `העלות עברה $${this.#limits.maxCostUsd}` };
    if (times > this.#limits.maxRepeats) return { ok: false, reason: "repeat", message: `${tool} נקרא ${times} פעמים עם אותו קלט` };
    return { ok: true };
  }

  get steps(): number {
    return this.#steps;
  }

  get costUsd(): number {
    return Math.round(this.#cost * 10_000) / 10_000;
  }
}

console.log(stableKey({ b: [1, { y: 2, x: 1 }], a: "שלום" }), stableKey({ a: "שלום", b: [1, { x: 1, y: 2 }] }));
const guard = new LoopGuard({ maxSteps: 10, maxRepeats: 2, maxCostUsd: 0.5 });
console.log(guard.check("search_orders", { email: "dana@example.com", status: "open" }, 0.01));
console.log(guard.check("get_order", { id: 17 }, 0.01));
console.log(guard.check("search_orders", { status: "open", email: "dana@example.com" }, 0.01));
console.log(guard.check("search_orders", { email: "dana@example.com", status: "open" }, 0.01));
console.log(guard.steps, guard.costUsd);
