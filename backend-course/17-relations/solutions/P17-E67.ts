// P17-E67: דוח עם קיבוץ לבחירה
import { z } from "zod";

export const ReportQuery = z.object({
  by: z.enum(["city", "status", "month"]),
  minOrders: z.coerce.number().int().min(1).default(1),
});

const KEYS: Record<z.infer<typeof ReportQuery>["by"], string> = {
  city: "COALESCE(c.city, 'unknown')",
  status: "o.status",
  month: "date_trunc('month', o.created_at)::date::text",
};

export function buildReport(query: unknown): { text: string; values: unknown[] } {
  const { by, minOrders } = ReportQuery.parse(query);
  const text = `SELECT ${KEYS[by]} AS key, COUNT(*) AS orders
FROM orders o
JOIN customers c ON c.id = o.customer_id
GROUP BY 1
HAVING COUNT(*) >= $1
ORDER BY orders DESC, key`;
  return { text, values: [minOrders] };
}
