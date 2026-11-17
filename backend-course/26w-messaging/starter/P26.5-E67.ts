// P26.5-E67: heartbeat ל־visibility בזמן עבודה ארוכה
// כתוב וייצא async withVisibilityHeartbeat(sqs, queueUrl, receiptHandle, work, { visibilitySeconds, everyMs })
//   כל everyMs: ChangeMessageVisibility · בסוף (גם בשגיאה) — עוצרים · מחזירה את התוצאה של work
//
// בדיקה:  npm run check P26.5-E67
