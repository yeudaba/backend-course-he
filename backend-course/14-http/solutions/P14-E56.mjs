// P14-E56: מאובייקט פנימי ל־JSON של API
const camel = (key) => key.replace(/_([a-z])/g, (all, ch) => ch.toUpperCase());

export function toApiJson(value) {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(toApiJson);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [camel(k), toApiJson(v)]),
    );
  }
  return value;
}

const row = {
  order_id: 17,
  created_at: new Date("2026-11-01T10:00:00Z"),
  shipped_at: null,
  internal_note: undefined,
  total_agorot: 5970,
  customer: { full_name: "דנה לוי", vipLevel: 2 },
  items: [{ product_id: 3, unit_price_agorot: 1990 }],
};
console.log(JSON.stringify(toApiJson(row), null, 2));
