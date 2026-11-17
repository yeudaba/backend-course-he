// P29.5-E55: לוג ביקורת לכלי MCP
// כתוב וייצא:
//   type Result = { content: { type: "text"; text: string }[]; isError?: boolean };
//   type Handler<A> = (args: A) => Promise<Result>;
//   export function audited<A extends Record<string, unknown>>(tool: string, handler: Handler<A>, opts: { log: (entry: object) => void; customerId: number; now?: () => number; redact?: string[] }): Handler<A>
//
// בדיקה:  npm run check P29.5-E55
