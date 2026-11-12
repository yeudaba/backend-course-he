// P20-E64: interceptor של idempotency
// כתוב וייצא IDEMPOTENCY_STORE (token), IdempotencyInterceptor, PaymentsController, PaymentsModule
//   Idempotency-Key שכבר נראה ← התוצאה השמורה, בלי handler, עם Idempotent-Replayed: true; כישלון — לא נשמר
//   POST /payments { amount } ← 201 { id, amount } | GET /payments/count ← { count }
//   המטמון: useFactory: () => new Map()
//
// בדיקה:  npm run check P20-E64
