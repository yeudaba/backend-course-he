// P29.5-E48: רק הכלים שאישרנו
// כתוב וייצא:
//   type ToolsClient = {
//     listTools(params?: { cursor?: string }): Promise<{ tools: { name: string }[]; nextCursor?: string }>;
//     callTool(p: { name: string; arguments?: Record<string, unknown> }): Promise<{ content: unknown[]; isError?: boolean }>;
//   };
//   export function allowlist(client: ToolsClient, allowed: string[]): ToolsClient
//
// בדיקה:  npm run check P29.5-E48
