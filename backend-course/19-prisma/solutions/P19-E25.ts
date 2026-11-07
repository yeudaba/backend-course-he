// P19-E25
import type { PrismaClient } from "../files/generated/prisma/client.ts";

export async function monthlyReport(prisma: PrismaClient, year: number) {
  return prisma.$queryRaw<{ month: string; orders: number; revenue: number; runningTotal: number }[]>`
    WITH sales AS (
      SELECT EXTRACT(MONTH FROM o.created_at AT TIME ZONE 'UTC')::int AS m,
             COUNT(DISTINCT o.id) AS orders,
             SUM(oi.quantity * oi.unit_price) AS revenue
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      WHERE o.status <> 'cancelled'
        AND o.created_at >= make_timestamptz(${year}::int, 1, 1, 0, 0, 0, 'UTC')
        AND o.created_at <  make_timestamptz(${year}::int + 1, 1, 1, 0, 0, 0, 'UTC')
      GROUP BY 1
    )
    SELECT to_char(make_date(${year}::int, g.m, 1), 'YYYY-MM') AS month,
           COALESCE(s.orders, 0)::int AS orders,
           COALESCE(s.revenue, 0)::float AS revenue,
           (SUM(COALESCE(s.revenue, 0)) OVER (ORDER BY g.m))::float AS "runningTotal"
    FROM generate_series(1, 12) AS g(m)
    LEFT JOIN sales s ON s.m = g.m
    ORDER BY g.m`;
}
