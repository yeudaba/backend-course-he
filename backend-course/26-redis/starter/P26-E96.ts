// P26-E96: JobsService — עבודות עם jobId קבוע
// כתוב וייצא createJobs(connection, prefix) → { queue, add(name, orderId, delayMs = 0), close }
//   Queue בשם shop · רק order-confirmation / expire-order · jobId <name>-<orderId>
//   5 ניסיונות, exponential 1000, removeOnComplete 1000, removeOnFail 5000
//
// בדיקה:  npm run check P26-E96
