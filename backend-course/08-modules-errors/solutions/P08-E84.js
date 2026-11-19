const LOG_LINE = /^(\S+) (GET|POST|PUT|PATCH|DELETE) (\/\S*) (\d{3}) (\d+)ms$/;

function parseLogLine(line) {
  const m = line.match(LOG_LINE);
  if (m === null) {
    return null;
  }
  const [, time, method, path, status, ms] = m;
  return { time, method, path, status: Number(status), ms: Number(ms) };
}

console.log(parseLogLine("2026-11-19T08:30:00Z GET /tasks/42 200 13ms"));
console.log(parseLogLine("2026-11-19T08:30:01Z DELETE /tasks/7 404 2ms"));
console.log(parseLogLine("server started"));
console.log(parseLogLine("2026-11-19T08:30:00Z GET  /tasks 200 13ms"));

module.exports = { parseLogLine };
