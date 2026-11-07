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

export class UserService {
  #users: UserRepository;

  constructor(users: UserRepository) {
    this.#users = users;
  }

  async register(input: { email: string; name: string }): Promise<User> {
    const email = input.email.trim().toLowerCase();
    if (await this.#users.findByEmail(email)) {
      throw new ConflictError("האימייל כבר רשום");
    }
    const user: User = { id: (await this.#users.count()) + 1, email, name: input.name.trim() };
    await this.#users.save(user);
    return user;
  }

  async getById(id: number): Promise<User> {
    const user = await this.#users.findById(id);
    if (!user) {
      throw new NotFoundError("משתמש", id);
    }
    return user;
  }

  async rename(id: number, name: string): Promise<User> {
    if (name.trim() === "") {
      throw new ValidationError("name", "שם חובה");
    }
    const user = await this.getById(id);
    const updated = { ...user, name: name.trim() };
    await this.#users.save(updated);
    return updated;
  }
}

const service = new UserService(new InMemoryUserRepository());
await service.register({ email: "Dana@X.com", name: "דנה" });
console.log(await service.rename(1, "דנה כהן"));
