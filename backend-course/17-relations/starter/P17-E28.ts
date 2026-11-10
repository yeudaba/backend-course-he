// P17-E28: JOIN ו־GROUP BY בקוד — חזרה על Map, type ואגורות
// כתוב וייצא את הטיפוסים Customer { id, full_name, city: string | null }, Order { id, customer_id, status },
// OrderItem { order_id, quantity, unit_price }, CityRevenue { city, revenue }
// ו־revenueByCity(customers, orders, items): CityRevenue[] — כמו P17-E12, בלי SQL:
//   רק הזמנות שלא בוטלו, עיר null → "unknown", מהגדולה לקטנה (תיקו — לפי שם העיר)
//   סכום מדויק (באגורות), ו־"JOIN" עם Map לפי id — לא find בתוך לולאה.
//
// הרצה:   node 17-relations/starter/P17-E28.ts
// בדיקה:  npm run check P17-E28
