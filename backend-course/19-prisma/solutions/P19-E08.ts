// P19-E08
import { Prisma, type PrismaClient } from "../files/generated/prisma/client.ts";

export class AppError extends Error {
  code: string;
  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

export async function createCustomer(prisma: PrismaClient, data: { fullName: string; email: string; city?: string | null }) {
  try {
    return await prisma.customer.create({
      data: { fullName: data.fullName, email: data.email, city: data.city ?? null, joinedOn: new Date() },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") throw new AppError("EMAIL_TAKEN");
    throw err;
  }
}
