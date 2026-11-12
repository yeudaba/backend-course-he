// P24-E43: הסיפור של בקשה אחת
type Entry = Record<string, unknown>;

function parse(line: string): Entry | null {
  try {
    const v: unknown = JSON.parse(line);
    return v !== null && typeof v === "object" && !Array.isArray(v) ? (v as Entry) : null;
  } catch {
    return null;
  }
}

const entries = (lines: string[]) => lines.map(parse).filter((e): e is Entry => e !== null);

export function requestStory(lines: string[], requestId: string) {
  const events = entries(lines)
    .filter((e) => e.requestId === requestId)
    .sort((a, b) => (String(a.time) < String(b.time) ? -1 : String(a.time) > String(b.time) ? 1 : 0));
  const req = events.find((e) => e.msg === "request");
  const summary = req ? `${req.method} ${req.path} → ${req.status} (${req.durationMs}ms)` : null;
  return { events, summary };
}

export function requestIdsForUser(lines: string[], userId: number): string[] {
  const ids = new Set<string>();
  for (const e of entries(lines)) if (e.userId === userId && typeof e.requestId === "string") ids.add(e.requestId);
  return [...ids];
}

const log = [
  '{"time":"2026-11-07T15:31:02.503Z","level":"error","msg":"request","requestId":"9d1e","userId":3,"method":"GET","path":"/tasks","status":500,"durationMs":3}',
  "Error: connect ECONNREFUSED",
  '{"time":"2026-11-07T15:31:02.501Z","level":"error","msg":"connect ECONNREFUSED","requestId":"9d1e"}',
];
const story = requestStory(log, "9d1e");
console.log(story.events.map((e) => e.msg), story.summary, requestIdsForUser(log, 3));
