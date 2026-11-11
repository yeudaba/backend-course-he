// P14-E65: לפרק פלט של curl -v
function headersOf(lines) {
  const headers = {};
  for (const line of lines.slice(1)) {
    const i = line.indexOf(":");
    if (line.trim() === "" || i === -1) continue;
    headers[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim();
  }
  return headers;
}

export function parseVerbose(text) {
  const lines = text.split(/\r?\n/);
  const sent = lines.filter((l) => l.startsWith("> ") || l === ">").map((l) => l.slice(2));
  const got = lines.filter((l) => l.startsWith("< ") || l === "<").map((l) => l.slice(2));
  let request = null;
  let response = null;
  if (sent.length) {
    const [method, path] = sent[0].split(" ");
    request = { method, path, headers: headersOf(sent) };
  }
  if (got.length) {
    response = { status: Number(got[0].split(" ")[1]), headers: headersOf(got) };
  }
  return { request, response };
}

const sample = `* Host localhost:4000 was resolved.
> GET /products/1 HTTP/1.1
> Host: localhost:4000
> Accept: */*
> 
< HTTP/1.1 200 OK
< Content-Type: application/json; charset=utf-8
< Date: Wed, 11 Nov 2026 13:27:53 GMT
< 
{"id":1,"name":"מקלדת","price":249}`;
console.log(JSON.stringify(parseVerbose(sample), null, 2));
console.log(parseVerbose("* Could not resolve host: nope.test"));
