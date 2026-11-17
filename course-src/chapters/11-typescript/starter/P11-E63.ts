// P11-E63: התראות: אימייל, SMS ו־push
// כתוב וייצא (export):
//   type Notice — email { to, subject } | sms { phone, text } | push { deviceId, title } (שדה kind)
//   describe(n: Notice): string — "אימייל ל־<to>: <subject>" / "SMS ל־<phone>: <text>" / "push ל־<deviceId>: <title>"
//   cost(n: Notice): number — email/push 0; sms 0.05 לכל 70 תווים (או חלק), מינימום אחת
//   בשתיהן: switch על kind עם default של never
//
// הרצה:   node 11-typescript/starter/P11-E63.ts
// בדיקה:  npm run check P11-E63
