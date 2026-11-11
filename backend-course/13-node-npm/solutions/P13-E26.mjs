// P13-E26: פירוק שורת לוג עם regex
const LINE = /^(?<ip>\S+) \S+ \S+ \[(?<time>[^\]]+)\] "(?<method>[A-Z]+) (?<path>\S+) HTTP\/[\d.]+" (?<status>\d{3}) (?<bytes>\d+|-)$/;

export function parseAccessLine(line) {
  const m = line.trim().match(LINE);
  if (!m) {
    return null;
  }
  const { ip, time, method, path, status, bytes } = m.groups;
  return {
    ip,
    time,
    method,
    path,
    status: Number(status),
    bytes: bytes === "-" ? 0 : Number(bytes),
  };
}

console.log(parseAccessLine('203.0.113.7 - - [10/Nov/2026:13:05:01 +0000] "GET /api/users?page=2 HTTP/1.1" 200 512'));
console.log(parseAccessLine('10.0.0.1 - dana [10/Nov/2026:13:05:02 +0000] "DELETE /api/users/7 HTTP/1.1" 204 -'));
console.log(parseAccessLine("משהו אחר לגמרי"));
