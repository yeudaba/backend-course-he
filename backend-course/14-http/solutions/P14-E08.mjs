// P14-E08
export function parseHeaders(lines) {
  const result = {};
  for (const line of lines) {
    const i = line.indexOf(":");
    if (i <= 0) throw new Error(`header לא תקין: ${line}`);
    const name = line.slice(0, i).trim().toLowerCase();
    const value = line.slice(i + 1).trim();
    result[name] = name in result ? `${result[name]}, ${value}` : value;
  }
  return result;
}

console.log(JSON.stringify(parseHeaders(["Content-Type: application/json", "Accept: text/html", "accept: application/json", "Authorization: Basic a:b"])));
