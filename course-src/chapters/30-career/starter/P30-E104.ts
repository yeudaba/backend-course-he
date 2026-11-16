// P30-E104: ‏mutation testing בקטן
// כתוב וייצא:
//   type Suite<T> = (impl: T) => void | Promise<void>;
//   export function runMutants<T>(suite: Suite<T>, correct: T, mutants: { name: string; impl: T }[]): Promise<{ passesOnCorrect: boolean; killed: string[]; survived: string[] }>
//
// בדיקה:  npm run check P30-E104
