// P28.5-E70: ייבוא NDJSON באצוות
// כתוב וייצא:
//   export function importNdjson(lines: AsyncIterable<string>, insertMany: (rows: { id: number; name: string }[]) => Promise<number>, batchSize?: number): Promise<{ inserted: number; batches: number; skipped: number; errors: string[] }>
//
// בדיקה:  npm run check P28.5-E70
