// P19-E77: toApiOrder — מה־client ל־API
export type ApiOrder = { id: number; customerId: number; status: string; createdAt: string; items: { productId: number; quantity: number; unitPrice: number }[]; total: number };

export function toApiOrder(o: { id: number; customerId: number; status: string; createdAt: Date; items: { productId: number; quantity: number; unitPrice: unknown }[] }): ApiOrder {
  const items = [...o.items]
    .sort((a, b) => a.productId - b.productId)
    .map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: Number(i.unitPrice) }));
  const cents = items.reduce((sum, i) => sum + Math.round(i.unitPrice * 100) * i.quantity, 0);
  return { id: o.id, customerId: o.customerId, status: o.status, createdAt: o.createdAt.toISOString(), items, total: cents / 100 };
}
