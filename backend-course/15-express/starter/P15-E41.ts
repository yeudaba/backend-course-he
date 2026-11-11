// P15-E41: סטטיסטיקה של הזמנות
// כתוב וייצא type Order = { id, customer, status: "paid" | "shipped" | "cancelled", totalAgorot, createdAt } ו־createApp(orders: Order[]):
//   GET /stats?from=YYYY-MM-DD&to=YYYY-MM-DD → { count, byStatus, revenueAgorot, topCustomer }
//   תאריך בתבנית אחרת → 400 { error: "תאריך לא תקין" }; cancelled לא נספר בהכנסה וב־topCustomer
//
// הרצה:   node 15-express/starter/P15-E41.ts
// בדיקה:  npm run check P15-E41
