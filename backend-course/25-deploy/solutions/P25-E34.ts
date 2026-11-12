// P25-E34: מלכודות של YAML
import { load } from "js-yaml";

export function yamlTraps(text: string) {
  const traps: { line: number; key: string; raw: string; parsed: unknown }[] = [];
  text.split("\n").forEach((line, i) => {
    const m = /^\s*(?:-\s+)?([\w-]+):\s+(.*)$/.exec(line);
    if (!m) return;
    const raw = m[2].replace(/\s+#.*$/, "").trim();
    if (raw === "" || /^["'[{|>&*$]/.test(raw)) return;
    const parsed = load(raw);
    if (typeof parsed !== "string" && String(parsed) !== raw) traps.push({ line: i + 1, key: m[1], raw, parsed });
  });
  return traps;
}

console.log(yamlTraps(`with:
  node-version: 24
  python-version: 3.10   # לא 3.1!
  port: 08
  enabled: true
  ratio: 1e3
  name: "1.10"`));
