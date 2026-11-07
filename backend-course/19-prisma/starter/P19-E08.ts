// P19-E08
// createCustomer(prisma, { fullName, email, city }) → הלקוח | EMAIL_TAKEN
import { Prisma, type PrismaClient } from "../files/generated/prisma/client.ts";
export class AppError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

export async function createCustomer(prisma: PrismaClient, data: { fullName: string; email: string; city?: string | null }) {
  // כתוב כאן
}
