// P11-E67: יתרה מאירועים — עם union
// כתוב וייצא (export):
//   type AccountEvent — deposit { amount } | withdraw { amount } | fee { amount, reason } | freeze (שדה type)
//   balance(events): number — אחרי freeze מתעלמים מכל השאר
//   feeReasons(events): string[] — הסיבות של כל העמלות, לפי הסדר
//
// הרצה:   node 11-typescript/starter/P11-E67.ts
// בדיקה:  npm run check P11-E67
