// P13-E64: מה חסר לי ב־.env?
function parse(text) {
  const map = new Map();
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (t === "" || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    let value = t.slice(i + 1).trim();
    const q = value.match(/^(["'])(.*)\1$/);
    if (q) value = q[2];
    if (!map.has(key)) map.set(key, value);
  }
  return map;
}

export function envDiff(exampleText, envText) {
  const example = parse(exampleText);
  const env = parse(envText);
  const missing = [...example.keys()].filter((k) => !env.has(k));
  const empty = [...example.keys()].filter((k) => env.has(k) && env.get(k) === "");
  const extra = [...env.keys()].filter((k) => !example.has(k));
  return { missing, empty, extra };
}

const example = "PORT=8080\nDATABASE_URL=\nJWT_SECRET=\nREDIS_URL=\n";
const env = 'PORT=8080\nDATABASE_URL=postgres://localhost/shop\nJWT_SECRET=""\nOLD_FLAG=1\n';
console.log(envDiff(example, env));
