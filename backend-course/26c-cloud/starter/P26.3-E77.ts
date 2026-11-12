// P26.3-E77: checksum ל־ConfigMap — שינוי הגדרות ← rollout
// כתוב וייצא:
//   configChecksum(data) → sha256 hex של "key=value\n" לפי מפתחות ממוינים
//   withConfigChecksum(deployment, data) → עותק עם spec.template.metadata.annotations["checksum/config"]
//
// בדיקה:  npm run check P26.3-E77
