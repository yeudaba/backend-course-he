// P15-E54: שגיאות של התחום ל־HTTP
// כתוב וייצא InsufficientFundsError(balance, amount), AccountNotFoundError(id), class Bank(balances: Map) עם withdraw(id, amount)
//   ו־createApp(bank): POST /accounts/:id/withdraw { amount } → { id, balance }; amount לא שלם חיובי → 400 VALIDATION
//   error handler: 404 ACCOUNT_NOT_FOUND · 409 INSUFFICIENT_FUNDS · 500 INTERNAL ("שגיאה פנימית")
//
// הרצה:   node 15-express/starter/P15-E54.ts
// בדיקה:  npm run check P15-E54
