// P26.3-E47: retry ל־ThrottlingException
// כתוב וייצא async withAwsRetry(fn, { retries = 3, baseMs = 100, sleep, random = Math.random } = {})
//   retry רק על ThrottlingException / SlowDown / RequestLimitExceeded / סטטוס 500+
//   המתנה לפני ניסיון חוזר n: Math.floor(random() × baseMs × 2^n)
//
// בדיקה:  npm run check P26.3-E47
