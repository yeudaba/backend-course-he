// P18-E53: מימוש קופון — פעם אחת לכל משתמש
// כתוב וייצא class AppError (עם code) ו־async function redeem(pool, code, userId): Promise<number>
//   transaction: הורדה אטומית של uses_left (> 0) + רישום ב־coupon_redemptions
//   COUPON_NOT_FOUND / COUPON_EXHAUSTED / ALREADY_REDEEMED (23505)
//
// בדיקה:  npm run check P18-E53
