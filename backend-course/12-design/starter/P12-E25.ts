// P12-E25: מיכל DI
// register(name, factory) — קיים → Error(`השירות ${name} כבר רשום`)
// resolve(name) — singleton; לא רשום → Error(`השירות ${name} לא רשום`)
// מעגל → Error("תלות מעגלית: A -> B -> A")
export class Container {
  register(name: string, factory: (c: Container) => unknown): void {
    // כתוב כאן
  }

  resolve<T = unknown>(name: string): T {
    // כתוב כאן
  }
}
