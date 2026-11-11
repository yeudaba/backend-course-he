// P12-E46: אין מספיק כסף
// כתוב וייצא (export):
//   class InsufficientFundsError extends Error — (needed, available) readonly; הודעה "נדרשים 150, יש 100"; name נכון
//   class AccountLockedError extends Error — "החשבון נעול"; name נכון
//   withdraw(balance, amount, locked): number — קודם נעילה, אחר כך יתרה
//
// הרצה:   node 12-design/starter/P12-E46.ts
// בדיקה:  npm run check P12-E46
