// P29-E52: ‏JSON עם ניסיון תיקון אחד
// כתוב וייצא:
//   export function askJson<T>(client: Anthropic, params: { system: string; question: string }, schema: z.ZodType<T>, maxAttempts?: number): Promise<{ ok: true; data: T; attempts: number } | { ok: false; attempts: number; issues: string[] }>
//
// בדיקה:  npm run check P29-E52
