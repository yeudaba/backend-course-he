// P20-E28: סיכום לקוח משני repositories — חזרה על Promise.all, reduce ו־interface
// כתוב וייצא interfaces Customer, Order, CustomersRepository, OrdersRepository, tokens CUSTOMERS_REPOSITORY / ORDERS_REPOSITORY,
//   מימושים בזיכרון (הנתונים בדף התרגילים), SummaryService (שני ה־repositories דרך @Inject(TOKEN)), SummaryModule
//   GET /customers/:id/summary → { customer, orders, total } — רק paid, סכום באגורות, לקוח והזמנות במקביל
//   לקוח לא קיים → 404 `לקוח ${id} לא נמצא`
//
// בדיקה:  npm run check P20-E28
