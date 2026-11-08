// לוג גישה לדוגמה — משותף ל־E13 ול־E21
export const log = [
  ...Array.from({ length: 20 }, (_, i) => `2026-11-08T10:00:${String(i).padStart(2, "0")}Z GET /products?page=${i % 3} 200 ${(i + 1) * 10}ms`),
  "2026-11-08T10:01:00Z GET /orders/17 200 1000ms",
  "2026-11-08T10:01:01Z GET /orders/23 500 200ms",
  "2026-11-08T10:01:02Z GET /orders/23/items 200 90ms",
  "2026-11-08T10:01:03Z POST /orders 201 300ms",
  "2026-11-08T10:01:04Z POST /orders 503 900ms",
  "2026-11-08T10:01:05Z POST /orders 201 250ms",
  "garbage line",
  "",
];
