// P11-E20: מתוקן
export type LineItem = { name: string; unitPrice: number; quantity: number };

export function lineTotal(item: LineItem): number {
  return item.unitPrice * item.quantity;
}

export function orderTotal(items: LineItem[], shipping: number): number {
  return items.reduce((s, it) => s + lineTotal(it), 0) + shipping;
}

export function parseShipping(input: string): number {
  return Number(input);
}

console.log(orderTotal([{ name: "עט", unitPrice: 5, quantity: 2 }], parseShipping("20")));
