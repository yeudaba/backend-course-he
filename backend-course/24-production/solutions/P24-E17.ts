// P24-E17
export interface TakeResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

// דלי עם capacity אסימונים, שמתמלא בקצב קבוע. כל בקשה לוקחת אסימון.
// מאפשר "פרץ" של עד capacity בקשות, ובממוצע — refillPerSecond בשנייה
export class TokenBucket {
  #capacity: number;
  #rate: number;
  #now: () => number;
  #tokens: number;
  #last: number;

  constructor({ capacity, refillPerSecond, now = () => Date.now() }: { capacity: number; refillPerSecond: number; now?: () => number }) {
    if (capacity <= 0 || refillPerSecond <= 0) throw new RangeError("capacity ו־refillPerSecond חייבים להיות חיוביים");
    this.#capacity = capacity;
    this.#rate = refillPerSecond;
    this.#now = now;
    this.#tokens = capacity; // מתחיל מלא
    this.#last = now();
  }

  #refill() {
    const t = this.#now();
    // לא שומרים טיימר — מחשבים כמה התמלא מאז הפעם הקודמת
    this.#tokens = Math.min(this.#capacity, this.#tokens + ((t - this.#last) / 1000) * this.#rate);
    this.#last = t;
  }

  take(cost = 1): TakeResult {
    if (cost > this.#capacity) throw new RangeError("cost גדול מהקיבולת — הבקשה לעולם לא תעבור");
    this.#refill();
    if (this.#tokens >= cost) {
      this.#tokens -= cost;
      return { allowed: true, remaining: Math.floor(this.#tokens), retryAfterSeconds: 0 };
    }
    // לא מורידים כלום כשנדחה — אחרת לקוח שמנסה שוב ושוב לא יעבור לעולם
    const missing = cost - this.#tokens;
    return { allowed: false, remaining: Math.floor(this.#tokens), retryAfterSeconds: Math.ceil(missing / this.#rate) };
  }
}
