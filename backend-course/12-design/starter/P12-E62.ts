// P12-E62: שירות קופונים
// כתוב וייצא (export):
//   type Coupon = { code; percent; expiresAt; usesLeft; minTotal }
//   interface CouponRepository { find(code): Promise<Coupon | null>; save(c): Promise<void> }
//   class CouponError extends Error
//   class CouponService — constructor(coupons: CouponRepository, now: () => number)
//     async apply(code, total): Promise<number> — קוד: trim + אותיות גדולות
//     "קופון לא קיים" / "הקופון פג תוקף" / "הקופון נוצל" / "מינימום הזמנה: <minTotal>"
//     אחרת: save עם usesLeft - 1, ומחזיר סכום אחרי הנחה (2 ספרות)
//
// הרצה:   node 12-design/starter/P12-E62.ts
// בדיקה:  npm run check P12-E62
