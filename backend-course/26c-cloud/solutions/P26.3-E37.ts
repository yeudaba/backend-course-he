// P26.3-E37: handler של Lambda מאחורי API Gateway
type Event = { httpMethod: string; path: string; body: string | null; isBase64Encoded?: boolean };

const json = (statusCode: number, data: unknown) => ({ statusCode, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
const isInt = (x: unknown, min: number, max: number) => Number.isInteger(x) && (x as number) >= min && (x as number) <= max;

export async function handler(event: Event) {
  if (event.httpMethod === "GET" && event.path === "/health") return json(200, { ok: true });
  if (event.httpMethod === "POST" && event.path === "/orders") {
    const raw = event.body && event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body;
    let data: { productId?: unknown; qty?: unknown };
    try {
      data = JSON.parse(raw ?? "");
    } catch {
      return json(400, { error: "JSON לא תקין" });
    }
    if (!data || typeof data !== "object") return json(400, { error: "גוף לא תקין" });
    if (!isInt(data.productId, 1, Number.MAX_SAFE_INTEGER)) return json(400, { error: "productId לא תקין" });
    if (!isInt(data.qty, 1, 10)) return json(400, { error: "qty בין 1 ל־10" });
    return json(202, { accepted: true, productId: data.productId, qty: data.qty });
  }
  return json(404, { error: "not found" });
}
