const LOG_LINE = /^(\S+) (GET|POST|PUT|PATCH|DELETE) (\/\S*) (\d{3}) (\d+)ms$/;

export function summarizeLog(text) {
  const summary = { total: 0, skipped: 0, byStatus: {}, slowest: null };
  for (const line of text.split(/\r?\n/)) {
    if (line.trim() === "") {
      continue;
    }
    const m = line.match(LOG_LINE);
    if (m === null) {
      summary.skipped++;
      continue;
    }
    const [, , , path, status, msText] = m;
    const ms = Number(msText);
    summary.total++;
    summary.byStatus[status] = (summary.byStatus[status] ?? 0) + 1;
    if (summary.slowest === null || ms > summary.slowest.ms) {
      summary.slowest = { path, ms };
    }
  }
  return summary;
}

console.log(summarizeLog("2026-11-19T08:30:00Z GET /tasks 200 13ms\nserver started\n2026-11-19T08:30:02Z GET /tasks/9 404 40ms"));
console.log(summarizeLog(""));
