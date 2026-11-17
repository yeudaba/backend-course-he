// P29-E57: לסווג פעם אחת לכל פנייה
// כתוב וייצא:
//   export function createClassifier(deps: { classify(text: string): Promise<{ category: string; urgency: string }>; repo: { get(ticketId: string): Promise<Saved | null>; save(ticketId: string, v: Saved): Promise<boolean> }; promptVersion: string }): (ticketId: string, text: string) => Promise<Saved & { cached: boolean }>
//
// בדיקה:  npm run check P29-E57
