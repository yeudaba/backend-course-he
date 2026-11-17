// P29-E71: כלים לפי תפקיד
// כתוב וייצא:
//   type Entry = { tool: Anthropic.Tool; roles: string[]; handler: (input: unknown) => Promise<string> };
//   export function toolsForRole(role: string, registry: Entry[]): {
//     tools: Anthropic.Tool[];
//     run(name: string, input: unknown): Promise<{ content: string; is_error?: true }>;
//   }
//
// בדיקה:  npm run check P29-E71
