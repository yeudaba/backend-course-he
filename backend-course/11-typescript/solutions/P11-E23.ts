// P11-E23: validation במקום as
export type Settings = { theme: "light" | "dark"; pageSize: number };

export function loadSettings(json: string): Settings {
  const data: unknown = JSON.parse(json);
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error("הגדרה לא תקינה: root");
  }

  let theme: Settings["theme"] = "light";
  if ("theme" in data) {
    if (data.theme !== "light" && data.theme !== "dark") {
      throw new Error("הגדרה לא תקינה: theme");
    }
    theme = data.theme;
  }

  let pageSize = 20;
  if ("pageSize" in data) {
    const p = data.pageSize;
    if (typeof p !== "number" || !Number.isInteger(p) || p < 1 || p > 100) {
      throw new Error("הגדרה לא תקינה: pageSize");
    }
    pageSize = p;
  }

  return { theme, pageSize };
}

console.log(loadSettings('{"theme":"dark"}'));
try {
  loadSettings('{"pageSize":"20"}');
} catch (err) {
  console.log((err as Error).message);
}
