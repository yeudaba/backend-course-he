// P29.5-E98: ‏spans בפורמט של OpenTelemetry
// כתוב וייצא:
//   type In = { id: string; parentId: string | null; name: string; start: number; end: number; attrs?: Record<string, string | number | boolean> };
//   type Value = { stringValue?: string; intValue?: string; doubleValue?: number; boolValue?: boolean };
//   type Out = { traceId: string; spanId: string; parentSpanId?: string; name: string; startTimeUnixNano: string; endTimeUnixNano: string; attributes: { key: string; value: Value }[] };
//   export function toOtelSpans(traceId: string, spans: In[]): Out[]
//
// בדיקה:  npm run check P29.5-E98
