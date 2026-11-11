// P21-E28: רשימת חסימה לטוקנים (logout ל־access token)
export class TokenBlocklist {
  #blocked = new Map<string, number>();
  #now: () => number;

  constructor(now: () => number = () => Math.floor(Date.now() / 1000)) {
    this.#now = now;
  }

  block(jti: string, exp: number): void {
    if (exp <= this.#now()) return; // כבר פג תוקף — אין מה לחסום
    this.#blocked.set(jti, exp);
  }

  isBlocked(jti: string): boolean {
    const exp = this.#blocked.get(jti);
    return exp !== undefined && exp > this.#now();
  }

  cleanup(): number {
    const now = this.#now();
    let removed = 0;
    for (const [jti, exp] of this.#blocked) {
      if (exp <= now) {
        this.#blocked.delete(jti);
        removed++;
      }
    }
    return removed;
  }

  get size(): number {
    return this.#blocked.size;
  }
}

let now = 1000;
const list = new TokenBlocklist(() => now);
list.block("a", 1900);
list.block("b", 1100);
list.block("old", 900);
console.log(list.size, list.isBlocked("a"), list.isBlocked("old"));
now = 1200;
console.log(list.isBlocked("b"), list.cleanup(), list.size);
