// P26-E84: POST /pay שעונה מיד ושולח לתור
// כתוב וייצא payApp({ queue, markPaid }) ← אפליקציית Express
//   POST /orders/:id/pay · id לא תקין ← 400 · markPaid החזיר false ← 404
//   אחרת: עבודה order-confirmation { orderId }, jobId confirm-<id>, 3 ניסיונות, exponential ← 202 { status: "paid" }
//
// בדיקה:  npm run check P26-E84
