// P12-E81: ממיר מטבעות — הרכבה ושגיאה משלך
// כתוב וייצא (export):
//   type RateSource = { rateOf(currency: string): number | undefined }  — כמה ₪ שווה יחידה אחת
//   class UnknownCurrencyError extends Error — constructor(currency); readonly currency;
//     הודעה "מטבע לא מוכר: USD"; name נכון
//   class Converter — constructor(source: RateSource) בשדה פרטי
//     toIls(amount, currency): number   — amount × שער, 2 ספרות; "ILS" ← amount בלי לשאול את המקור
//     fromIls(amountIls, currency): number — amountIls ÷ שער, 2 ספרות; "ILS" ← amountIls
//     שער חסר (undefined) או ≤ 0 ← UnknownCurrencyError
//
// הרצה:   node 12-design/starter/P12-E81.ts
// בדיקה:  npm run check P12-E81
