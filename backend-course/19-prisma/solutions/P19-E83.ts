// P19-E83: repository ללקוחות — בזיכרון
export type Customer = { id: number; fullName: string; email: string; city: string | null };

export interface CustomersRepository {
  findById(id: number): Promise<Customer | undefined>;
  findByEmail(email: string): Promise<Customer | undefined>;
  insert(data: Omit<Customer, "id">): Promise<Customer>;
  delete(id: number): Promise<boolean>;
}

export class AppError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

export class InMemoryCustomersRepository implements CustomersRepository {
  private rows = new Map<number, Customer>();

  constructor(initial: Customer[] = []) {
    for (const c of initial) this.rows.set(c.id, { ...c });
  }

  async findById(id: number) {
    const c = this.rows.get(id);
    return c ? { ...c } : undefined;
  }

  async findByEmail(email: string) {
    const e = email.toLowerCase();
    const c = [...this.rows.values()].find((r) => r.email.toLowerCase() === e);
    return c ? { ...c } : undefined;
  }

  async insert(data: Omit<Customer, "id">) {
    if (await this.findByEmail(data.email)) throw new AppError("EMAIL_TAKEN");
    const c = { id: Math.max(0, ...this.rows.keys()) + 1, ...data };
    this.rows.set(c.id, c);
    return { ...c };
  }

  async delete(id: number) {
    return this.rows.delete(id);
  }
}
