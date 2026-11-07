// P11-E13: הגדר את CartItem: { sku, name, price, qty }
export type CartItem = {
  // כתוב כאן
};

// סכום מעוגל ל־2 ספרות
export function cartTotal(cart: readonly CartItem[]): number {
  // כתוב כאן
}

// עגלה חדשה; sku קיים → מגדילים כמות
export function addItem(cart: readonly CartItem[], item: CartItem): CartItem[] {
  // כתוב כאן
}

// עגלה חדשה בלי הפריט
export function removeSku(cart: readonly CartItem[], sku: string): CartItem[] {
  // כתוב כאן
}
