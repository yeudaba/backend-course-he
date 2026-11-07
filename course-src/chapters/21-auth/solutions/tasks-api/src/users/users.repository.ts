export type Role = "user" | "admin";

export interface User {
  id: number;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
}

// מה שיוצא החוצה — אף פעם לא passwordHash
export type PublicUser = Omit<User, "passwordHash">;
export const toPublicUser = ({ passwordHash, ...user }: User): PublicUser => user;

export const USERS_REPOSITORY = "USERS_REPOSITORY";

export interface UsersRepository {
  findByEmail(email: string): Promise<User | undefined>;
  findById(id: number): Promise<User | undefined>;
  // undefined ← האימייל כבר תפוס (גם במרוץ: ה־unique במסד הוא ההגנה האמיתית)
  insert(data: Omit<User, "id">): Promise<User | undefined>;
  list(): Promise<User[]>;
}

export class InMemoryUsersRepository implements UsersRepository {
  #users: User[] = [];
  #nextId = 1;

  async findByEmail(email: string) {
    const user = this.#users.find((u) => u.email === email);
    return user && { ...user };
  }

  async findById(id: number) {
    const user = this.#users.find((u) => u.id === id);
    return user && { ...user };
  }

  async insert(data: Omit<User, "id">) {
    if (this.#users.some((u) => u.email === data.email)) return undefined;
    const user = { id: this.#nextId++, ...data };
    this.#users.push(user);
    return { ...user };
  }

  async list() {
    return this.#users.map((u) => ({ ...u }));
  }
}
