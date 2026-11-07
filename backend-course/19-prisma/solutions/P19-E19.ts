// P19-E19
import type { PrismaClient } from "../files/generated/prisma/client.ts";

const PRODUCTS = [
  { name: "Cold Brew Bottle 1L", price: 59.9, stock: 20 },
  { name: "Cold Brew Filter Bags", price: 34.9, stock: 100 },
];

export async function seedDemoData(prisma: PrismaClient) {
  const category = await prisma.category.upsert({ where: { name: "cold brew" }, create: { name: "cold brew" }, update: {} });
  for (const p of PRODUCTS) {
    const existing = await prisma.product.findFirst({ where: { name: p.name, categoryId: category.id } });
    if (!existing) await prisma.product.create({ data: { ...p, categoryId: category.id } });
  }
  const customer = await prisma.customer.upsert({
    where: { email: "demo@example.com" },
    create: { email: "demo@example.com", fullName: "Demo User", city: "Tel Aviv", joinedOn: new Date("2026-01-01") },
    update: {},
  });
  return { categoryId: category.id, customerId: customer.id };
}
