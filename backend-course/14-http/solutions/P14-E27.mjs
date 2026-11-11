// P14-E27: סטטיסטיקת בקשות כמחלקה
export class RequestStats {
  #routes = new Map();

  record(method, path, status, ms) {
    const route = `${method} ${path}`;
    const s = this.#routes.get(route) ?? { count: 0, totalMs: 0, errors: 0 };
    s.count++;
    s.totalMs += ms;
    if (status >= 500) {
      s.errors++;
    }
    this.#routes.set(route, s);
  }

  get total() {
    let sum = 0;
    for (const s of this.#routes.values()) {
      sum += s.count;
    }
    return sum;
  }

  summary() {
    return [...this.#routes]
      .map(([route, s]) => ({ route, count: s.count, avgMs: Math.round(s.totalMs / s.count), errors: s.errors }))
      .sort((a, b) => b.count - a.count || a.route.localeCompare(b.route));
  }
}

const stats = new RequestStats();
stats.record("GET", "/users", 200, 12);
stats.record("GET", "/users", 200, 20);
stats.record("POST", "/users", 201, 35);
stats.record("GET", "/orders", 500, 101);
stats.record("GET", "/users", 503, 3);
console.log(stats.total);
console.log(stats.summary());
