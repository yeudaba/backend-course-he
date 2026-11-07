// P19-E13
import type { PrismaClient } from "../files/generated/prisma/client.ts";

export async function revenueByCategory(prisma: PrismaClient, { since }: { since: Date }) {
  return prisma.$queryRaw<{ category: string; revenue: number }[]>`
    SELECT c.name AS category, SUM(oi.quantity * oi.unit_price)::float AS revenue
    FROM order_items oi
    JOIN orders o     ON o.id = oi.order_id
    JOIN products p   ON p.id = oi.product_id
    JOIN categories c ON c.id = p.category_id
    WHERE o.status <> 'cancelled' AND o.created_at >= ${since}
    GROUP BY c.name
    ORDER BY revenue DESC`;
}
