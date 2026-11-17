// P14-E68: בודק לקובצי .http
export function lintHttpFile(text) {
  const lines = text.split(/\r?\n/);
  const defined = new Set();
  for (const line of lines) {
    const m = line.match(/^@(\w+)\s*=/);
    if (m) defined.add(m[1]);
  }
  const warnings = [];
  const warn = (line, text) => warnings.push({ line, text });
  let state = "before";
  let req = null;
  const endRequest = () => {
    if (req && req.hasBody && !req.hasType) warn(req.line, "יש גוף בלי Content-Type");
    req = null;
  };
  lines.forEach((line, i) => {
    const n = i + 1;
    for (const m of line.matchAll(/\{\{(\w+)\}\}/g)) {
      if (!defined.has(m[1])) warn(n, `המשתנה ${m[1]} לא הוגדר`);
    }
    if (line.startsWith("###")) {
      endRequest();
      state = "before";
      return;
    }
    const isComment = line.startsWith("#") || line.startsWith("//");
    if (state === "before") {
      if (line.trim() === "" || isComment || line.startsWith("@")) return;
      req = { line: n, hasBody: false, hasType: false };
      state = "headers";
    } else if (state === "headers") {
      if (line.trim() === "") state = "body";
      else if (isComment) return;
      else if (!/^[^\s:]+:\s*\S/.test(line)) warn(n, "header לא תקין");
      else if (line.split(":")[0].toLowerCase() === "content-type") req.hasType = true;
    } else if (line.trim() !== "") {
      req.hasBody = true;
    }
  });
  endRequest();
  return warnings.sort((a, b) => a.line - b.line).map((w) => `שורה ${w.line}: ${w.text}`);
}

const broken = `@base = http://localhost:4000

### כל המוצרים
GET {{baseUrl}}/products

### מוצר חדש
POST {{base}}/products
Content-Type: application/json
{
  "name": "מסך"
}

### בלי Content-Type
POST {{base}}/notes

{"text":"שלום"}`;
console.log(lintHttpFile(broken));
console.log(lintHttpFile("@base = http://x\n\n### a\nGET {{base}}/a\nAccept: */*\n"));
