// P15-E64: פעולה שאינה CRUD: ביטול הזמנה
// כתוב וייצא type Order ו־createApp(orders: Order[]):
//   POST /orders/:id/cancel { reason? } — pending/paid → cancelled (+cancelledAt, cancelReason); cancelled → 200 בלי שינוי;
//   shipped → 409 ORDER_SHIPPED; לא קיים → 404 ORDER_NOT_FOUND · GET /orders/:id
//
// הרצה:   node 15-express/starter/P15-E64.ts
// בדיקה:  npm run check P15-E64
