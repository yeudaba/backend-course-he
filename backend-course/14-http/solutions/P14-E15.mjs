// P14-E15
function substitute(s, vars) {
  return s.replace(/\{\{(\w+)\}\}/g, (_, name) => {
    if (!(name in vars)) throw new Error(`משתנה לא מוגדר: ${name}`);
    return vars[name];
  });
}

export function parseHttpFile(text) {
  const vars = {};
  const blocks = [];
  let current = null;
  for (const line of text.replaceAll("\r\n", "\n").split("\n")) {
    if (line.startsWith("###")) {
      current = { name: line.slice(3).trim(), lines: [] };
      blocks.push(current);
    } else if (current) {
      current.lines.push(line);
    } else {
      const m = line.match(/^@(\w+)\s*=\s*(.*)$/);
      if (m) vars[m[1]] = m[2].trim();
    }
  }

  const requests = [];
  for (const { name, lines } of blocks) {
    let i = 0;
    const isSkippable = (l) => l.trim() === "" || l.startsWith("#") || l.startsWith("//");
    while (i < lines.length && isSkippable(lines[i])) i++;
    if (i === lines.length) continue;
    const [method, url] = lines[i].trim().split(/\s+/);
    i++;
    const headers = {};
    for (; i < lines.length && lines[i].trim() !== ""; i++) {
      const c = lines[i].indexOf(":");
      headers[lines[i].slice(0, c).trim()] = substitute(lines[i].slice(c + 1).trim(), vars);
    }
    const body = lines.slice(i).join("\n").trim();
    requests.push({ name, method, url: substitute(url, vars), headers, body: body === "" ? undefined : substitute(body, vars) });
  }
  return requests;
}

const file = `@base = http://localhost:4000
@token = let-me-in

### כל המוצרים
GET {{base}}/products

### אזור מוגן
# דורש טוקן
GET {{base}}/secret
Authorization: Bearer {{token}}
`;
for (const r of parseHttpFile(file)) console.log(JSON.stringify(r));
