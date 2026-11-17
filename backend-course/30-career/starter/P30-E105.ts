// P30-E105: מה השתנה בתלויות
// כתוב וייצא:
//   type Pkg = { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
//   export function depChanges(before: Pkg, after: Pkg): { added: string[]; removed: string[]; major: string[]; needsReview: boolean }
//
// בדיקה:  npm run check P30-E105
