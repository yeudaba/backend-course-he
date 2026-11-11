// P12-E28: דוח הלקוחות הגדולים
// כתוב וייצא:
//   type Order = { id: number; userId: number; total: number; status: "paid" | "cancelled" }
//   type User = { id: number; name: string }
//   interface OrderRepository { findAll(): Promise<Order[]> }
//   interface UserRepository { findByIds(ids: number[]): Promise<User[]> }
//   class ReportService — constructor(orders: OrderRepository, users: UserRepository)
//     async topCustomers(n: number): Promise<{ name: string; total: number }[]>
//       רק paid, סכום לפי userId, מהגבוה לנמוך (שוויון → userId קטן קודם), n הראשונים.
//       שמות — בקריאה אחת ל־findByIds, רק ל־n שנבחרו. משתמש שלא נמצא → "לא ידוע".
//
// הרצה:   node 12-design/starter/P12-E28.ts
// בדיקה:  npm run check P12-E28
