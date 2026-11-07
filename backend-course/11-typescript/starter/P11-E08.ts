// P11-E08: הגדר וייצא את הטיפוס Product, והשלם.
// Product: id (מספר, readonly), name, price, tags (מערך מחרוזות), stock (אופציונלי, מספר)
export type Product = {
  // כתוב כאן
};

// tags: [], בלי stock
export function createProduct(id: number, name: string, price: number): Product {
  // כתוב כאן
}

// עותק עם מחיר מוזל, מעוגל ל־2 ספרות
export function withDiscount(p: Product, percent: number): Product {
  // כתוב כאן
}

// stock > 0 (stock חסר → false)
export function isAvailable(p: Product): boolean {
  // כתוב כאן
}
