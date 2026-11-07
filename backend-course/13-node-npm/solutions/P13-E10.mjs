// P13-E10
export function parseDotenv(text) {
  const result = {};
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "" || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) throw new Error(`שורה ${i + 1} לא תקינה`);
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    const q = value[0];
    if ((q === '"' || q === "'") && value.length >= 2 && value.at(-1) === q) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

console.log(parseDotenv('# db\nDATABASE_URL = postgres://a:b@h/db?x=1\nAPP_NAME="Dana Shop"\n\nEMPTY='));
