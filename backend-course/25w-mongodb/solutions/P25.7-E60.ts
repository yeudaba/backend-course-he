// P25.7-E60: הזמנה מהעגלה — עם עותק של המחיר
type Product = { _id: string; name: string; price: number; stock: number };
type Item = { productId: string; name: string; price: number; qty: number };

export function buildOrder(products: Product[], cart: { productId: string; qty: number }[], customerId: string, now: Date) {
  if (cart.length === 0) throw new Error("EMPTY_CART");
  const byId = new Map(products.map((p) => [p._id, p]));
  const items = new Map<string, Item>();
  for (const { productId, qty } of cart) {
    if (!Number.isInteger(qty) || qty <= 0) throw new RangeError(`כמות לא תקינה: ${qty}`);
    const p = byId.get(productId);
    if (!p) throw new Error(`UNKNOWN_PRODUCT ${productId}`);
    const existing = items.get(productId);
    if (existing) existing.qty += qty;
    else items.set(productId, { productId, name: p.name, price: p.price, qty });
  }
  const list = [...items.values()];
  return {
    customerId,
    status: "pending" as const,
    createdAt: now,
    items: list,
    total: list.reduce((s, i) => s + i.price * i.qty, 0),
  };
}
