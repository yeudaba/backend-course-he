// P19-E84: repository ללקוחות — עם Prisma
import { Prisma, type PrismaClient } from "../files/generated/prisma/client.ts";

export type Customer = { id: number; fullName: string; email: string; city: string | null };

export class AppError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

const SELECT = { id: true, fullName: true, email: true, city: true } as const;
const known = (err: unknown, code: string) => err instanceof Prisma.PrismaClientKnownRequestError && err.code === code;

export class PrismaCustomersRepository {
  private prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findById(id: number): Promise<Customer | undefined> {
    return (await this.prisma.customer.findUnique({ where: { id }, select: SELECT })) ?? undefined;
  }

  async findByEmail(email: string): Promise<Customer | undefined> {
    return (await this.prisma.customer.findFirst({ where: { email: { equals: email, mode: "insensitive" } }, select: SELECT })) ?? undefined;
  }

  async insert(data: Omit<Customer, "id">): Promise<Customer> {
    const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z");
    try {
      return await this.prisma.customer.create({ data: { ...data, joinedOn: today }, select: SELECT });
    } catch (err) {
      if (known(err, "P2002")) throw new AppError("EMAIL_TAKEN");
      throw err;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.customer.delete({ where: { id } });
      return true;
    } catch (err) {
      if (known(err, "P2025")) return false;
      throw err;
    }
  }
}
