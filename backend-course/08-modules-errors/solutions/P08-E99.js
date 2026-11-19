const LINE = /^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/;
const QUOTED = /^"(.*)"$/;

function parseEnv(text) {
  const env = {};
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "" || line.startsWith("#")) {
      continue;
    }
    const m = line.match(LINE);
    if (m === null) {
      throw new Error(`שורה ${i + 1}: לא בפורמט KEY=VALUE: "${lines[i]}"`);
    }
    const [, key, raw] = m;
    const quoted = raw.match(QUOTED);
    env[key] = quoted === null ? raw : quoted[1];
  }
  return env;
}

console.log(parseEnv('# שרת\nPORT = 3000\n\nAPP_NAME="My App"\nDB_URL=postgres://u:p@h/db?x=1'));
try {
  parseEnv("PORT=3000\nport=4000");
} catch (err) {
  console.log(`✘ ${err.message}`);
}

module.exports = { parseEnv };
