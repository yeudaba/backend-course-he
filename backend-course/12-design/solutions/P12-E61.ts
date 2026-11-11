// P12-E61: repository למשתמשים
export type User = { id: number; email: string; name: string };

export interface UserRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: number): Promise<boolean>;
}

export class InMemoryUserRepository implements UserRepository {
  #items = new Map<number, User>();

  async findById(id: number): Promise<User | null> {
    const u = this.#items.get(id);
    return u ? { ...u } : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const key = email.trim().toLowerCase();
    for (const u of this.#items.values()) {
      if (u.email.trim().toLowerCase() === key) return { ...u };
    }
    return null;
  }

  async save(user: User): Promise<void> {
    this.#items.set(user.id, { ...user });
  }

  async delete(id: number): Promise<boolean> {
    return this.#items.delete(id);
  }
}

async function demo() {
  const repo = new InMemoryUserRepository();
  await repo.save({ id: 1, email: "Dana@Mail.com", name: "דנה" });
  console.log(await repo.findByEmail("  dana@mail.COM "));
  console.log(await repo.delete(1), await repo.delete(1), await repo.findById(1));
}
demo();
