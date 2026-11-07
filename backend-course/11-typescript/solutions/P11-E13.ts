// P11-E13
export type CartItem = { sku: string; name: string; price: number; qty: number };

export function cartTotal(cart: readonly CartItem[]): number {
  return Math.round(cart.reduce((s, it) => s + it.price * it.qty, 0) * 100) / 100;
}

export function addItem(cart: readonly CartItem[], item: CartItem): CartItem[] {
  if (cart.some((it) => it.sku === item.sku)) {
    return cart.map((it) => (it.sku === item.sku ? { ...it, qty: it.qty + item.qty } : it));
  }
  return [...cart, item];
}

export function removeSku(cart: readonly CartItem[], sku: string): CartItem[] {
  return cart.filter((it) => it.sku !== sku);
}

const cart = addItem(addItem([], { sku: "A", name: "עט", price: 2.5, qty: 2 }), { sku: "A", name: "עט", price: 2.5, qty: 1 });
console.log(cart, cartTotal(cart));
