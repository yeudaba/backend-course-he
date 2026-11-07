// P11-E21: מתוקן
export type CatalogItem = { sku: string; price: number };

export function priceOf(catalog: CatalogItem[], sku: string): number | null {
  return catalog.find((c) => c.sku === sku)?.price ?? null;
}

export function cartPrice(catalog: CatalogItem[], skus: string[]): number {
  let total = 0;
  for (const sku of skus) {
    const price = priceOf(catalog, sku);
    if (price === null) {
      throw new Error(`מוצר לא קיים: ${sku}`);
    }
    total += price;
  }
  return total;
}

console.log(cartPrice([{ sku: "A", price: 10 }], ["A", "A"]));
