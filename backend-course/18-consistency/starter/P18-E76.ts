// P18-E76: פיד עם cursor אטום
// כתוב וייצא class AppError (עם code), encodeCursor(createdAt, id), decodeCursor(cursor) (BAD_CURSOR),
//   ו־async function feed(pool, { customerId, cursor?, limit = 20 }) → { data: [{ id, total }], nextCursor }
//   created_at DESC, id DESC; limit 1–100 (BAD_LIMIT); nextCursor רק אם יש עוד (limit + 1)
//
// בדיקה:  npm run check P18-E76
