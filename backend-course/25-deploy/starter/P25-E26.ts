// P25-E26: feature flags עם פריסה הדרגתית
// כתוב וייצא:
//   type Flag = { enabled: boolean; percent: number; allow?: string[] }
//   bucketOf(flagName, userId): number — sha256 של `${flagName}:${userId}`, readUInt32BE(0) של ה־digest, % 100
//   isEnabled(flags: Record<string, Flag>, flagName, userId): boolean
//     לא קיים / כבוי ← false | ב־allow ← true | אחרת bucketOf(...) < percent
//
// הרצה:   node 25-deploy/starter/P25-E26.ts
// בדיקה:  npm run check P25-E26
