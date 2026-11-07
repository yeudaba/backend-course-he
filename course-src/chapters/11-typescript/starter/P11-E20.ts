// P11-E20: רץ ב־node — אבל tsc מוצא שגיאות, ושתיים מהן באגים אמיתיים.
// orderTotal([{ name: "עט", unitPrice: 5, quantity: 2 }], parseShipping("20")) → 30
export type LineItem = { name: string; unitPrice: number; quantity: number };

export function lineTotal(item: LineItem) {
  return item.unitPrice * item.qty;
}

export function orderTotal(items, shipping: number): number {
  return items.reduce((s, it) => s + lineTotal(it), 0) + shipping;
}

export function parseShipping(input: string) {
  return input;
}

console.log(orderTotal([{ name: "עט", unitPrice: 5, quantity: 2 }], parseShipping("20")));
