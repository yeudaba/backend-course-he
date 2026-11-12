// P22-E69: expect משלך
// כתוב וייצא expect(actual) ← { toBe, toEqual, toMatchObject, toThrow } — כשל ← throw new Error(...)
//   toBe: Object.is | toEqual: לעומק, מתעלם ממפתחות עם undefined | toMatchObject: חלקי (מערכים — אותו אורך)
//   toThrow(expected?): מחרוזת ← ההודעה מכילה | RegExp | class ← instanceof
//
// הרצה:   node 22-testing/starter/P22-E69.ts
// בדיקה:  npm run check P22-E69
