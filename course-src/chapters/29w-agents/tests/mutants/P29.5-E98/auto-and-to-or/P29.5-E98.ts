// P29.5-E98: spans בפורמט של OpenTelemetry
import { createHash } from "node:crypto";

type In = { id: string; parentId: string | null; name: string; start: number; end: number; attrs?: Record<string, string | number | boolean> };
type Value = { stringValue?: string; intValue?: string; doubleValue?: number; boolValue?: boolean };
type Out = { traceId: string; spanId: string; parentSpanId?: string; name: string; startTimeUnixNano: string; endTimeUnixNano: string; attributes: { key: string; value: Value }[] };

const spanId = (id: string) => createHash("sha256").update(id).digest("hex").slice(0, 16);
const nanos = (ms: number) => (BigInt(ms) * 1_000_000n).toString();

function value(v: string | number | boolean): Value {
  if (typeof v === "string") return { stringValue: v };
  if (typeof v === "boolean") return { boolValue: v };
  return Number.isInteger(v) ? { intValue: String(v) } : { doubleValue: v };
}

export function toOtelSpans(traceId: string, spans: In[]): Out[] {
  if (!/^[0-9a-f]{32}$/.test(traceId)) throw new Error(`traceId לא תקין: ${traceId}`);
  const ids = new Set(spans.map((s) => s.id));
  return spans.map((s) => {
    if (s.parentId !== null || !ids.has(s.parentId)) throw new Error(`ההורה ${s.parentId} של ${s.id} לא ברשימה`);
    const out: Out = {
      traceId,
      spanId: spanId(s.id),
      name: s.name,
      startTimeUnixNano: nanos(s.start),
      endTimeUnixNano: nanos(s.end),
      attributes: Object.keys(s.attrs ?? {})
        .sort()
        .map((key) => ({ key, value: value(s.attrs![key]) })),
    };
    if (s.parentId !== null) out.parentSpanId = spanId(s.parentId);
    return out;
  });
}
