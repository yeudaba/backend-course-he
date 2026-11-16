// P29.5-E79: כלי שרץ פעם אחת לכל tool_use
// כתוב וייצא:
//   type Store = { get(id: string): Promise<string | null>; set(id: string, value: string): Promise<void> };
//   export function idempotentTool(run: (input: unknown) => Promise<string>, store: Store): (toolUseId: string, input: unknown) => Promise<string>
//
// בדיקה:  npm run check P29.5-E79
