// P12-E80: הרשמה מקצה לקצה
export class ValidationError extends Error {
  readonly field: string;
  constructor(field: string, message: string) {
    super(message);
    this.name = new.target.name;
    this.field = field;
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

type SignupDto = { email: string; name: string; password: string };
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function parseSignup(input: unknown): SignupDto {
  if (typeof input !== "object" || input === null || Array.isArray(input)) throw new ValidationError("body", "body לא תקין");
  const email = "email" in input && typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  if (!EMAIL.test(email)) throw new ValidationError("email", "email לא תקין");
  const name = "name" in input && typeof input.name === "string" ? input.name.trim() : "";
  if (name === "") throw new ValidationError("name", "name לא תקין");
  const password = "password" in input && typeof input.password === "string" ? input.password : "";
  if (password.length < 8) throw new ValidationError("password", "password לא תקין");
  return { email, name, password };
}

export type User = { id: number; email: string; name: string; passwordHash: string };

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  insert(u: Omit<User, "id">): Promise<User>;
}

export class SignupService {
  #users: UserRepository;
  #hash: (password: string) => string;

  constructor(users: UserRepository, hash: (password: string) => string) {
    this.#users = users;
    this.#hash = hash;
  }

  async signup(input: unknown): Promise<{ id: number; email: string; name: string }> {
    const dto = parseSignup(input);
    if (await this.#users.findByEmail(dto.email)) throw new ConflictError("האימייל כבר רשום");
    const u = await this.#users.insert({ email: dto.email, name: dto.name, passwordHash: this.#hash(dto.password) });
    return { id: u.id, email: u.email, name: u.name };
  }
}

const rows: User[] = [];
const repo: UserRepository = {
  async findByEmail(email) {
    return rows.find((u) => u.email === email) ?? null;
  },
  async insert(u) {
    const user = { ...u, id: rows.length + 1 };
    rows.push(user);
    return { ...user };
  },
};
const service = new SignupService(repo, (p) => `hash(${p.length})`);
async function demo() {
  console.log(await service.signup({ email: " Dana@Mail.com ", name: "דנה", password: "12345678", isAdmin: true }));
  for (const body of [{ email: "dana@mail.com", name: "x", password: "abcdefgh" }, { email: "a@b", name: "x", password: "abcdefgh" }]) {
    try {
      await service.signup(body);
    } catch (err) {
      console.log(String(err));
    }
  }
  console.log(rows);
}
demo();
