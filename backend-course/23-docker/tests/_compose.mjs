// עוזר לבדיקות סטטיות של compose (בלי להריץ): קורא את הקובץ שלך כ־YAML
import assert from "node:assert/strict";
import YAML from "yaml";
import { target } from "../../tools/load.mjs";
import { readText } from "../../tools/docker.mjs";

export function compose(testUrl, file) {
  const doc = YAML.parse(readText(target(testUrl, file)));
  assert.ok(doc && typeof doc === "object" && doc.services, `ב־${file} אין services — כתוב את הקובץ`);
  return doc;
}
export const envOf = (s) => (Array.isArray(s?.environment) ? Object.fromEntries(s.environment.map((x) => [x.slice(0, x.indexOf("=")), x.slice(x.indexOf("=") + 1)])) : (s?.environment ?? {}));
export const testOf = (hc) => (Array.isArray(hc?.test) ? hc.test.join(" ") : String(hc?.test ?? ""));
