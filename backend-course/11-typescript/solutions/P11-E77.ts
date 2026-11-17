// P11-E77: הגדרות שרת — עם הודעת שגיאה מדויקת
export type Config = { host: string; port: number; debug: boolean };

export function parseConfig(raw: unknown): Config {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new Error("ההגדרות חייבות להיות אובייקט");
  }
  if (!("host" in raw) || typeof raw.host !== "string" || raw.host.trim() === "") {
    throw new Error("host לא תקין");
  }
  if (!("port" in raw) || typeof raw.port !== "number" || !Number.isInteger(raw.port) || raw.port < 1 || raw.port > 65535) {
    throw new Error("port לא תקין");
  }
  let debug = false;
  if ("debug" in raw) {
    if (typeof raw.debug !== "boolean") throw new Error("debug לא תקין");
    debug = raw.debug;
  }
  return { host: raw.host, port: raw.port, debug };
}

console.log(parseConfig({ host: "localhost", port: 3000 }));
for (const bad of [[], { host: "x", port: "3000" }, { host: "x", port: 80, debug: "yes" }]) {
  try {
    parseConfig(bad);
  } catch (err) {
    console.log(err instanceof Error ? err.message : err);
  }
}
