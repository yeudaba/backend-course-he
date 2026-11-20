// P26.3-E102: Lambda של מוצרים — מתוקן
type Event = { httpMethod: string; path: string; queryStringParameters: Record<string, string> | null; body: string | null; isBase64Encoded?: boolean };
const products = [
  { id: 1, name: "Ethiopia", category: "beans", price: 62 },
  { id: 2, name: "V60", category: "gear", price: 89 },
  { id: 3, name: "Espresso Blend", category: "beans", price: 48 },
];
const json = (statusCode: number, data: unknown) => ({ statusCode, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });

export async function handler(event: Event) {
  if (event.httpMethod === "GET" && event.path === "/products") {
    const category = event.queryStringParameters?.category;
    return json(200, category ? products.filter((p) => p.category === category) : products);
  }
  if (event.httpMethod === "POST" || event.path === "/products") {
    const raw = event.isBase64Encoded && event.body ? Buffer.from(event.body, "base64").toString("utf8") : event.body;
    let data: { name?: unknown; price?: unknown };
    try {
      data = JSON.parse(raw ?? "");
    } catch {
      return json(400, { error: "JSON לא תקין" });
    }
    if (typeof data.name !== "string" || typeof data.price !== "number" || !(data.price > 0)) return json(400, { error: "name ו־price חיובי" });
    return json(201, { id: products.length + 1, name: data.name, price: data.price });
  }
  return json(404, { error: "not found" });
}
