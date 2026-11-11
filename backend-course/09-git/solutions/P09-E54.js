function toExample(envText, keep = []) {
  const out = [];
  for (const line of envText.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) {
      out.push(line);
      continue;
    }
    const eq = line.indexOf("=");
    if (eq === -1) {
      continue;
    }
    const key = line.slice(0, eq).trim();
    out.push(keep.includes(key) ? `${key}=${line.slice(eq + 1)}` : `${key}=`);
  }
  return out.join("\n");
}

console.log(toExample("# DB\nDATABASE_URL=postgres://u:p@h/db\nPORT=3000\n\nJWT_SECRET=abc=def", ["PORT"]));

module.exports = { toExample };
