// P29.5-E50: כמה שרתים, שמות בלי התנגשות
// כתוב וייצא:
//   type ServerTools = { prefix: string; tools: { name: string; description?: string; inputSchema: Record<string, unknown> }[] };
//   export function mergeTools(servers: ServerTools[]): { tools: Anthropic.Tool[]; route(name: string): { prefix: string; tool: string } | null }
//
// בדיקה:  npm run check P29.5-E50
