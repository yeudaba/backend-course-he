// P19-E64: Zod לפי המודל, ואז create
import { z } from "zod";
import type { PrismaClient } from "../files/generated/prisma/client.ts";

export const CustomerInput = z.object({
  fullName: z.string().trim().min(1),
  email: z.email().transform((e) => e.toLowerCase()),
  city: z.string().trim().min(1).nullable().default(null),
  joinedOn: z.iso.date(),
});

export async function createCustomer(prisma: PrismaClient, body: unknown) {
  const input = CustomerInput.parse(body);
  const c = await prisma.customer.create({
    data: { ...input, joinedOn: new Date(`${input.joinedOn}T00:00:00Z`) },
  });
  return { id: c.id, fullName: c.fullName, email: c.email, city: c.city, joinedOn: c.joinedOn.toISOString().slice(0, 10) };
}
