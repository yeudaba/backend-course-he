// P29.5-E26: שומר לולאה לסוכן — מקובץ ריק
// כתוב וייצא:
//   stableKey(value): string — כמו JSON.stringify, אבל המפתחות של כל אובייקט ממוינים (בכל עומק). במערך הסדר נשמר
//   class LoopGuard — constructor({ maxSteps, maxRepeats, maxCostUsd })
//     check(tool, input, costUsd) → { ok: true } או { ok: false, reason: "steps" | "cost" | "repeat", message }
//       קודם סופרים את הצעד, העלות ואת הקריאה (tool + stableKey(input)); בודקים לפי הסדר steps, cost, repeat
//       steps > maxSteps · cost > maxCostUsd · אותה קריאה יותר מ־maxRepeats פעמים
//     get steps · get costUsd (מעוגל ל־4 ספרות) · שדות פרטיים (#)
//
// הרצה:   node 29w-agents/starter/P29.5-E26.ts
// בדיקה:  npm run check P29.5-E26
