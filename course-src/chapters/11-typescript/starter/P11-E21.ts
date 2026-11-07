// P11-E21: חתימה לא כנה.
// priceOf → number | null | cartPrice: מוצר לא קיים → throw Error(`מוצר לא קיים: ${sku}`)
export type CatalogItem = { sku: string; price: number };

export function priceOf(catalog: CatalogItem[], sku: string): number {
  return catalog.find((c) => c.sku === sku)!.price;
}

export function cartPrice(catalog: CatalogItem[], skus: string[]): number {
  let total = 0;
  for (const sku of skus) {
    total += priceOf(catalog, sku);
  }
  return total;
}
