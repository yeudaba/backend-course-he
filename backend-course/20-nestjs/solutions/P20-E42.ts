// P20-E42: DI container קטן משלך
type Entry = { deps: string[]; factory: (...args: any[]) => unknown };

export class Container {
  private registry = new Map<string, Entry>();
  private instances = new Map<string, unknown>();
  private building: string[] = [];

  register(token: string, deps: string[], factory: (...args: any[]) => unknown): void {
    this.registry.set(token, { deps, factory });
  }

  get<T>(token: string): T {
    if (this.instances.has(token)) return this.instances.get(token) as T;
    const entry = this.registry.get(token);
    if (!entry) throw new Error(`Cannot resolve ${token}`);
    if (this.building.includes(token)) {
      const cycle = [...this.building.slice(this.building.indexOf(token)), token];
      throw new Error(`Circular dependency: ${cycle.join(" -> ")}`);
    }
    this.building.push(token);
    try {
      const args = entry.deps.map((dep) => {
        if (!this.registry.has(dep)) throw new Error(`Cannot resolve ${token}: missing ${dep}`);
        return this.get(dep);
      });
      const instance = entry.factory(...args);
      this.instances.set(token, instance);
      return instance as T;
    } finally {
      this.building.pop();
    }
  }
}
