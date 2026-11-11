// P17-E43: בודק FK בזיכרון
// כתוב וייצא את הטיפוס Data ואת checkForeignKeys(data): string[]
//   הודעה לכל FK שמצביע על שורה חסרה, בנוסח של PostgreSQL:
//   Key (customer_id)=(99) is not present in table "customers".
//   סדר: הזמנות, ואז פריטים (order_id ואז product_id). עם Set — לא find/some בתוך לולאה.
//
// בדיקה:  npm run check P17-E43
