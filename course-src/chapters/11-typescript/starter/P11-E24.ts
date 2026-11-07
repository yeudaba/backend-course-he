// P11-E24: event bus מוקלד
export type AppEvent =
  | { type: "order.created"; orderId: number; total: number }
  | { type: "order.paid"; orderId: number; amount: number }
  | { type: "user.signedUp"; userId: number; email: string };

// מחזירה { on, emit, history }
// on(type, handler) — handler מקבל רק את סוג האירוע הזה
// emit(event) — מפעיל handlers של הסוג לפי סדר רישום
// history() — עותק של כל האירועים שנשלחו
export function createBus() {
  // כתוב כאן
}
