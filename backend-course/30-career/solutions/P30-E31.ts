// P30-E31 — מאגר key-value עם טרנזקציות מקוננות (מטלת בית קלאסית)
const DELETED = Symbol("deleted");
type Layer = Map<string, string | typeof DELETED>;

export class KVStore {
  #data = new Map<string, string>();
  #layers: Layer[] = [];

  get(key: string): string | null {
    for (let i = this.#layers.length - 1; i >= 0; i--) {
      const v = this.#layers[i].get(key);
      if (v === DELETED) return null;
      if (v !== undefined) return v;
    }
    return this.#data.get(key) ?? null;
  }

  set(key: string, value: string): void {
    const top = this.#layers.at(-1);
    if (top) top.set(key, value);
    else this.#data.set(key, value);
  }

  delete(key: string): boolean {
    const existed = this.get(key) !== null;
    const top = this.#layers.at(-1);
    if (top) top.set(key, DELETED);
    else this.#data.delete(key);
    return existed;
  }

  count(value: string): number {
    const seen = new Set<string>([...this.#data.keys(), ...this.#layers.flatMap((l) => [...l.keys()])]);
    let n = 0;
    for (const key of seen) if (this.get(key) === value) n++;
    return n;
  }

  begin(): void {
    this.#layers.push(new Map());
  }

  rollback(): void {
    if (this.#layers.length === 0) throw new Error("אין טרנזקציה פתוחה");
    this.#layers.pop();
  }

  commit(): void {
    const top = this.#layers.pop();
    if (!top) throw new Error("אין טרנזקציה פתוחה");
    const target = this.#layers.at(-1);
    for (const [key, value] of top) {
      if (target) target.set(key, value);
      else if (value === DELETED) this.#data.delete(key);
      else this.#data.set(key, value);
    }
  }

  get depth(): number {
    return this.#layers.length;
  }
}

const db = new KVStore();
db.set("a", "10");
db.begin();
db.set("a", "20");
db.begin();
db.delete("a");
console.log("depth", db.depth, "a =", db.get("a"));
db.rollback();
console.log("after rollback a =", db.get("a"));
db.commit();
console.log("after commit a =", db.get("a"), "depth", db.depth);
db.set("b", "20");
console.log("count('20') =", db.count("20"));
try {
  db.commit();
} catch (err) {
  console.log((err as Error).message);
}
