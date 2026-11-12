// P26.3-E57: ייצוא CSV ל־S3
// כתוב וייצא:
//   toCsv(rows) → כותרת + שורות, \r\n בין ובסוף · null ← ריק · Date ← ISO · פסיק/מירכאות/שורה ← במירכאות
//   exportCsv(s3, bucket, key, rows) → { rows, bytes } · BOM בהתחלה · ContentType: text/csv; charset=utf-8
//
// בדיקה:  npm run check P26.3-E57
