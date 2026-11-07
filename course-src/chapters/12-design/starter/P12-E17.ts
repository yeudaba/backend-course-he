// P12-E17
export interface Repo<T extends { id: number }> {
  findById(id: number): Promise<T | null>;
  save(item: T): Promise<void>;
}

// עוטף repo אחר: findById מה־cache או מה־inner (גם null נשמר) | save מעדכן את שניהם | get hits / misses
export class CachedRepository<T extends { id: number }> implements Repo<T> {
  // כתוב כאן
}
