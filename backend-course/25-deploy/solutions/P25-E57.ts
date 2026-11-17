// P25-E57: סודות מקבצים — NAME_FILE
export function resolveFileEnv(env: Record<string, string | undefined>, readFile: (path: string) => string) {
  const out: Record<string, string | undefined> = { ...env };
  for (const [key, path] of Object.entries(env)) {
    if (!key.endsWith("_FILE") || !path) continue;
    const name = key.slice(0, -"_FILE".length);
    if (env[name] !== undefined) throw new Error(`${name} ו־${name}_FILE מוגדרים שניהם`);
    let content: string;
    try {
      content = readFile(path);
    } catch {
      throw new Error(`לא ניתן לקרוא את ${name}_FILE`); // בלי הנתיב ובלי התוכן
    }
    out[name] = content.replace(/(\r?\n)+$/, "");
    delete out[key];
  }
  return out;
}
