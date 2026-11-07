// P12-E08: ShoppingCart
export type CartLine = { sku: string; price: number; qty: number };

// add(sku, price, qty = 1) — sku קיים: מוסיף לכמות. qty/price לא חיוביים → Error("כמות ומחיר חייבים להיות חיוביים")
// remove(sku) → true/false | get total (2 ספרות) | get itemCount | items() → עותקים
export class ShoppingCart {
  // כתוב כאן
}
