// P12-E66: הכנסות לפי חודש
// כתוב וייצא (export):
//   type Order = { id; total; status: "paid" | "refunded" | "pending"; createdAt: string }
//   interface OrderRepository { findAll(): Promise<Order[]> }
//   class StatsService — constructor(orders: OrderRepository)
//     async revenueByMonth(year): Promise<Map<string, number>> — 12 חודשים "YYYY-MM" לפי הסדר;
//     paid מוסיף, refunded מוריד, pending לא נספר; 2 ספרות
//
// הרצה:   node 12-design/starter/P12-E66.ts
// בדיקה:  npm run check P12-E66
