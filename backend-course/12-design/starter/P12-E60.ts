// P12-E60: שעון מוזרק
// כתוב וייצא (export):
//   interface Clock { now(): number }
//   class SystemClock implements Clock — Date.now()
//   class FakeClock implements Clock — constructor(start = 0); advance(ms) (שלילי → RangeError("אי אפשר לחזור בזמן"))
//   isExpired(expiresAt: number, clock: Clock): boolean — now() >= expiresAt
//
// הרצה:   node 12-design/starter/P12-E60.ts
// בדיקה:  npm run check P12-E60
