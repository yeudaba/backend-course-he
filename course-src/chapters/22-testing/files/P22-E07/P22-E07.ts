// P22-E07 — הקוד שבודקים (לא משנים אותו)
export interface Item {
  price: number;
  qty: number;
}

export interface Coupon {
  type: "percent" | "fixed";
  value: number; // אחוזים (10 = 10%) או שקלים
  minTotal?: number; // הקופון חל רק מסכום כזה ומעלה (כולל)
}

// סכום העגלה אחרי קופון: לא שלילי, מעוגל לאגורות
export function cartTotal(items: Item[], coupon?: Coupon): number {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  let discount = 0;
  if (coupon && subtotal >= (coupon.minTotal ?? 0)) {
    discount = coupon.type === "percent" ? subtotal * (coupon.value / 100) : coupon.value;
  }
  const total = Math.max(0, subtotal - discount);
  return Math.round(total * 100) / 100;
}
