// P26.3-E56: קבלה רק לבעלים — כתובת חתומה להורדה
// כתוב וייצא async receiptLink(s3, bucket, { userId, orderId, ownerOf }) → { status: 200, url } | { status: 404 }
//   לא הבעלים / אין receipts/<orderId>.pdf ← 404 · כתובת ל־GetObject ל־60 שניות, עם attachment; filename="receipt-<orderId>.pdf"
//
// בדיקה:  npm run check P26.3-E56
