// P12-E15
export type User = { id: number; email: string; name: string };

export interface UserRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  count(): Promise<number>;
  save(user: User): Promise<void>;
}

export class InMemoryUserRepository implements UserRepository {
  #users = new Map<number, User>();
  async findById(id: number) {
    const u = this.#users.get(id);
    return u ? { ...u } : null;
  }
  async findByEmail(email: string) {
    for (const u of this.#users.values()) if (u.email === email) return { ...u };
    return null;
  }
  async count() {
    return this.#users.size;
  }
  async save(user: User) {
    this.#users.set(user.id, { ...user });
  }
}

export class NotFoundError extends Error {
  constructor(entity: string, id: number) {
    super(`${entity} ${id} לא נמצא`);
    this.name = "NotFoundError";
  }
}
export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}
export class ValidationError extends Error {
  readonly field: string;
  constructor(field: string, message: string) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

// constructor(users: UserRepository)
// register({ email, name }) — email מנורמל; קיים → ConflictError("האימייל כבר רשום"); id = count + 1
// getById(id) → או NotFoundError("משתמש", id)
// rename(id, name) — ריק → ValidationError("name", "שם חובה")
export class UserService {
  // כתוב כאן
}
