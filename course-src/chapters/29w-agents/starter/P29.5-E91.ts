// P29.5-E91: עלות לשיחה, מתוך spans
// כתוב וייצא:
//   type Span = { conversationId: string; kind: "model" | "tool"; costUsd?: number; ms: number; isError?: boolean };
//   type Row = { conversationId: string; steps: number; tools: number; toolErrors: number; costUsd: number; ms: number };
//   export function costPerConversation(spans: Span[]): Row[]
//
// בדיקה:  npm run check P29.5-E91
