// P23-E27 — קורא קובץ .env
export function parseEnv(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (line === "" || line.startsWith("#")) continue;
    if (line.startsWith("export ")) line = line.slice("export ".length).trim();

    const eq = line.indexOf("=");
    if (eq === -1) throw new SyntaxError(`שורה ${i + 1}: חסר =`);
    const key = line.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) throw new SyntaxError(`שורה ${i + 1}: שם לא חוקי: ${key}`);

    let value = line.slice(eq + 1).trim();
    if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1).replaceAll("\\n", "\n");
    } else if (value.length >= 2 && value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    } else {
      const hash = value.indexOf(" #");
      if (hash !== -1) value = value.slice(0, hash).trim();
    }
    result[key] = value;
  }
  return result;
}

const env = parseEnv(`
# מסד הנתונים
DATABASE_URL=postgres://app:secret@db:5432/app?sslmode=disable
export PORT = 3000   # הפורט בתוך הקונטיינר
GREETING="שלום\\nעולם"
PATTERN='a#b\\n'
EMPTY=
PORT=8080
`);
console.log(env);
try {
  parseEnv("A=1\n2B=oops");
} catch (err) {
  console.log((err as Error).name, (err as Error).message);
}
