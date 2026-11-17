// P26.5-E100: upcaster — מ־v1 ל־v2 בקריאה
type V2Data = { orderId: number; email: string; total: { amountCents: number; currency: string } };
type V2 = { type: "order.placed"; version: 2; data: V2Data };

export function upcast(e: { type: string; version: number; data: unknown }): V2 {
  if (e.type !== "order.placed") throw new Error(`סוג לא נתמך: ${e.type}`);
  switch (e.version) {
    case 2:
      return structuredClone(e) as V2;
    case 1: {
      const d = e.data as { orderId: number; email: string; total: number };
      return { ...structuredClone(e), type: "order.placed", version: 2, data: { ...d, total: { amountCents: Math.round(d.total * 100), currency: "ILS" } } };
    }
    default:
      throw new Error(`גרסה לא נתמכת: ${e.version}`);
  }
}
