// P29.5-E34: כלים במקביל, עם timeout לכל כלי
// כתוב וייצא:
//   type Tool = { run(input: unknown): Promise<string> };
//   export function runToolCalls(calls: { id: string; name: string; input: unknown }[], tools: Record<string, Tool>, opts: { timeoutMs: number }): Promise<Anthropic.ToolResultBlockParam[]>
//
// בדיקה:  npm run check P29.5-E34
