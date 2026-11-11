// P14-E41: ספירת תשובות לפי טווח
export function countByCategory(lines) {
  const counts = { "2xx": 0, "3xx": 0, "4xx": 0, "5xx": 0, invalid: 0 };
  for (const line of lines) {
    if (line.trim() === "") continue;
    const parts = line.trim().split(/\s+/);
    const status = Number(parts[2]);
    if (parts.length !== 4 || !Number.isInteger(status) || status < 100 || status > 599) {
      counts.invalid++;
      continue;
    }
    const key = `${Math.floor(status / 100)}xx`;
    if (key in counts) counts[key]++;
  }
  return counts;
}

console.log(
  countByCategory(["GET /products 200 12", "POST /orders 201 40", "GET /x 404 3", "", "GET /y 503 1000", "oops", "GET /z 99 1", "GET  /a  301  5", "GET /b 101 1"]),
);
