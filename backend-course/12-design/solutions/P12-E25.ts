// P12-E25: מיכל DI מינימלי
export class Container {
  #factories = new Map<string, (c: Container) => unknown>();
  #instances = new Map<string, unknown>();
  #resolving: string[] = [];

  register(name: string, factory: (c: Container) => unknown): void {
    if (this.#factories.has(name)) {
      throw new Error(`השירות ${name} כבר רשום`);
    }
    this.#factories.set(name, factory);
  }

  resolve<T = unknown>(name: string): T {
    if (this.#instances.has(name)) {
      return this.#instances.get(name) as T;
    }
    const factory = this.#factories.get(name);
    if (!factory) {
      throw new Error(`השירות ${name} לא רשום`);
    }
    if (this.#resolving.includes(name)) {
      const cycle = [...this.#resolving.slice(this.#resolving.indexOf(name)), name];
      throw new Error(`תלות מעגלית: ${cycle.join(" -> ")}`);
    }
    this.#resolving.push(name);
    try {
      const instance = factory(this);
      this.#instances.set(name, instance);
      return instance as T;
    } finally {
      this.#resolving.pop();
    }
  }
}

class Repo {}
class Service {
  repo: Repo;
  constructor(repo: Repo) {
    this.repo = repo;
  }
}
const c = new Container();
c.register("repo", () => new Repo());
c.register("service", (ct) => new Service(ct.resolve<Repo>("repo")));
const s = c.resolve<Service>("service");
console.log(s === c.resolve("service"), s.repo === c.resolve("repo"));

c.register("A", (ct) => ct.resolve("B"));
c.register("B", (ct) => ct.resolve("A"));
try {
  c.resolve("A");
} catch (err) {
  console.log((err as Error).message);
}
