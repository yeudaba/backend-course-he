// P29-E58: ‏processor לתור: לנסות שוב, או לבן אדם?
// כתוב וייצא:
//   export function processTicket(job: { data: { ticketId: string; text: string }; attemptsMade: number; opts: { attempts: number } }, deps: { client: Anthropic; markNeedsHuman(id: string, reason: string): Promise<void>; saveCategory(id: string, category: string): Promise<void> }): Promise<{ status: "classified" | "needs_human" }>
//
// בדיקה:  npm run check P29-E58
