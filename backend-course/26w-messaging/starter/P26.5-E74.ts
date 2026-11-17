// P26.5-E74: claim check — הודעה גדולה דרך S3
// כתוב וייצא:
//   async sendClaimCheck({ s3, sqs }, { bucket, queueUrl }, payload, limitBytes = 200000) → "inline" | "s3"
//   async readClaimCheck(s3, bucket, body) → payload
//
// בדיקה:  npm run check P26.5-E74
