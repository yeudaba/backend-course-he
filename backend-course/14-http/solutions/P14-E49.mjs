// P14-E49: פירוק שורת status
export function parseStatusLine(line) {
  const [first, code = "", ...rest] = line.trim().split(" ");
  const status = Number(code);
  if (!first.startsWith("HTTP/") || first.length === 5 || !/^\d{3}$/.test(code) || status < 100 || status > 599) {
    throw new Error(`שורת status לא תקינה: ${line}`);
  }
  return { version: first.slice(5), status, text: rest.join(" ") };
}

console.log(parseStatusLine("HTTP/1.1 404 Not Found"));
console.log(parseStatusLine("HTTP/2 200"));
console.log(parseStatusLine("HTTP/1.1 503 Service Unavailable"));
for (const bad of ["404 Not Found", "HTTP/1.1 OK", "HTTP/1.1 99 Old", "HTTP/1.1 2000 Big"]) {
  try {
    parseStatusLine(bad);
  } catch (err) {
    console.log(err.message);
  }
}
