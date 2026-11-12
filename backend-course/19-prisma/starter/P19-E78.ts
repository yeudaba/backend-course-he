// P19-E78: רשימת הזמנות — סינון, מיון, עמודים ו־count
// כתוב וייצא type ListQuery ו־async function listOrders(prisma, q) → { data: [{ id, customerId, status }], meta: { page, limit, total } }
//   status/customerId; sort createdAt|-createdAt (ברירת מחדל -createdAt) + id; page=1, limit=5; Promise.all, אותו where
//
// בדיקה:  npm run check P19-E78
